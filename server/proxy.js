const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 3000 });

// GPSD server connection details
const gpsdHost = 'localhost';
const gpsdPort = 2947;

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Connect to gpsd over TCP
    const gpsdSocket = new net.Socket();
    gpsdSocket.connect(gpsdPort, gpsdHost, () => {
        console.log('Connected to gpsd');
    });

    // When WebSocket message is received from the browser
    ws.on('message', (message) => {
        console.log('Received from WebSocket:', message.toString());

        // Send the data to gpsd over TCP
        gpsdSocket.write(message.toString());
    });

    // Handle gpsd data
    gpsdSocket.on('data', (data) => {
        console.log('Received from gpsd:', data.toString());

        // Optionally send back to the WebSocket client
        ws.send(data.toString());
    });

    // Clean up
    ws.on('close', () => {
        gpsdSocket.end();
    });
});