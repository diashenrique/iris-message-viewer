var urlOrigin = window.location.origin;
var urlREST = urlOrigin + "/csp/msgviewer/api";

$(document).ready(function () {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'forest'
    });
    $('#txtMsgId').keypress(function (event) {
        if (event.which == 13) {
            getDiagram();
            event.preventDefault();
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

function getDiagram() {
    const sessionId = $('#txtMsgId').val();
    if (!isNaN(sessionId)) {
        $.getJSON(`${urlREST}/diagram/${sessionId}`)
            .done(data => {
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
                });
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = `${textStatus}, ${error}\n${jqxhr.responseJSON.errors[0].error}`;
                alert(err);
            });
    }
}

function dataGridProcesses(msg) {
    $.getJSON(`${urlREST}/diagram/message/${msg.id}`)
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
                    // return `<div>
                    //     ${keys.reduce((acc, curr) => {
                    //         acc += `<div><span class="text-uppercase font-weight-bold vtable-column">${curr}</span><span class="vtable-value">${data[curr]}</span></div>`;
                    //         return acc;
                    //     }, '')}
                    // </div>`;
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
            var err = `${textStatus}, ${error}\n${jqxhr.responseJSON.errors[0].error}`;
            alert(err);
        });
}