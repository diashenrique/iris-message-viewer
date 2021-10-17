Class diashenrique.messageviewer.REST.Dispatch Extends %CSP.REST
{

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>

<Route Url="/" Method="GET" Call="Test" Cors="true"/>
<Route Url="/message/:id" Method="GET" Call="diashenrique.messageviewer.REST.Messages:getUnlimitedMessages" Cors="true"/>
<Route Url="/message/resend/" Method="POST" Call="diashenrique.messageviewer.REST.Messages:ResendMessage" Cors="true"/>
<Route Url="/diagram/:id" Method="GET" Call="diashenrique.messageviewer.REST.Diagram:GetDiagram" Cors="true"/>
<Route Url="/diagram/message/:id" Method="GET" Call="diashenrique.messageviewer.REST.Diagram:GetMessageInfo" Cors="true"/>
<Route Url="/diagram/session/:id/prev" Method="GET" Call="diashenrique.messageviewer.REST.Diagram:GetPrevSession" Cors="true"/>
<Route Url="/diagram/session/:id/next" Method="GET" Call="diashenrique.messageviewer.REST.Diagram:GetNextSession" Cors="true"/>

</Routes>
}

ClassMethod Test() As %Status
{
	Set %response.ContentType = "application/json"
	Set retObj = { }
	Set retMessage = "Hello World!"
	Set retObj.Message = retMessage
	Write retObj.%ToJSON()
	Quit $$$OK
}

}
