const {
    WebSocketServer
} = require('ws');

const wss = new WebSocketServer({
    port: 9860
});

wss.on('connection', function connection(ws) {
    console.log("new connection")
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        data = JSON.parse(data)
        console.log(data)
        if (ws.type == 'backend') sendMobile(data)
        else if (ws.type == 'mobileApp') sendBackend(data)

        if (data.userType == 'backend') ws.type = 'backend'
        else if (data.userType == 'mobileApp') ws.type = 'mobileApp'


        if (ws.type == 'mobileApp' && data.request == "data") sendBackend({
            "request": "data"
        })


    });

    ws.send('something');
});



function sendMobile(d) {
    wss.clients.forEach(c => {
        if (c.type == 'mobileApp') c.send(JSON.stringify(d))
    })
}

function sendBackend(d) {
    wss.clients.forEach(c => {
        if (c.type == 'backend') c.send(JSON.stringify(d))
    })
}