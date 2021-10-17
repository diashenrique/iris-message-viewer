Class diashenrique.messageviewer.REST.Diagram Extends %CSP.REST
{

ClassMethod GetDiagram(pSessionId As %Integer) As %Status
{
	#Dim rsParticipants As %SQL.ISelectResult
	#Dim rsMessages As %SQL.ISelectResult
    Set %response.ContentType = "application/json"
	Set tSC = $System.Status.OK()
	Set json = {}

	Try {
		Set json.participants = []
		Set rsParticipants = ..selectParticipantsFunc(pSessionId)
		While rsParticipants.%Next() {
			Do json.participants.%Push(rsParticipants.Participant)
		}

		If (json.participants.%Size() = 0) {
			Throw ##class(%Exception.General).%New("No data found for sessionId "_pSessionId)
		}

		Set json.messages = []
		Set rsMessages = ..selectMessagesFunc(pSessionId)
		While rsMessages.%Next() {
			Set classNameTokens = $LFS(rsMessages.MessageBodyClassName, ".")
			Set className = $LG(classNameTokens, *)
			Set:(className = "") className = "NULL"
			Do json.messages.%Push({
				"id": (rsMessages.id),
				"from": (rsMessages.SourceConfigName),
				"to": (rsMessages.TargetConfigName),
				"message": (rsMessages.TimeCreated_" "_className)
			})
		}

		Write json.%ToJSON()
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}

	Quit tSC
}

Query selectParticipants(pSessionId As %Integer) As %SQLQuery
{
	SELECT SourceConfigName AS Participant FROM Ens.MessageHeader WHERE SessionId = :pSessionId
	UNION
	SELECT TargetConfigName AS Participant FROM Ens.MessageHeader WHERE SessionId = :pSessionId
}

Query selectMessages(pSessionId As %Integer) As %SQLQuery
{
	SELECT Id, SourceConfigName, TargetConfigName, TimeCreated, MessageBodyClassName FROM Ens.MessageHeader WHERE SessionId = :pSessionId
}

ClassMethod GetMessageInfo(pSessionId As %Integer) As %Status
{
	#Dim rsMsgHeader As %SQL.ISelectResult
    Set %response.ContentType = "application/json"
	Set tSC = $System.Status.OK()
	Set json = {}
	Try {
		Set rsMsgHeader = ..getMessageHeaderFunc(pSessionId)
		If (rsMsgHeader.%Next()) {
			#Dim metadata As %SQL.StatementMetadata
			Set metadata = rsMsgHeader.%GetMetadata()
			Set intcolumnCount = metadata.columnCount
			Set json.header = {}
			For i=1:1:intcolumnCount {
				Do json.header.%Set(metadata.columns.GetAt(i).colName, rsMsgHeader.%GetData(i))
			}
			Kill metadata
			
			If (rsMsgHeader.MessageBodyClassName '= "") {
				Set rsMsgBody = ..GetMessageBody(rsMsgHeader.MessageBodyClassName, rsMsgHeader.MessageBodyId)
				If (rsMsgBody.%Next()) {
					#Dim metadata As %SQL.StatementMetadata
					Set metadata = rsMsgBody.%GetMetadata()
					Set intcolumnCount = metadata.columnCount
					Set json.body = {}
					For i=1:1:intcolumnCount {
						Do json.body.%Set(metadata.columns.GetAt(i).colName, rsMsgBody.%GetData(i))
					}
					Kill metadata
				}
			}
		}

		Write json.%ToJSON()
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}
	Quit tSC
}

Query getMessageHeader(pMsgId As %Integer) As %SQLQuery
{
	SELECT * FROM Ens.MessageHeader WHERE Id = :pMsgId
}

ClassMethod GetMessageBody(pClassName As %String, pMsgBodyId As %Integer) As %String
{
	Set tableName = ##class(%Dictionary.CompiledClass).%OpenId(pClassName).SqlQualifiedNameQ
	Set sql = "SELECT * FROM "_tableName_" WHERE Id = ?"
	Return ##class(%SQL.Statement).%ExecDirect(, sql, pMsgBodyId)
}

ClassMethod GetPrevSession(pSessionId As %Integer) As %Status
{
	#Dim rs As %SQL.ISelectResult
    Set %response.ContentType = "application/json"
	Set tSC = $System.Status.OK()
	Set json = {}
	Try {
		Set rs = ..GetPrevSessionQueryFunc(pSessionId)
		If (rs.%Next()) {
		}
		Set json = {
			"sessionId": (rs.SessionId)
		}
		Write json.%ToJSON()
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}
	Quit tSC
}

Query GetPrevSessionQuery(pSessionId As %Integer) As %SQLQuery
{
	SELECT TOP 1 SessionId FROM Ens.MessageHeader WHERE SessionId < :pSessionId ORDER BY Id DESC
}

ClassMethod GetNextSession(pSessionId As %Integer) As %Status
{
	#Dim rs As %SQL.ISelectResult
    Set %response.ContentType = "application/json"
	Set tSC = $System.Status.OK()
	Set json = {}
	Try {
		Set rs = ..GetNextSessionQueryFunc(pSessionId)
		If (rs.%Next()) {
		}
		Set json = {
			"sessionId": (rs.SessionId)
		}
		Write json.%ToJSON()
	}
	Catch (oException) {
		Set tSC = oException.AsStatus()
	}
	Quit tSC
}

Query GetNextSessionQuery(pSessionId As %Integer) As %SQLQuery
{
	SELECT TOP 1 SessionId FROM Ens.MessageHeader WHERE SessionId > :pSessionId ORDER BY Id
}

}
