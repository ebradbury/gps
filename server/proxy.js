const WebSocket = require('ws');
const net = require('net');

const lastMessage = null;

const wsServer = new WebSocket.Server({ port: 3000 });
const wsClients = new Set();

const tcpServer = new net.Server({ post: 4000 });
const tcpClients = new Set();

wsServer.on('connection', (ws) => {
    console.log('WebSocket connection received');
    wsClients.add(ws);

    // Connect to gpsd over TCP
    const gpsdSocket = new net.Socket();
    gpsdSocket.connect(gpsdPort, gpsdHost, () => {
        console.log('Connected to gpsd');

        setTimeout(() => {
            console.log("Sending WATCH command");
            gpsdSocket.write('?WATCH={"enable":true,"json":true,"nmea":true}\n');
        }, 1000);
    });

    // When WebSocket message is received from the browser, pass it along 
    ws.on('message', (message) => {
        console.log('Received from WebSocket:', message.toString());
        lastMessage = message.toString();

        tcpClients.forEach(client => {
            console.log('Sending last message to TCP client');
            client.write(lastMessage);
        });
    });

    // Clean up
    ws.on('close', () => {
        console.log('WebSocket client disconnected')
        wsClients.delete(ws);
    });
});

tcpServer.on('connection', (tcpClient) => {
    console.log('TCP connected received');
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

    tcpClient.write('?WATCH={"enable":true,"json":true,"nmea":true}\n');
    if(lastMessage) {
        tcpClient.write(lastMessage);
    }
});
