var watchID;
var ws;

// gives the most up-to-date location
const options = {
	enableHighAccuracy: true,
	maximumAge: 0
};

const statusEl = document.getElementById('status');
const locationEl = document.getElementById('location');
const timestampEl = document.getElementById('timestamp');
const nmeaEl = document.getElementById('nmea');
const locateButtonEl = document.getElementById('locate');

// takes a GeolocationPosition object and returns a NMEA-0183 formatted GGA/fix sentence
function positionToNMEA(position) {
	const pad = (num, size) => (`000000000${num}`).slice(size * -1);

	const toDegreeMinutes = (coord, isLatitude) => {
		let degrees = Math.floor(Math.abs(coord));
		let minutes = (Math.abs(coord) - degrees) * 60;
		const hemisphere = isLatitude 
		? (coord >= 0 ? 'N' : 'S') 
		: (coord >= 0 ? 'E' : 'W');
		return `${pad(degrees, isLatitude ? 2 : 3)}${pad(minutes.toFixed(3), 7)},${hemisphere}`;
	};

	const getTime = (timestamp) => {
		const date = new Date(timestamp);
		return `${pad(date.getUTCHours(), 2)}${pad(date.getUTCMinutes(), 2)}${pad(date.getUTCSeconds(), 2)}`;
	};

	const latitude = toDegreeMinutes(position.coords.latitude, true);
	const longitude = toDegreeMinutes(position.coords.longitude, false);
	const time = getTime(position.timestamp);
	const fixQuality = position.coords.accuracy <= 1 ? 1 : 0; // 1 = GPS fix, 0 = no fix
	const numSatellites = pad(8, 2); // Not available, assume 8
	const hdop = (position.coords.accuracy / 5).toFixed(1); // Not available, approximation
	const altitude = position.coords.altitude ? position.coords.altitude.toFixed(1) : 0; // Maybe not available, default to 0
	const geoidHeight = '0.0'; // Not available
  
	// Construct the GGA sentence without the checksum
	let ggaSentence = `GPGGA,${time},${latitude},${longitude},${fixQuality},${numSatellites},${hdop},${altitude},M,${geoidHeight},M,,`;
  
	// Calculate NMEA checksum
	const checksum = ggaSentence.split('').reduce((acc, char) => acc ^ char.charCodeAt(0), 0);
	
	// Return final GGA sentence with checksum
	return `$${ggaSentence}*${checksum.toString(16).toUpperCase().padStart(2, '0')}`;
}

function success(position) {
	let date = new Date(position.timestamp);
	locationEl.href = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`;
	locationEl.textContent = `${position.coords.latitude}, ${position.coords.longitude}`;
	timestampEl.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
	
	let GGASentence = positionToNMEA(position);
	nmeaEl.textContent = GGASentence;

	if(ws.readytate == WebSocket.OPEN) {
		ws.send(GGASentence);
	} else {
		console.log('Skipping send... ws not open');
	}
}

function error(error) {
	statusEl.textContent = `Error ${error.code}: ${error.message}`;
}

function watch() {
	statusEl.textContent = 'Watching...';
	locateButtonEl.textContent = 'Stop watching';
	locateButtonEl.onclick = stop;
	watchID = navigator.geolocation.watchPosition(success, error, options);
	ws = new WebSocket('//gps.elliotbradbury.com');
}

function stop() {
	navigator.geolocation.clearWatch(watchID);
	watchID = null;
	ws.close();
	ws = null;

	statusEl.textContent = 'Stopped';
	locateButtonEl.textContent = 'Watch my location';
	locateButtonEl.onclick = watch;
}

if(navigator.geolocation) {
	statusEl.textContent = 'Ready';
} else {
	statusEl.textContent = 'This browser doesn\t have geolocation / GPS support';
}