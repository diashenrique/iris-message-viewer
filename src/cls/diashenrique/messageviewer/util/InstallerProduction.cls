Class diashenrique.messageviewer.util.InstallerProduction [ Abstract ]
{

/// Namespace 
Parameter NAMESPACE = "MSGVIEWER";

/// Production name
Parameter PRODUCTION = "Demo.IRIS.Production";

/// Number of messages to be generated per service
Parameter LIMIT = 300;

/// Helper to install a production to display capabilities of the enhanced viewer
ClassMethod Install() As %Status
{
	Set sc = $$$OK
	Try {
		Set sc = $$$ADDSC(sc,..InstallProduction()) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..GenerateMessages()) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..GenerateUsingEnsDirector()) quit:$$$ISERR(sc)
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Helper to install a production
ClassMethod InstallProduction() As %Status [ Private ]
{
	Set sc = $$$OK
	Try {
		Set sc = $$$ADDSC(sc,..CreateRequest("diashenrique.messageviewer.Message.SimpleRequest","Message")) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..CreateRequest("diashenrique.messageviewer.Message.AnotherRequest","Something")) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..CreateOperation()) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..CreateRESTService()) quit:$$$ISERR(sc)
		Set sc = $$$ADDSC(sc,..CreateProduction()) quit:$$$ISERR(sc)
		New $Namespace
		Set $Namespace = ..#NAMESPACE
		Set sc = $$$ADDSC(sc,##class(Ens.Director).StartProduction(..#PRODUCTION))
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Create new Interoperability Production
ClassMethod CreateProduction(purge As %Boolean = 0) As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {

		#; create new production
		Set class = ##class(%Dictionary.ClassDefinition).%New(..#PRODUCTION)
		Set class.ProcedureBlock = 1
		Set class.Super = "Ens.Production"
		Set class.GeneratedBy = $ClassName()
		Set xdata = ##class(%Dictionary.XDataDefinition).%New()
		Set xdata.Name = "ProductionDefinition"
		Do xdata.Data.Write("<Production Name="""_..#PRODUCTION_""" LogGeneralTraceEvents=""true""></Production>")	
		Do class.XDatas.Insert(xdata)
		Set sc = $$$ADDSC(sc,class.%Save())
		Set sc = $$$ADDSC(sc,$System.OBJ.Compile(..#PRODUCTION,"fck-dv"))

		Set production = ##class(Ens.Config.Production).%OpenId(..#PRODUCTION)
		Set item = ##class(Ens.Config.Item).%New()
		Set item.ClassName = "diashenrique.messageviewer.Service.REST"
		Do production.Items.Insert(item)
		Set sc = $$$ADDSC(sc,production.%Save())

		Set item = ##class(Ens.Config.Item).%New()
		Set item.ClassName = "diashenrique.messageviewer.Operation.Consumer"
		Do production.Items.Insert(item)
		Set sc = $$$ADDSC(sc,production.%Save())	

		Set item = ##class(Ens.Config.Item).%New()
		Set item.ClassName = "diashenrique.messageviewer.Service.SendMessage"
		Do production.Items.Insert(item)
		Set sc = $$$ADDSC(sc,production.%Save())	

		Set item = ##class(Ens.Config.Item).%New()
		Set item.ClassName = "diashenrique.messageviewer.Operation.ConsumeMessageClass"
		Do production.Items.Insert(item)
		Set sc = $$$ADDSC(sc,production.%Save())	
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Create a dummy REST service to populate messages
ClassMethod CreateRequest(classname As %String, prop As %String) As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {
		Set class = ##class(%Dictionary.ClassDefinition).%New(classname)
		Set class.GeneratedBy = $ClassName()
		Set class.Super = "Ens.Request"
		Set class.ProcedureBlock = 1
		Set class.Inheritance = "left"
		Set sc = $$$ADDSC(sc,class.%Save())

		#; create adapter
		Set property = ##class(%Dictionary.PropertyDefinition).%New(classname)
		Set property.Name = prop
		Set property.Type = "%String"
		Set sc = $$$ADDSC(sc,property.%Save())
		Set sc = $$$ADDSC(sc,$System.OBJ.Compile(classname,"fck-dv"))
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Create a dummy operation to populate messages
ClassMethod CreateOperation() As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {
		Set classname = "diashenrique.messageviewer.Operation.Consumer"
		Set class = ##class(%Dictionary.ClassDefinition).%New(classname)
		Set class.GeneratedBy = $ClassName()
		Set class.Super = "Ens.BusinessOperation"
		Set class.ProcedureBlock = 1
		Set class.Inheritance = "left"

		Set xdata = ##class(%Dictionary.XDataDefinition).%New()
		Set xdata.Name = "MessageMap"
		Set xdata.XMLNamespace = "http://www.intersystems.com/urlmap"
		Do xdata.Data.WriteLine("<MapItems>")
		Do xdata.Data.WriteLine("<MapItem MessageType=""diashenrique.messageviewer.Message.SimpleRequest"">")
		Do xdata.Data.WriteLine("<Method>Consume</Method>")
		Do xdata.Data.WriteLine("</MapItem>")
		Do xdata.Data.WriteLine("<MapItem MessageType=""diashenrique.messageviewer.Message.AnotherRequest"">")
		Do xdata.Data.WriteLine("<Method>Consume</Method>")
		Do xdata.Data.WriteLine("</MapItem>")
		Do xdata.Data.WriteLine("</MapItems>")		
		Do class.XDatas.Insert(xdata)
		Set sc = $$$ADDSC(sc,class.%Save())

		Set method = ##class(%Dictionary.MethodDefinition).%New(classname)
		Set method.Name = "Consume"
		Set method.ClassMethod = 0
		Set method.ReturnType = "%Status"
		Set method.FormalSpec = "input:diashenrique.messageviewer.Message.SimpleRequest,&output:Ens.Response"
		Set stream = ##class(%Stream.TmpCharacter).%New()
		Do stream.WriteLine("	set sc = $$$OK")
		Do stream.WriteLine("	$$$TRACE(input.Message)")
		Do stream.WriteLine("	return sc")
		Set method.Implementation = stream
		Set sc = $$$ADDSC(sc,method.%Save())

		Set sc = $$$ADDSC(sc,$System.OBJ.Compile(classname,"fck-dv"))
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Create a dummy REST service to populate messages
ClassMethod CreateRESTService() As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {
		Set classname = "diashenrique.messageviewer.Service.REST"
		Set class = ##class(%Dictionary.ClassDefinition).%New(classname)
		Set class.GeneratedBy = $ClassName()
		Set class.Super = "EnsLib.REST.Service, Ens.BusinessService"
		Set class.ProcedureBlock = 1
		Set class.Inheritance = "left"

		Set xdata = ##class(%Dictionary.XDataDefinition).%New()
		Set xdata.Name = "UrlMap"
		Set xdata.XMLNamespace = "http://www.intersystems.com/urlmap"
		Do xdata.Data.WriteLine("<Routes>")
		Do xdata.Data.WriteLine("<Route Url=""/send/message"" Method=""POST"" Call=""SendMessage""/>")
		Do xdata.Data.WriteLine("<Route Url=""/send/something"" Method=""POST"" Call=""SendSomething""/>")
		Do xdata.Data.WriteLine("</Routes>")
		Do class.XDatas.Insert(xdata)
		Set sc = $$$ADDSC(sc,class.%Save())

		#; create adapter
		Set adapter = ##class(%Dictionary.ParameterDefinition).%New(classname)
		Set class.GeneratedBy = $ClassName()
		Set adapter.Name = "ADAPTER"
		Set adapter.SequenceNumber = 1
		Set adapter.Default = "EnsLib.HTTP.InboundAdapter"
		Set sc = $$$ADDSC(sc,adapter.%Save())

		#; add prefix
		Set prefix = ##class(%Dictionary.ParameterDefinition).%New(classname)
		Set prefix.Name = "EnsServicePrefix"
		Set prefix.SequenceNumber = 2
		Set prefix.Default = "|demoiris"
		Set sc = $$$ADDSC(sc,prefix.%Save())

		Set method = ##class(%Dictionary.MethodDefinition).%New(classname)
		Set method.Name = "SendMessage"
		Set method.ClassMethod = 0
		Set method.ReturnType = "%Status"
		Set method.FormalSpec = "input:%Library.AbstractStream,&output:%Stream.Object"
		Set stream = ##class(%Stream.TmpCharacter).%New()
		Do stream.WriteLine("	set sc = $$$OK")
		Do stream.WriteLine("	set request = ##class(diashenrique.messageviewer.Message.SimpleRequest).%New()")
		Do stream.WriteLine("	set data = {}.%FromJSON(input)")
		Do stream.WriteLine("	set request.Message = data.Message")
		Do stream.WriteLine("	set sc = $$$ADDSC(sc,..SendRequestSync(""diashenrique.messageviewer.Operation.Consumer"",request,.response))")
		Do stream.WriteLine("	return sc")
		Set method.Implementation = stream
		Set sc = $$$ADDSC(sc,method.%Save())

		Set method = ##class(%Dictionary.MethodDefinition).%New(classname)
		Set method.Name = "SendSomething"
		Set method.ClassMethod = 0
		Set method.ReturnType = "%Status"
		Set method.FormalSpec = "input:%Library.AbstractStream,&output:%Stream.Object"
		Set stream = ##class(%Stream.TmpCharacter).%New()
		Do stream.WriteLine("	set sc = $$$OK")
		Do stream.WriteLine("	set request = ##class(diashenrique.messageviewer.Message.AnotherRequest).%New()")
		Do stream.WriteLine("	set data = {}.%FromJSON(input)")
		Do stream.WriteLine("	set request.Something = data.Something")
		Do stream.WriteLine("	set sc = $$$ADDSC(sc,..SendRequestSync(""diashenrique.messageviewer.Operation.Consumer"",request,.response))")
		Do stream.WriteLine("	return sc")
		Set method.Implementation = stream
		Set sc = $$$ADDSC(sc,method.%Save())

		Set sc = $$$ADDSC(sc,$System.OBJ.Compile(classname,"fck-dv"))
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Generates load of messages
ClassMethod GenerateMessages() As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {
		Set action(0) = "/demoiris/send/message"
		Set action(1) = "/demoiris/send/something"
		For i=1:1:..#LIMIT {
			Set content = { }
			Set content.Message = "Hi, I'm just a random message named "_$Random(30000)
			Set content.Something = "Hi, I'm just a random something named "_$Random(30000)
			Set httprequest = ##class(%Net.HttpRequest).%New()
		    Set httprequest.SSLCheckServerIdentity = 0
		    Set httprequest.SSLConfiguration = ""
		    Set httprequest.Https = 0
		    Set httprequest.Server = "localhost"
		    Set httprequest.Port = 9980
			Set serverUrl = action($Random(2))
			Do httprequest.EntityBody.Write(content.%ToJSON())
			Set sc = httprequest.Post(serverUrl) 
			Quit:$$$ISERR(sc)
		}
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

/// Generates load of messages using Ens.Director class
ClassMethod GenerateUsingEnsDirector() As %Status [ Private ]
{
	New $Namespace
	Set $Namespace = ..#NAMESPACE
	Set sc = $$$OK
	Try {
		For i=1:1:..#LIMIT {
			Set tSC = ##class(Ens.Director).CreateBusinessService("diashenrique.messageviewer.Service.SendMessage",.tService)
			Set message = "Message Generated By CreateBusinessService "_$Random(1000)
			Set tSC = tService.ProcessInput(message,.output)
			Quit:$$$ISERR(sc)
		}
	}
    Catch (err) {
		Set sc = $$$ADDSC(sc,err.AsStatus())
	}
	Return sc
}

}
