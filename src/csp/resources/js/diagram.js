var urlOrigin = window.location.origin;
var urlREST = urlOrigin + "/csp/msgviewer/api";
var urlPreparacao = 'diashenrique.messageviewer.MessageViewer.cls';
var dataBag;

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

    $('#txtPage').change(function (event) {
        dataBag.msgPage = $('#txtPage').val();
        event.preventDefault();
    });

    $('#txtPageSize').change(function (event) {
        dataBag.msgPageSize = $('#txtPageSize').val();
        event.preventDefault();
    });

    $('#txtPage').keypress(function (event) {
        if (event.which == 13) {
            dataBag.msgPage = $('#txtPage').val();
            dataBag.msgPageSize = $('#txtPageSize').val();
            getDiagram();
        }
    });

    $('#txtPageSize').keypress(function (event) {
        if (event.which == 13) {
            dataBag.msgPage = $('#txtPage').val();
            dataBag.msgPageSize = $('#txtPageSize').val();
            getDiagram();
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
        width: 150,
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
        text: "Resend",
        onClick: function (e) {
            var idSelecionado = $("#txtSessionId").val();

            if (idSelecionado == "") {
                DevExpress.ui.notify("No message have been selected", "error");
            } else {
                var result = DevExpress.ui.dialog.confirm("Do you want to resend the selected messages?", "Resend Message");
                result.done(function (resp) {
                    if (resp) {
                        var values = { id: idSelecionado, namespace: selectedNamespace };
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

    $("#btnToggleMsgInfo").dxButton({
        icon: "info",
        text: "Hide details",
        onClick: function (e) {
            const curr = e.component.option("text");
            if (curr === "Hide details") {
                e.component.option("text", "Show details");
                $(".tab-container").hide();
                $(".mermaid").addClass("diagram-container-maximized");
                $(".mermaid").removeClass("diagram-container");
            } else {
                e.component.option("text", "Hide details");
                $(".tab-container").show();
                $(".mermaid").removeClass("diagram-container-maximized");
                $(".mermaid").addClass("diagram-container");
            }
        }
    });

    $("#btnPrev").dxButton({
        icon: "chevronprev",
        onClick: function (e) {
            prevSession();
        }
    });

    $("#btnNext").dxButton({
        icon: "chevronright",
        onClick: function (e) {
            nextSession();
        }
    });

    $("#btnPrevMsgPage").dxButton({
        icon: "chevronprev",
        onClick: function (e) {
            prevMsgPage();
        }
    });

    $("#btnNextMsgPage").dxButton({
        icon: "chevronright",
        onClick: function (e) {
            nextMsgPage();
        }
    });

    $("#btnZoomIn").dxButton({
        icon: "plus",
        onClick: zoomIn
    });

    $("#btnZoomOut").dxButton({
        icon: "minus",
        onClick: zoomOut
    });

    $("#btnResetZoom").dxButton({
        icon: "undo",
        onClick: resetZoom
    });

    $("#btnPanLeft").dxButton({
        icon: "arrowleft",
        onClick: panLeft
    });

    $("#btnPanUp").dxButton({
        icon: "arrowup",
        onClick: panUp
    });

    $("#btnPanDown").dxButton({
        icon: "arrowdown",
        onClick: panDown
    });

    $("#btnPanRight").dxButton({
        icon: "arrowright",
        onClick: panRight
    });

    $("#btnCenter").dxButton({
        icon: "isblank",
        onClick: center
    });

    // todo: persist and recover from localStorage
    dataBag = new MyDataBag({
        msgPage: $('#txtPage').val(),
        msgPageSize: $('#txtPageSize').val(),
        onchange: (propName, oldValue, newValue) => {
            switch (propName) {
                case 'msgPage':
                    $('#txtPage').val(newValue);
                    break;
                case 'msgPageSize':
                    $('#txtPageSize').val(newValue);
                    break;
            }
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
    const pageSize = $('#txtPageSize').val();
    if (sessionId && !isNaN(sessionId)) {
        if (dataBag.msgPage < 1) {
            dataBag.msgPage = 1;
            return;
        }
        var values = {
            namespace: selectedNamespace,
            sessionId: sessionId,
            pageSize: dataBag.msgPageSize,
            page: dataBag.msgPage
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
                if (!data.messages || data.messages.length === 0) {
                    dataBag.msgPage--;
                    return;
                }
                const indexOf = (value) => data.participants.indexOf(value);
                const diagram = `
                sequenceDiagram
                %%autonumber
                ${data.participants.reduce((acc, curr, idx) => {
                    acc.push(`participant P${idx} as ${curr}`);
                    return acc;
                }, []).join('\n')}
                ${data.messages.reduce((acc, curr, idx) => {
                    acc.push(`P${indexOf(curr.from)}->>P${indexOf(curr.to)}: ${curr.message}`);
                    return acc;
                }, []).join('\n')}`;

                $(".mermaid").html(diagram);
                renderMermaid().then(() => {
                    if (data.messages[data.messages.length - 1].vid < data.totalMessages) {
                        drawBreakSign('.mermaid', 'bottom');
                    }
                    if (data.messages[0].vid > 1) {
                        drawBreakSign('.mermaid', 'top');
                    }
                    enableZoomPan();
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

function drawBreakSignold(containerSelector, position) {
    const svgns = "http://www.w3.org/2000/svg";
    var array = [...document.querySelectorAll(`${containerSelector} rect.actor`)];
    if (position === 'top') {
        array = array.slice(0, array.length / 2);
    } else {
        array = array.slice(array.length / 2);
    }
    array.forEach(actor => {
        const bb = actor.getBBox();
        const x1 = bb.x + (bb.width / 2) - 5;
        const y1 = bb.y + (position === 'top' ? bb.height + 5 : - 5);
        const x2 = x1 + 10;
        const y2 = y1;
        $('svg').append(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke: #000 !important">`);
    });
}

function drawBreakSign(containerSelector, position) {
    const svgns = "http://www.w3.org/2000/svg";
    var array = [...document.querySelectorAll(`${containerSelector} rect.actor`)];
    const bb1 = array[0].getBBox();
    const bb2 = array[parseInt(array.length / 2) - 1].getBBox();
    const bb3 = array[parseInt(array.length / 2)].getBBox();
    const height = 5;
    const width = bb2.x + bb2.width;
    const rect1 = document.createElementNS(svgns, 'rect');
    const x = bb1.x;
    const y = bb1.y + (position === 'top' ? bb1.height + 5 : bb3.y - height - 5);
    $('svg').append(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff">`);

    var translate = "";
    if (position === 'top') {
        array = array.slice(0, array.length / 2);
        translate = `translate(0 ${height})`;
    } else {
        array = array.slice(array.length / 2);
        translate = `translate(0 ${-height})`;
    }
    array.forEach(actor => {
        const bb = actor.getBBox();
        const x1 = bb.x + (bb.width / 2) - 5;
        const y1 = bb.y + (position === 'top' ? bb.height + 5 : - 5);
        const x2 = x1 + 10;
        $('svg').append(`
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" 
            style="
                stroke: #000 !important; 
                transform: rotate(45deg); 
                transform-box: fill-box; 
                transform-origin: center;">`);
        $('svg').append(`
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" 
            style="
                stroke: #000 !important; 
                transform: translate(0px, ${position === 'top' ? height : -height}px) 
                rotate(45deg); transform-box: fill-box; 
                transform-origin: center;">`);
    });
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
                    return `<table class="table table-striped table-sm">
                    ${keys.reduce((acc, curr) => {
                        acc += `<tr><td class="text-uppercase font-weight-bold vtable-column">${curr}</td><td><div class="vtable-value">${data[curr]}</div></td></tr>`;
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

function prevMsgPage() {
    dataBag.msgPage--;
    getDiagram();
}

function nextMsgPage() {
    dataBag.msgPage++;
    getDiagram();
}