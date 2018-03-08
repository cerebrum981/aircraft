var lib = {};

lib.google = {
	initMap: function(mapId, setting, callback) {
			var latLng = new google.maps.LatLng( setting.lat, setting.lng );
			this.initMap.map = new google.maps.Map(document.getElementById(mapId), {
			zoom: setting.zoom,
			center: latLng
			});
			callback();
		}
	}

lib.ajax = {
	getJsonp:function(url, callback){
		$.ajax({
	        url: url,
	        type: "GET",
	        dataType: "jsonp",
	        jsonpCallback: callback,
	        error:function(){
	        	alert()
	        }
	    });

	}
};

lib.error = function(title, head, content){
		$(".modal-title").html("<p>"+title+"</p>");
		$(".modal-body").html("<h3>"+head+"</h3><p>"+content+"</p>");
		$("#error").modal("show");
		return false;
}

lib.sortArray = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
