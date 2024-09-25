var watchID;

// gives the most up-to-date location
const options = {
	enableHighAccuracy: true,
	maximumAge: 0
};

const statusEl = document.getElementById('status');
const locationEl = document.getElementById('location');
const timestampEl = document.getElementById('timestamp');
const locateButtonEl = document.getElementById('locate');

function success(position) {
	let date = new Date(position.timestamp);
	locationEl.href = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`;
	locationEl.textContent = `${position.coords.latitude}, ${position.coords.longitude}`;
	timestampEl.textContent = `updated at ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

function error(error) {
	statusEl.textContent = `Error ${error.code}: ${error.message}`;
}

function watch() {
	statusEl.textContent = 'Watching...';
	locateButtonEl.textContent = 'Stop watching';
	watchID = navigator.geolocation.watchPosition(success, error, options);
}

function stop() {
	clearWatch(watchID);
	statusEl.textContent = 'Stopped';
	locateButtonEl.textContent = 'Watch my location';
}

if(navigator.geolocation) {
	statusEl.textContent = 'Ready';
} else {
	statusEl.textContent = 'This browser doesn\t have geolocation / GPS support';
}