var APP = {
	url:  window.location.href,
	newUrl:  window.location.href,
	json:'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?callback=?',
	google:{
		settings:{ zoom:8 },
		marker:[]
	},
	table:[],
	tableHash:{},
	refreshError:0	
};

function getJsonp(json){

		APP.setMarkers(json);

}


APP.setMarkers = function(planes){

	if(APP.refreshError>20*1000){

		return lib.error('Google Error', 'Map Bound False', 'Please try to refresh browser');

	}

	var map = lib.google.initMap.map;

	if(!map.getBounds()){

		APP.mapError+=100;
		setTimeout(function() {
				APP.setMarkers(planes);
		},100);

		return false;
	}

	APP.table=[];
	APP.refreshError = 0;
	var plane = planes.acList;

	for(var i=0; i<plane.length; i++){

		var oldLng='';
		var oldLat='';
		var p = plane[i].Id; 

		if( plane[i].Lat && plane[i].Long){

			var coords = { lat: plane[i].Lat, lng: plane[i].Long };

			if(map.getBounds().contains({ lat:plane[i].Lat, lng:plane[i].Long })) {
				
				if(APP.google.marker[p]){ oldLng = APP.google.marker[p].getPosition().lng(); oldLat = APP.google.marker[p].getPosition().lat();}


				var companyLogo, planeIco, fcn;
				var images =  'https://global.adsbexchange.com/VirtualRadar/images/File-'; 

				if(plane[i].Icao && plane[i].OpIcao){
					companyLogo = images+plane[i].Icao+'|'+plane[i].OpIcao+'/OpFlag.png';
				} else {
					companyLogo = 'https://global.adsbexchange.com/VirtualRadar/images/File-8964C2|B789/Type.png'
				}

				if(plane[i].Icao && plane[i].Type){
					planeIco = images+plane[i].Icao+'|'+plane[i].Type+'/Type.png'
				}
				if(plane[i].CNum){
					fcn = plane[i].CNum;
				}

				APP.table.push({
					id: plane[i].Id,
					company: companyLogo, 
					plane: planeIco, 
					Altitiude: plane[i].Alt||0, 
					oldLng:oldLng, 
					oldLat:oldLat,
					lng:plane[i].Long,
					fcn: fcn||'Unknown',
					model: plane[i].Mdl||'Unknown',
					man: plane[i].Man||'Unknown',
					op: plane[i].Op||'Unknown',
					from: plane[i].From||'Unknown',
					to: plane[i].To||'Unknown'
				});

			} 	var ico = './img/red.png';
				if(APP.google.marker[p]){
					ico = './img/plane-left.png';
					if(oldLng<plane[i].Long || (oldLng>170 && plane[i].Long>-180)){
						ico = './img/plane-right.png';
					}
				 	APP.google.marker[p].setIcon(ico);
				 	APP.google.marker[p].setPosition(coords);	

				} else {

			        APP.google.marker[p] = new google.maps.Marker({
			          map: map,
			          position: coords,
			          icon: ico
			        });

			    }
		}

	};
	//	APP.table.sort(sortArray("-Altitiude"));
		document.getElementById('plane-list').innerHTML='';
		APP.table.sort(lib.sortArray("-Altitiude"));

		for(var i=0; i<APP.table.length; i++){
			var style='';
			var id = APP.table[i].id;
			APP.tableHash[id] = APP.table[i]; 
			var Alt = APP.table[i].Altitiude||'Unknown'
			/*
			var company = '<tr><td><img src="'+APP.table[i].company+'" alt="Company logo"> ';*/
			if(APP.table[i].oldLng<APP.table[i].lng || (APP.table[i].oldLng>170 && APP.table[i].lng>-180)){
				style = 'style="-webkit-transform: scaleX(-1); transform: scaleX(-1);"';	
			}
			var planeImage = '<tr id="id-'+APP.table[i].id+'"><td><img src="'+APP.table[i].plane+'" ' + style +'></td><td>';
			var altitiude = Alt+'</td><td>';
			var fcn = APP.table[i].fcn+'</td><tr>';
			document.getElementById('plane-list').innerHTML += planeImage + altitiude + fcn;
		}
  		$('.fullscreen-loading-rotate').fadeOut( "slow", function() {});

  		setTimeout(function(){
  			lib.ajax.getJsonp(APP.json, 'getJsonp');
  		},60*1000);
}

APP.googleMapLoad = function(position){


	APP.google.settings.lat =  position.coords.latitude;
	APP.google.settings.lng = position.coords.longitude;


	lib.google.initMap('app-map', APP.google.settings, function(){

		lib.ajax.getJsonp(APP.json, 'getJsonp');

	});

}

APP.startUp = function(){


	if(sessionStorage.success){

		APP.googleMapLoad();
		return;
	}


	navigator.geolocation.watchPosition(function(position) {
	  console.log("test");
	},
	function (error) { 
	  if (error.code == error.PERMISSION_DENIED){
	     lib.error('Application Error', 'Geolocation Error', 'You must enable Geolocation to use this application.');
	 	$('.modal-footer').prepend('<button type="button" onclick="location.reload();" class="btn btn-primary">Try Again</button>');
	  }
	});


    if (navigator.geolocation) {
    	//sessionStorage.setItem("success", true);
        navigator.geolocation.getCurrentPosition(APP.googleMapLoad, function(){
        	lib.error('Application Error', 'Geolocation Error', 'Poor internet connection.<br>Try to restart application or browser.');
        }, {
			  enableHighAccuracy: true,
			  timeout: 5000,
			  maximumAge: 0
			});
    } else { 

    	lib.error('Application Error', 'Geolocation Error', 'Connecting to the network is taking longer than usual.<br>Try to restart application or browser.');

    }

}


$(document).on('click','tr>td', function(){
	var url = window.location.href;
		url = url.split('#');
		url = url[0];
		var id = $(this).parent().attr('id');
		$(location).attr('href', url+'#flight-info-'+id);
		$('#page-info').html('');
		$('#page-map').css({'display':'none'});

		//var id = this.id;
		id = id.replace(/\D/g,'');

			$.ajax({
	            url: "https://autocomplete.clearbit.com/v1/companies/suggest?query=:"+APP.tableHash[id].op,
	            type: 'GET',
	            contentType: "application/json; charset=utf-8",
	            traditional: true,
	            success: function (result) { 	

	            	var logo = '<img src="https://logo.clearbit.com/unknownworlds.com" alt="Company Logo">';
	            	if(result.length>0){
		            	logo = '<img src="'+result[0].logo+'" alt="Company Logo">';
		            } 


	            	var model = "Model: "+APP.tableHash[id].model;
	            	var man = "Manufacturer: "+APP.tableHash[id].man;
	            	var from = "From: "+APP.tableHash[id].from;
	            	var To = "To: "+ APP.tableHash[id].to;
	            	var op = APP.tableHash[id].op;
					$('#page-info').html('<div id="plane-info">'+logo+'<br><br>'+model+'<br>'+man+'<br>'+from+'<br>'+To+'</div>');
	            }

	        });


});

APP.pageInfo = function(){

}

APP.ajaxHistory = function(){

	var newUrl = window.location.href;

	if(newUrl == APP.url){ 
		$('#page-map').css({'display':'block'});
		$('#page-info').css({'display':'none'});

	} else {
		$('#page-map').css({'display':'none'});
		$('#page-info').css({'display':'table'});

		//APP.pageInfo();
	}

}

setInterval(APP.ajaxHistory, 200);

$(document).ready(function() {
    APP.startUp();
});
