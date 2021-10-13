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
    })
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
                `
                console.log(diagram);
                $(".mermaid").html(diagram);
                renderMermaid().then(() => {
                    data.messages.forEach((msg) => {
                        const text = getTextMessageByTextContent(msg.message);
                        if (text) {
                            text.style.cursor = 'pointer';
                            text.addEventListener('click', e => { alert('ok1') })
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