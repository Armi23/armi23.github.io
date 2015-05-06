// Given click on country, launch simulation
function clickCountry (lat, lng) {
  requestGeocode(lat, lng, launchModel, null);
}

// Get info about latitude and longitude
function requestGeocode(lat, lng, callback, options) {
  var latlng = new google.maps.LatLng(lat, lng);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'latLng': latlng }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      console.log("Over Query Limit, waiting on queries");

      pause();
      setTimeout(function() {
        play();
      }, 4000);
    } else if (status == google.maps.GeocoderStatus.OK) {
      first = results[0]; // Assume results have same country
      callback(first, lat, lng, options)
    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      console.log("not a valid point");
    } else {
      console.log('Geocoder failed due to: ');
      console.log(status);
    }
  });
}