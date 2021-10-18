var urlOrigin = window.location.origin;
var urlREST = urlOrigin + "/csp/msgviewer/api";
var urlPreparacao = 'diashenrique.messageviewer.MessageViewer.cls';

$(document).ready(function () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params.namespace) {
        params.namespace = params.namespace.toUpperCase();
        localStorage.setItem('namespace', params.namespace);
    }
    if (params.sessionId) {
        $("#txtSessionId").val(params.sessionId);
    }

    var selectedNamespace = localStorage.getItem('namespace');

    mermaid.initialize({
        startOnLoad: false,
        theme: 'forest'
    });

    $('#txtSessionId').keypress(function (event) {
        if (event.which == 13) {
            getDiagram();
            event.preventDefault();
        }
    });

    // todo: copiado de messageviewer.js, aplicar DRY
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
                $("#btnSend").dxButton({
                    disabled: false
                });
            }
        }
    });

    // todo: copiado de messageviewer.js, aplicar DRY
    $("#btnSend").dxButton({
        icon: 'far fa-paper-plane',
        text: "Send",
        onClick: function(e) { 
            var idSelecionado = $("#txtSessionId").val();

            if (idSelecionado == "") {
                DevExpress.ui.notify("No message have been selected", "error");
            } else {
                var result = DevExpress.ui.dialog.confirm("Do you want to resend the selected messages?", "Resend Message");
                result.done(function (resp) {
                    if (resp) {
                        var values={id:idSelecionado, namespace:selectedNamespace};
                        $.ajax({
                            url: urlREST + "/message/resend/",
                            method: "POST",
                            processData: false,
                            contentType: "application/json",
                            data: JSON.stringify(values)
                        }).done(function () {
                            getDiagram();
                            DevExpress.ui.notify("Messages were successfully resent", "success", 4000);
                        });
                    }
                });

            }
        }
    });

    $("#btnPrev").dxButton({
        icon: "chevronprev",
        onClick: function(e) { 
            prevSession();
        }
    });

    $("#btnNext").dxButton({
        icon: "chevronright",
        onClick: function(e) { 
            nextSession();
        }
    });
    
    getDiagram();
});

function renderMermaid(container) {
    container = container || document.querySelectorAll(".mermaid");
    $(container).removeAttr('data-processed');
    mermaid.init(undefined, container);

    return new Promise((resolve) => {
        const intId = setInterval(() => {
            const div = document.querySelector('div.mermaid[data-processed="true"]');
            if (div) {
                clearInterval(intId);
                resolve();
            }
        }, 10);
    });
}

function getTextMessageByTextContent(textContent) {
    return Array.from(document.querySelectorAll('text.messageText')).find(text => text.textContent === textContent)
}

function defaultErrorPresentation(jqxhr, textStatus, error) {
    var err = `${textStatus}, ${error}\n${jqxhr.responseJSON.errors[0].error}`;
    DevExpress.ui.notify(err, "error");
}

function getDiagram() {
    const sessionId = $('#txtSessionId').val();
    const selectedNamespace = localStorage.getItem('namespace');
    if (sessionId && !isNaN(sessionId)) {
        var values = {
            namespace: selectedNamespace,
            sessionId: sessionId
        };
        $.ajax({
            url: `${urlREST}/diagram`,
            method: "POST",
            processData: false,
            contentType: "application/json",
            data: JSON.stringify(values)
        })
        .done(data => {
            if (!data) return;
            const indexOf = (value) => data.participants.indexOf(value);
            const diagram = `
                sequenceDiagram
                autonumber
                ${data.participants.reduce((acc, curr, idx) => {
                acc.push(`participant P${idx} as ${curr}`);
                return acc;
            }, []).join('\n')}
                ${data.messages.reduce((acc, curr, idx) => {
                acc.push(`P${indexOf(curr.from)}->>P${indexOf(curr.to)}: ${curr.message}`);
                return acc;
            }, []).join('\n')}
            `;

            $(".mermaid").html(diagram);
            renderMermaid().then(() => {
                data.messages.forEach((msg) => {
                    const text = getTextMessageByTextContent(msg.message);
                    if (text) {
                        text.style.cursor = 'pointer';
                        text.addEventListener('click', e => {
                            dataGridProcesses(msg);
                        })
                    }
                });
                dataGridProcesses(data.messages[0]);
            });
            
        })
        .fail(function (jqxhr, textStatus, error) {
            defaultErrorPresentation(jqxhr, textStatus, error);
        });
    }
}

function dataGridProcesses(msg) {
    const selectedNamespace = localStorage.getItem('namespace');
    const sessionId = $('#txtSessionId').val()
    var values = {
        namespace: selectedNamespace,
        sessionId: msg.id
    };
    $.ajax({
        url: `${urlREST}/diagram/message`,
        method: "POST",
        processData: false,
        contentType: "application/json",
        data: JSON.stringify(values)
    })
    .done(data => {
        const createTable = (data, nodataMsg) => {
            data = data || {};
            const keys = Object.keys(data);
            if (keys.length > 0) {
                return `<table>
                    ${keys.reduce((acc, curr) => {
                    acc += `<tr><td class="text-uppercase font-weight-bold vtable-column">${curr}</td><td class="vtable-value">${data[curr]}</td></tr>`;
                    return acc;
                }, '')}
                </table>`;
            } else {
                return nodataMsg;
            }
        };
        $("#divMessageHeaderDataGrid").html(createTable(data.header, ""));
        $("#divMessageBodyDataGrid").html(createTable(data.body, "There is no message body associated with this message."));

        const iframeSrc = `/csp/msgviewer/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=${msg.id}&RAW=1';`
        $("#divMessageContent").html(`<iframe src=${iframeSrc} class="content-iframe"></iframe>`)
    })
    .fail(function (jqxhr, textStatus, error) {
        defaultErrorPresentation(jqxhr, textStatus, error);
    });
}

function prevSession() {
    const selectedNamespace = localStorage.getItem('namespace');
    const sessionId = $('#txtSessionId').val()
    var values = {
        namespace: selectedNamespace,
        sessionId: sessionId
    };
    $("#btnPrev").dxButton("instance").option("disabled", false);
    $("#btnNext").dxButton("instance").option("disabled", false);
    $.ajax({
        url: `${urlREST}/diagram/prev`,
        method: "POST",
        processData: false,
        contentType: "application/json",
        data: JSON.stringify(values)
    })
    .done(data => {
        if (data.sessionId) {
            $('#txtSessionId').val(data.sessionId);
            getDiagram();
        } else {
            $("#btnPrev").dxButton("instance").option("disabled", true);
            DevExpress.ui.notify("No more messages.", "info");
        }
    })
    .fail(function (jqxhr, textStatus, error) {
        defaultErrorPresentation(jqxhr, textStatus, error);
    });
}

function nextSession() {
    const selectedNamespace = localStorage.getItem('namespace');
    const sessionId = $('#txtSessionId').val()
    var values = {
        namespace: selectedNamespace,
        sessionId: sessionId
    };
    $("#btnPrev").dxButton("instance").option("disabled", false);
    $("#btnNext").dxButton("instance").option("disabled", false);
    $.ajax({
        url: `${urlREST}/diagram/next`,
        method: "POST",
        processData: false,
        contentType: "application/json",
        data: JSON.stringify(values)
    })
    .done(data => {
        if (data.sessionId) {
            $('#txtSessionId').val(data.sessionId);
            getDiagram();
        } else {
            $("#btnNext").dxButton("instance").option("disabled", true);
            DevExpress.ui.notify("No more messages.", "info");
        }
    })
    .fail(function (jqxhr, textStatus, error) {
        defaultErrorPresentation(jqxhr, textStatus, error);
    });
}