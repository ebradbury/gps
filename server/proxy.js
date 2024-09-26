const express = require('express');
const net = require('net');

const app = express();
app.use(express.json());

// GPSD server connection details
const gpsdHost = 'localhost';
const gpsdPort = 2947;

app.post('/', (req, res) => {
    const gpsdSocket = new net.Socket();
    gpsdSocket.connect(gpsdPort, gpsdHost, () => {
        console.log('Connected to gpsd');

        // Send the request body (assumed JSON format) to gpsd
        gpsdSocket.write(JSON.stringify(req.body));
        gpsdSocket.end();
    });

    res.send('Data sent to gpsd');
});

app.listen(8080, () => {
    console.log('HTTP server running on port 8080');
});
