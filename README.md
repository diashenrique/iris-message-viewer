# IRIS Interoperability Message Viewer

This project has the intention to show a different approach for the Interoperability Message Viewer.

The article Alternative Message Viewer describes how to create an Interoperability Production, Business Service and Business Operation using code.<br>
<https://community.intersystems.com/post/building-alternative-iris-message-viewer> <br>

## How to Run

To start coding with this repo, you do the following:

1. Clone/git pull the repo into any local directory

```shell
git clone https://github.com/diashenrique/iris-message-viewer.git
```

2. Open the terminal in this directory and run:

```shell
docker-compose build
```

3. Run the IRIS container with your project:

```shell
docker-compose up -d
```

## How to test

Open the browser and go

Ex.: <http://localhost:52773/csp/msgviewer/messageviewer.csp>

The username _SYSTEM can run the message viewer.

## Message Viewer

Only Namespaces that are enabled for Interoperability Productions will be displayed

![Interoperability Message Viewer](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/InteroperabilityNamespace.png)

The enhanced Message Viewer brings features and flexibility, that allow you to create different filters, group the columns in N-Levels, export to excel and much more.

![Interoperability Message Viewer](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/MessageViewer.png)

## Filters Options

Use different filters to achieve the result that you need. You can also use Multiple Sorts, pressing `Shift` + `clicking on the column header.` and even export the data grid to _**Excel**_!

![Filters Options](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/FilterOption.gif)

![Filter Panel](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/FilterPanel.gif)

### Filter Builder

With the filter builder option, it's possible to create complex filters.

![Filter Builder](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/FilterBuilder.gif)

### Group Data

The group feature allows to group data against any column available. Grouping the information using N-levels you want. By default, group are made using the Date Created field.

![Group Data](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/GroupByFunction.gif)

### Column Chooser

This page has all columns from **Ens.MessageHeader**, showing only the default columns in the initial view. But you can choose the other columns using the button "Column Chooser."

![Column Chooser](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/ColumnChooser.gif)

### Collapse / Expand

Collapse or Expand all groups in a single click.

![Collapse / Expand](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/Collapse_Expand.gif)

### Visual Trace

The information in Session Id field have a link to the Visual Trace.

![Visual Trace](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/NewMessageVisualTrace.png)

### Resend Messages

Select the message(s) you need and click to Resend. This feature uses the ClassMethod below:

```terminal
##class(Ens.MessageHeader).ResendDuplicatedMessage(id)
```

![Resend Messages](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/ResendMessage.gif)

### Export to Excel

![Excel File](https://raw.githubusercontent.com/diashenrique/iris-message-viewer/master/images/ExportToExcel.png)

The excel shows the same format, content, and group defined in the CSP.

## Other information

The project was created as a Technology Example using the possibilities provided by InterSystems IRIS.

The library used for this demo, DevExtreme, it's free to use and to develop non-commercial applications.

For specific feature availability and license restrictions, please, visit the website to the product feature [comparison](https://js.devexpress.com/Buy/), and the [DevExtreme Non-Commercial, Non-Competitive License Agreement](https://js.devexpress.com/EULAs/DevExtremeNonCommercial/), respectively.

## Dream team

- [Henrique Dias](https://community.intersystems.com/user/henrique-dias-2)
- [José Roberto Pereira](https://community.intersystems.com/user/jos%C3%A9-roberto-pereira-0)