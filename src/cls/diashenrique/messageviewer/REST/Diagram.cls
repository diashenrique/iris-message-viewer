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
	SELECT SourceConfigName, TargetConfigName, TimeCreated, MessageBodyClassName FROM Ens.MessageHeader WHERE SessionId = :pSessionId
}

}
