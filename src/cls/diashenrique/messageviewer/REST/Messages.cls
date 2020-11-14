Class diashenrique.messageviewer.REST.Messages Extends %CSP.REST
{

Query select() As %SQLQuery
{
SELECT  
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
	%EXTERNAL(Type) AS Type, 
	Count(*) As totalCount  
FROM Ens.MessageHeader 
WHERE SessionId = %ID 
ORDER BY SessionId DESC
}

ClassMethod getUnlimitedMessages(pNamespace As %String) As %Status
{
    Set %response.ContentType = "application/json"

	New $Namespace
    If (pNamespace '= "") {
        Set $Namespace = pNamespace
    } else {
        Set $Namespace = "ENSEMBLE"
    }

	Set tSC = $System.Status.OK()
	Set arrayMessage = []
	Set jsonTop= {}

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

	do jsonTop.%Set("data",arrayMessage)
	do jsonTop.%Set("totalCount",result.totalCount)
	do jsonTop.%Set("groupCount",1)
	Write jsonTop.%ToJSON()

	Quit tSC
}

/// pNamespace, pIdResend
ClassMethod ResendMessage() As %Status
{

	Set obj = ##class(%DynamicAbstractObject).%FromJSON(%request.Content.Read())

	New $Namespace

	If (obj.namespace '= "") {
		Set $Namespace = obj.namespace
	} else {
		Quit "No Namespace"
	}

	Set tSC = $$$OK

	Set lenIds = $Length(obj.id,",")

	For i=1:1:lenIds {
		Set idMensagem = $Piece(obj.id,",",i)
		Set tSC = ##class(Ens.MessageHeader).ResendDuplicatedMessage(idMensagem)
		Quit:$$$ISERR(tSC)
	}
	
	Quit tSC
}

}
