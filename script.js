function createHTML(cityName, tempValue) {
	var bgClass = 'grayBg';
	var htmlString = '<div class="setBorder ' + bgClass + '">' +
		'<div class="weatherCity">' + cityName + '</div>' +
		'<div class="weatherData">' + tempValue + '</div>' +
		'</div>';
	$('#weatherResults').prepend(htmlString);
}

var locations = [];

//Create a function that will execute the Weather AJAX call
var searchWeather = function (city) {

	var searchURL = 'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$format=JSON';

	$.ajax({
		url: searchURL,
		type: 'GET',
		dataType: 'json',

		error: function (data) {
			alert("Oh no. Something went wrong...");
		},

		success: function (data) {

			$("#query").val('');

			var smallText = data.find(item => {
				return item.StationID == city
			}).StationName.En;

			var bigText = data.find(item => {
				return item.StationID == city
			}).StationName.Zh_tw;

			for (var i = 0; i < data.length; i++) {
				var stationObj = data[i];
				var lat = stationObj.StationPosition.PositionLat;
				var lon = stationObj.StationPosition.PositionLon;
				var name = stationObj.StationName.Zh_tw;
				var stationItem = [];
				stationItem.push(name);
				stationItem.push(lat);
				stationItem.push(lon);
				locations.push(stationItem)
			}

			createHTML(smallText, bigText);
		}

	});

	// HTML5/W3C Geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(UserLocation);
	}
	// Default to Washington, DC
	else
		NearestCity(38.8951, -77.0367);

};

//Code to be executed once the page has fully loaded
$(document).ready(function () {
	//Use jQuery to assign a (callback) function to occur when the 'search' button is clicked
	$("#search").on('click', function () {
		var newSearchTerm = $("#query").val().toUpperCase();
		searchWeather(newSearchTerm);
		$("#search").blur();
	});
	//Use jQuery to assign a (callback) function to occur when enter is pressed 
	$('#query').on('keypress', function (e) {
		if (e.which == 13) {
			$("#search").trigger('click');
		}
	});
});






// Callback function for asynchronous call to HTML5 geolocation
function UserLocation(position) {
	NearestCity(position.coords.latitude, position.coords.longitude);
}


function NearestCity(latitude, longitude) {
	var minDif = 99999;
	var closest;

	for (index = 0; index < locations.length; ++index) {
		var dif = PythagorasEquirectangular(latitude, longitude, locations[index][1], locations[index][2]);
		if (dif < minDif) {
			closest = index;
			minDif = dif;
		}
	}

	console.log(locations[closest]);

	// echo the nearest city
	// alert(locations[closest]);
}



// Convert Degress to Radians
function Deg2Rad(deg) {
	return deg * Math.PI / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
	lat1 = Deg2Rad(lat1);
	lat2 = Deg2Rad(lat2);
	lon1 = Deg2Rad(lon1);
	lon2 = Deg2Rad(lon2);
	var R = 6371; // km
	var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
	var y = (lat2 - lat1);
	var d = Math.sqrt(x * x + y * y) * R;
	return d;
}