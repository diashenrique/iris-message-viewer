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

/// do ##class(diashenrique.messageviewer.MessageViewer).getMessageHeader()
ClassMethod getMessageHeader() As %Status
{

  	Set selectedNamespace = ""
    Set selectedNamespace = $Get(%request.Data("pNamespace",1))

    New $Namespace

    If (selectedNamespace '= "") {
		Set $Namespace = selectedNamespace    
    }
    Else {
	    Set $Namespace = "ENSEMBLE"
	}

	Set tSC = $System.Status.OK()
	Set arrayMessage = []

    Try {

		Set oRS = ##class(%SQL.Statement).%New()

        Set sql = "SELECT TOP 200 ID, Banked, BusinessProcessId, CorrespondingMessageId, Description, ErrorStatus, %EXTERNAL(Invocation) as Invocation, "_
        		  "CASE IsError WHEN 1 THEN 'Error' ELSE 'OK' END As Error, "_
        		  "MessageBodyClassName, MessageBodyId, %EXTERNAL(Priority) as Priority, Resent, ReturnQueueName, "_
        		  "SessionId, %EXTERNAL(SourceBusinessType) as SourceBusinessType, SourceConfigName, %EXTERNAL(Status) as Status, "_
        		  "SuperSession, %EXTERNAL(TargetBusinessType) as TargetBusinessType, TargetConfigName, TargetQueueName, "_
        		  "{fn LEFT(%EXTERNAL(TimeCreated),10 )} As DateCreated, {fn RIGHT(%EXTERNAL(TimeCreated),12 )} As TimeCreated, "_
        		  "{fn LEFT(%EXTERNAL(TimeProcessed),10 )} As DateProcessed, {fn RIGHT(%EXTERNAL(TimeProcessed),12 )} As TimeProcessed,  "_
        		  "%EXTERNAL(Type) as Type "_
        		  "FROM Ens.MessageHeader "_
        		  "WHERE SessionId = %ID "_
        		  "ORDER BY SessionId Desc "

        Set tSC = oRS.%Prepare(sql)

        Quit:$System.Status.IsError(tSC)

        Set intcolumnCount = oRS.%Metadata.columnCount

        Set result = oRS.%Execute()

        Set count = 0

        If (result.%SQLCODE '< 0) {
	        While result.%Next() {
	        	Set json = { }
	        	For i=1:1:intcolumnCount {
					Do json.%Set(oRS.%Metadata.columns.GetAt(i).colName,result.%GetData(i))
				}
				Do arrayMessage.%Push(json)
            }
        }
        Else {
            Throw ##class(%Exception.SQL).CreateFromSQLCODE(result.%SQLCODE,result.%Message)
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