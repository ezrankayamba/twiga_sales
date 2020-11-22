const LocationUtils = {
    capture: ({onSuccess, onFail}) => {
        if (navigator.geolocation) {
            let options = {
                timeout: 60000,
                maximumAge: 180000
            };
            navigator.geolocation.getCurrentPosition(function (loc) {
                onSuccess({lat: loc.coords.latitude, lng: loc.coords.longitude})
            }, function (err) {
                onFail(err)
            }, options);
        } else {
            console.error("No LocationUtils Capture Support!");
            alert("No LocationUtils Capture Support!");
        }
    }
}
export default LocationUtils
