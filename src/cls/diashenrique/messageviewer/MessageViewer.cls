Include Ensemble

Class diashenrique.messageviewer.MessageViewer Extends %CSP.Page
{

Parameter CHARSET = "utf-8";

ClassMethod OnPage() As %Status
{
	#dim %request As %CSP.Request
	#dim %response As %CSP.Response

	Set Method = $Get(%request.Data("method",1))

	Xecute "do .."_Method_"()"

	Quit $$$OK
}

Query select() As %SQLQuery
{
SELECT TOP 200 
	ID, 
	Banked, 
	BusinessProcessId, 
	CorrespondingMessageId, 
	Description, 
	ErrorStatus, 
	%EXTERNAL(Invocation) AS Invocation, 
	CASE IsError 
		WHEN 1 THEN 'Error' 
		ELSE 'OK' END 
		AS Error,
	MessageBodyClassName,
	MessageBodyId,
	%EXTERNAL(Priority) AS Priority,
	Resent,
	ReturnQueueName,
	SessionId,
	%EXTERNAL(SourceBusinessType) AS SourceBusinessType,
	SourceConfigName, 
	%EXTERNAL(Status) AS Status,
	SuperSession,
	%EXTERNAL(TargetBusinessType) AS TargetBusinessType,
	TargetConfigName, TargetQueueName,
	{fn LEFT(%EXTERNAL(TimeCreated),10 )} AS DateCreated,
	{fn RIGHT(%EXTERNAL(TimeCreated),12 )} AS TimeCreated, 
	{fn LEFT(%EXTERNAL(TimeProcessed),10 )} AS DateProcessed,
	{fn RIGHT(%EXTERNAL(TimeProcessed),12 )} AS TimeProcessed,  
	%EXTERNAL(Type) AS Type 
FROM Ens.MessageHeader 
WHERE SessionId = %ID 
ORDER BY SessionId DESC
}

/// do ##class(diashenrique.messageviewer.MessageViewer).getMessageHeader()
ClassMethod getMessageHeader() As %Status
{
	#Dim %request As %CSP.Request

	New $Namespace
	Set $Namespace = %request.Get("pNamespace","ENSEMBLE")

	Set tSC = $System.Status.OK()
	Set arrayMessage = []

	Try {
		#Dim result As %SQL.ISelectResult
		Set result = ..selectFunc()
		
		#Dim metadata As %SQL.StatementMetadata
		Set metadata = result.%GetMetadata()
		Set intcolumnCount = metadata.columnCount
		Set columns = ""
		For i=1:1:intcolumnCount {
			Set columns = columns _ $lb(metadata.columns.GetAt(i).colName)
		}
		Kill metadata
			
		If (result.%SQLCODE '< 0) {
			While result.%Next() {
				Set json = { }
				For i=1:1:intcolumnCount {
					Do json.%Set($lg(columns, i), result.%GetData(i))
				}
				Do arrayMessage.%Push(json)
			}
		}
		Else {
			Throw ##class(%Exception.SQL).CreateFromSQLCODE(result.%SQLCODE, result.%Message)
		}
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}

	Write arrayMessage.%ToJSON() 

	Quit tSC
}

/// do ##class(diashenrique.messageviewer.MessageViewer).getEnsembleNamespace()
ClassMethod getEnsembleNamespace() As %Status
{

	New $Namespace
	Set $Namespace = "%SYS"

	Set tSC = $System.Status.OK()
	Set arrayEnsNamespace = []

	Try {

		Set oRS = ##class(%SQL.Statement).%New()

		Set tSC = oRS.%PrepareClassQuery("Config.Namespaces", "List")

		Quit:$System.Status.IsError(tSC)

		Set result = oRS.%Execute()

		If (result.%SQLCODE '< 0) {
			While result.%Next() {
				Set json = { }

				;Ensemble Namespace Only
				Continue:(##class(%Library.EnsembleMgr).IsEnsembleNamespace(result.%GetData(1)) = 0)

		  		Do json.%Set("id",result.%GetData(1))
				Do json.%Set("text",result.%GetData(1)) 
				Do arrayEnsNamespace.%Push(json)
			}
		}
		Else {
			Throw ##class(%Exception.SQL).CreateFromSQLCODE(result.%SQLCODE,result.%Message)
		}
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}

	Write arrayEnsNamespace.%ToJSON() 

	Quit tSC
}

ClassMethod Resend(pNamespace, pIdResend) As %Status
{

	New $Namespace
	Set $Namespace = pNamespace

	Set tSC = $$$OK

	Set lenIds = $Length(pIdResend,",")

	For i=1:1:lenIds {
		Set idMensagem = $Piece(pIdResend,",",i)
		Set tSC = ##class(Ens.MessageHeader).ResendDuplicatedMessage(idMensagem)
		Quit:$$$ISERR(tSC)
	}

	Quit tSC
}

}
