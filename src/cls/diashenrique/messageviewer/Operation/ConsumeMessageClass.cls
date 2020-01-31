Class diashenrique.messageviewer.Operation.ConsumeMessageClass Extends Ens.BusinessOperation [ Inheritance = left, ProcedureBlock ]
{

Method Consume(input As diashenrique.messageviewer.Message.SimpleMessage, ByRef output As Ens.Response) As %Status
{
    Set sc = $$$OK
	$$$TRACE(pRequest.ClassMessage)
    Return sc
}

XData MessageMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<MapItems>
<MapItem MessageType="diashenrique.messageviewer.Message.SimpleMessage">
<Method>Consume</Method>
</MapItem>
</MapItems>
}

}
