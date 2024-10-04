const WebSocket = require('ws');
const net = require('net');

var lastMessage = null;

const wsServer = new WebSocket.Server({ port: 3000 });
const wsClients = new Set();

const tcpServer = new net.createServer();
const tcpClients = new Set();
tcpServer.listen(4000, '127.0.0.1', () => console.log('TCP server listening on port 4000'));

wsServer.on('connection', (ws) => {
    console.log('WebSocket connection received');
    wsClients.add(ws);

    // When WebSocket message is received from the browser, pass it along 
    ws.on('message', (message) => {
        console.log('Received from WebSocket:', message.toString());
        lastMessage = message.toString();

        tcpClients.forEach(client => {
            console.log('Sending last message to TCP client');
            try {
                client.write(lastMessage);
            } catch(e) {
                console.log(e);
                tcpClients.delete(client);
            }
        });
    });

    // Clean up
    ws.on('close', () => {
        console.log('WebSocket client disconnected')
        wsClients.delete(ws);
    });
});

tcpServer.on('connection', (tcpClient) => {
    console.log('TCP connection received');
    tcpClients.add(tcpClient);

    // Handle gpsd data
    tcpServer.on('data', (data) => {
        console.log('Received from gpsd:', data.toString());

        // Optionally send back to the WebSocket client
        ws.send(data.toString());
    });

    // Handle connection end
    tcpServer.on('end', () => {
        console.log('TCP client disconnected');
        tcpClients.delete(tcpClient);
    });

    // tcpClient.write('?WATCH={"enable":true,"json":true,"nmea":true}\n');
    if(lastMessage) {
        try {
            tcpClient.write(lastMessage);
        } catch(e) {
            console.log(e);
            // tcpClients.delete(client);
        }
    }
});
