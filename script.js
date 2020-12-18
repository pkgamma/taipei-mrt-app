let stationsJson = [];
let stationsArray = [];

// run when page loads
$(document).ready(function () {
	apiOperation();

	// for hitting "search" btn
	$("#search").on('click', function () {
		let inputStationID = $("#query").val().toUpperCase();
		printByStationID(inputStationID);
		$("#search").blur();
	});

	// for hitting "closest station" btn
	$("#get_nearest_station").on('click', function () {
		// HTML5/W3C get geolocation
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(printByNearestStation);
		}
	});

	// for pressing enter key
	$('#query').on('keypress', function (e) {
		if (e.which == 13) {
			$("#search").trigger('click');
		}
	});
});

function createHTML(smallText, bigText) {
	let htmlString =
		'<div class="setBorder">' +
		'<div class="smallText">' + smallText + '</div>' +
		'<div class="bigText">' + bigText + '</div>' +
		'</div>'
		;
	$('#dynamicContent').prepend(htmlString);
}

function apiOperation() {
	$.ajax({
		url: 'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$format=JSON',
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			// copy response body to our own variable
			stationsJson = data;
			// add all stations to stationsArray
			for (let i = 0; i < data.length; i++) {
				let stationObj = data[i];
				let lat = stationObj.StationPosition.PositionLat;
				let lon = stationObj.StationPosition.PositionLon;
				let stationID = stationObj.StationID;
				let name = stationObj.StationName.Zh_tw;

				let stationsArrayItem = [];
				stationsArrayItem.push(name);
				stationsArrayItem.push(lat);
				stationsArrayItem.push(lon);
				stationsArrayItem.push(stationID);

				stationsArray.push(stationsArrayItem);
			}
		}
	});
}

function printByStationID(stationID) {
	let smallText = stationsJson.find(item => {
		return item.StationID == stationID
	}).StationName.En;

	let bigText = stationsJson.find(item => {
		return item.StationID == stationID
	}).StationName.Zh_tw;

	createHTML(smallText, bigText);
}

// callback function for asynchronous call to HTML5 geolocation
function printByNearestStation(position) {
	stationID = findNearestStation(position.coords.latitude, position.coords.longitude);
	printByStationID(stationID);
}

function findNearestStation(latitude, longitude) {
	let minDif = 99999;
	let closest;
	for (index = 0; index < stationsArray.length; ++index) {
		let dif = PythagorasEquirectangular(latitude, longitude, stationsArray[index][1], stationsArray[index][2]);
		if (dif < minDif) {
			closest = index;
			minDif = dif;
		}
	}
	return stationsArray[closest][3];
}

function Deg2Rad(deg) {
	return deg * Math.PI / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
	lat1 = Deg2Rad(lat1);
	lat2 = Deg2Rad(lat2);
	lon1 = Deg2Rad(lon1);
	lon2 = Deg2Rad(lon2);
	let R = 6371; // km
	let x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
	let y = (lat2 - lat1);
	let d = Math.sqrt(x * x + y * y) * R;
	return d;
}