var urlOrigin = window.location.origin;
var urlREST = urlOrigin + "/csp/msgviewer/api";

var urlPreparacao = 'diashenrique.messageviewer.MessageViewer.cls';
var interval = null;
var arrMessages = [];

function openDetails(pselectedNamespace, pSessionID) {
    // var urlDetails = urlOrigin + "/csp/" + pselectedNamespace.toLowerCase() + "/EnsPortal.VisualTrace.zen?SESSIONID=" + pSessionID;
    var urlDetails = `${urlOrigin}/csp/msgviewer/diagram.csp?namespace=${pselectedNamespace.toUpperCase()}&sessionId=${pSessionID}`;
    window.open(urlDetails, '_blank');
}

// ************* DevExtreme - DataGrid ************* //
// *************** Message Viewer *************** //
function dataGridProcesses(selectedNamespace) {
    $("#divMessagesDataGrid").dxDataGrid({
        dataSource: new DevExpress.data.DataSource({
            store: new DevExpress.data.CustomStore({
                key: "ID",
                load: function () {
                    return $.getJSON(urlREST + "/message/" + encodeURIComponent(selectedNamespace));
                }
            })
        }),
        allowColumnResizing: true,
        columnResizingMode: "widget",
        columnAutoWidth: true,
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        hoverStateEnabled: true,
        showBorders: true,
        sorting: {
            mode: "multiple"
        },
        filterRow: {
            visible: true,
            applyFilter: "auto"
        },
        filterPanel: {
            visible: true
        },
        searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Search..."
        },
        headerFilter: {
            visible: true
        },
        grouping: {
            expandMode: "rowClick",
            autoExpandAll: true,
            allowCollapsing: true
        },
        groupPanel: {
            visible: true,
            allowColumnDragging: true
        },
        columnChooser: {
            enabled: true
        },
        selection: {
            showCheckBoxesMode: "always",
            mode: "multiple"
        },
        scrolling: {
            mode: "virtual"
        },
        columns: [{
            dataField: "ID",
            dataType: "number",
            visible: true
        }, {
            dataField: "DateCreated",
            dataType: "date",
            visible: true,
            groupIndex: 0
        }, {
            dataField: "TimeCreated",
            dataType: "string",
            alignment: "right",
            visible: true
        }, {
            dataField: "DateProcessed",
            dataType: "date",
            visible: false
        }, {
            dataField: "TimeProcessed",
            dataType: "string",
            alignment: "right",
            visible: false
        }, {
            dataField: "SessionId",
            dataType: "number",
            visible: true,
            cellTemplate: function (container, options) {
                var linkSessionID = options.data.SessionId;
                container.append($("<a>").addClass('sessionLink').text(linkSessionID).on("click", function (args) {
                    openDetails(selectedNamespace, linkSessionID);
                }).appendTo(container));
            }
        }, {
            dataField: "Status",
            dataType: "string",
            visible: true,
            groupIndex: 1
        }, {
            dataField: "Error",
            dataType: "string",
            visible: true
        }, {
            dataField: "SourceBusinessType",
            dataType: "string",
            visible: false
        }, {
            dataField: "SourceConfigName",
            dataType: "string",
            visible: true
        }, {
            dataField: "TargetBusinessType",
            dataType: "string",
            visible: false
        }, {
            dataField: "TargetConfigName",
            dataType: "string",
            visible: true
        }, {
            dataField: "TargetQueueName",
            dataType: "string",
            visible: false
        }, {
            dataField: "Banked",
            dataType: "number",
            visible: false
        }, {
            dataField: "BusinessProcessId",
            dataType: "number",
            visible: false
        }, {
            dataField: "CorrespondingMessageId",
            dataType: "number",
            visible: false
        }, {
            dataField: "Description",
            dataType: "string",
            visible: false
        }, {
            dataField: "ErrorStatus",
            dataType: "number",
            visible: false
        }, {
            dataField: "Invocation",
            dataType: "string",
            visible: false
        }, {
            dataField: "MessageBodyClassName",
            dataType: "string",
            visible: false
        }, {
            dataField: "MessageBodyId",
            dataType: "number",
            visible: false
        }, {
            dataField: "Priority",
            dataType: "string",
            visible: false
        }, {
            dataField: "Resent",
            dataType: "number",
            visible: false
        }, {
            dataField: "ReturnQueueName",
            dataType: "string",
            visible: false
        }, {
            dataField: "SuperSession",
            dataType: "number",
            visible: false
        }, {
            dataField: "Type",
            dataType: "string",
            visible: false
        }],
        sortByGroupSummaryInfo: [{
            summaryItem: "count"
        }],
        summary: {
            groupItems: [{
                column: "ID",
                summaryType: "count",
                displayFormat: "{0} Messages",
                showInGroupFooter: false,
                alignByColumn: true
            }]
        },
        onSelectionChanged: function (selectedItems) {
            var data = selectedItems.selectedRowsData;

            if (data.length > 0) {

                $("#selected-data").removeClass("hidden");

                $("#selected-items-container").text(
                    $.map(data, function (value) {
                        return value.ID;
                    }).join(","));
            }
        },
        onToolbarPreparing: function (e) {
            var dataGrid = e.component;

            e.toolbarOptions.items.unshift({
                location: "after",
                widget: "dxButton",
                options: {
                    icon: "fa fa-compress",
                    width: 36,
                    height: 36,
                    hint: "Collapse / Expand",
                    onClick: function (e) {
                        var expanding = e.component.option("icon") === "fa fa-expand";
                        if (expanding) {
                            dataGrid.expandAll();
                        } else {
                            dataGrid.collapseAll();
                        }
                        e.component.option("icon", expanding ? "fa fa-compress" : "fa fa-expand");
                    }
                }
            });

            e.toolbarOptions.items.push({
                location: "after",
                widget: "dxButton",
                options: {
                    icon: "clearformat",
                    text: "Clear Selection",
                    hint: "Clear",
                    onClick: function (e) {
                        $("#selected-data").addClass("hidden");
                        $("#selected-items-container").text("");
                        dataGrid.clearSelection();
                        var idSelecionado = "";
                    }
                }
            });

            e.toolbarOptions.items.push({
                location: "after",
                widget: "dxButton",
                options: {
                    icon: "far fa-paper-plane",
                    text: "Resend",
                    hint: "Resend",
                    onClick: function (e) {
                        var idSelecionado = $("#selected-items-container").text();

                        if (idSelecionado == "") {
                            DevExpress.ui.notify("No message have been selected", "error");
                        } else {
                            var result = DevExpress.ui.dialog.confirm("Do you want to resend the selected messages?", "Resend Message");
                            result.done(function (resp) {
                                if (resp) {
                                    //var resp = #server(diashenrique.messageviewer.MessageViewer.Resend(selectedNamespace, idSelecionado))#
                                    var values={id:idSelecionado, namespace:selectedNamespace};
                                    $.ajax({
                                        url: urlREST + "/message/resend/",
                                        method: "POST",
                                        processData: false,
                                        contentType: "application/json",
                                        data: JSON.stringify(values)
                                    }).done(function () {
                                        DevExpress.ui.notify("Messages were successfully resent", "success", 4000);
                                    });
                                }
                            });

                        }
                    }
                }
            });
        },
        export: {
            enabled: true,
            fileName: "Ensemble Message Viewer 2.0"
        },
        stateStoring: {
            enabled: false,
            type: "localStorage",
            storageKey: "storage"
        }
    });
}

function reloadProcesses(pInterval) {
    interval = setInterval(dataGridProcesses, pInterval);
}


$(document).ready(function () {
    var urlOrigin = window.location.origin;
    var newUrl = urlOrigin + "/csp/sys/UtilHome.csp"
    $("#urlPortal").attr("href", newUrl);

    var selectedNamespace = localStorage.getItem('namespace');

    $("#namespaceField").dxSelectBox({
        dataSource: new DevExpress.data.DataSource({
            store: new DevExpress.data.CustomStore({
                loadMode: "raw",
                load: function () {
                    return $.getJSON(urlPreparacao, {
                        method: "getEnsembleNamespace"
                    });
                }
            })
        }),
        width: 300,
        value: selectedNamespace,
        valueExpr: 'id',
        displayExpr: 'text',
        placeholder: "Choose Your Namespace",
        onValueChanged: function (data) {
            selectedNamespace = data.value;
            localStorage.setItem('namespace', data.value);
            if (selectedNamespace) {
                $("#buttonApply").dxButton({
                    disabled: false
                });
            }
        }
    });

    $("#buttonApply").dxButton({
        icon: "search",
        type: "default",
        text: "Search",
        onClick: function (e) {
            dataGridProcesses(selectedNamespace);
        }
    });


});