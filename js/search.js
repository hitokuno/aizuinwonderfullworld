var interval= 10 * 1000;
var duration=200;
var fractuation=10;
var currentLocation=1;
var mapZoom=8;
var files;
var address;
var timer;
var map;
var firstLocation="37_48773x139_929809.txt";
var loc=firstLocation.replace(".txt","").replace(/_/g,".").split("x");
var from = new google.maps.LatLng(loc[0],loc[1]);
var latitude="./data/latitude.txt";
var longitude="./data/longitude.txt";
var locationURI=latitude;
var geocoder = new google.maps.Geocoder();
var ajax_cf = new ContentFlow('flow', {
        reflectionHeight : 0,
        flowDragFriction : 0,
        scrollWheelSpeed : 0
      } ) ;

jQuery(document).ready(function(){
	initialLoad();
});

function initialLoad() {
	jQuery.ajax({
		async: false,
		url: locationURI,
		cache: false,
		dataType: 'text'
	})
	.done(function(data) {
		var i;
		currentLocation=1;
		files=data.split("\n");
		try{
			var items=ajax_cf.getNumberOfItems();
			getPicture(files[currentLocation]);
		} catch(e) {
			var img=jQuery("#flow img")[0];
			getMap(img.getAttribute("lat"), img.getAttribute("lon"));
			for ( i=0; i < 6; i++ ) {
				getPicture(files[currentLocation]);
			}
		}
		setTimeout(add, interval);
		console.log("Load location files:success");
	})
	.fail(function(XMLHttpRequest, textStatus, errorThrown) {
		alert(errorThrown.message);
		console.log("Load location files:error");
		console.log(errorThrown.message);
	})
	.always(function() {
		console.log("Load location files:complete");
	});
}

function findNextFile() {
	var file=Math.round(Math.random()*fractuation);
	currentLocation=currentLocation+file;
	if ( currentLocation > files.length) {
		currentLocation=currentLocation-files.length;
	}
	return files[currentLocation];
}

function addPicture(data){
	var images=data.split("\n");
	var i=Math.round(Math.random()*(images.length-3))+1;
	var strs=images[i].split(" ");
	if (typeof strs[5] == 'undefined') {
		return;
	}
	var url="http://farm"+strs[5]+".staticflickr.com/"+strs[4]+"/"+strs[2]+"_"+strs[3]+".jpg";
	var img = document.createElement("img");
	img.src=url;
	img.class="item";
	img.lat=strs[0];
	img.lon=strs[1];
	img.id="id"+strs[2];
	var fileInfo=files[currentLocation].split("	");
	img.address1=fileInfo[1];
	img.address2=fileInfo[2];
	img.address3=fileInfo[3];
	img.wiki=fileInfo[4];
	img.flag=fileInfo[5];
	img.anthem=fileInfo[6];
	img.anthemURI=fileInfo[7];
	var items=jQuery("#flow img").length;
	if ( items < 8 ) {
		ajax_cf.addItem(img, 'last');
	}
	if ( items > 7 ) {
		var activeItem=ajax_cf.getActiveItem();
		var replaceIndex=(activeItem.index+4)%8;
		var replaceItem=ajax_cf.getItem(replaceIndex);
		replaceItem.image.src=img.src;
		replaceItem.image.lat=img.lat;
		replaceItem.image.lon=img.lon;
		replaceItem.image.id=img.id;
		replaceItem.image.address1=img.address1;
		replaceItem.image.address2=img.address2;
		replaceItem.image.address3=img.address3;
		replaceItem.image.wiki=img.wiki;
		replaceItem.image.flag=img.flag;
		replaceItem.image.anthem=img.anthem;
		replaceItem.image.anthemURI=img.anthemURI;
	}
	if ( items > 1 ) {
		getImgMap(ajax_cf.getActiveItem().next);
		setLocationInfo(ajax_cf.getActiveItem().next);
		ajax_cf.moveTo('right');
	}
}

function getPicture(file) {
	var fileInfo=file.split("	");
	var url="./data/summary/" + fileInfo[0];
	jQuery.ajax({
		async: false,
		url: url,
		cache: false,
		dataType: 'text'
	})
	.done(function(data) {
		if ( data.split("\n").length>1 ) {
			addPicture(data);
		}
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
}

function add() {
	findNextFile();
	getPicture(files[currentLocation]);
	clearTimeout(timer);
	timer=setTimeout(add, interval);
}

function getImgMap(img) {
	if (typeof img == 'undefined') { return; }
	var lat=img.content.lat;
	var lon=img.content.lon;
	getMap(lat, lon);
}

function getMap(lat, lon) {
	var latlng = new google.maps.LatLng(lat, lon);
	dist = google.maps.geometry.spherical.computeDistanceBetween(from, latlng);
	dist = Math.round(dist/1000);
    jQuery("#Latitude")[0].innerHTML=lat;
    jQuery("#Longitude")[0].innerHTML=lon;
    jQuery("#Distance")[0].innerHTML=dist;
	var option = {
		zoom: mapZoom,
		center: latlng,
		scaleControl: true
	};
	map = new google.maps.Map(document.getElementById('map'), option);
	var markerOption = {
		position: map.getCenter(),
		map: map
    };
    var marker = new google.maps.Marker(markerOption);
    google.maps.event.addListener(map, 'zoom_changed', function() {
		mapZoom = map.getZoom();
    });
}

function setLocationInfo(img) {
	jQuery("#address1")[0].innerHTML=img.content.address1;
	jQuery("#address2")[0].innerHTML=img.content.address2;
	jQuery("#address3")[0].innerHTML=img.content.address3;
	jQuery("#flag").attr("src",img.content.flag);
	jQuery("#wiki").attr("href",img.content.wiki);
	jQuery("#wiki").html("Wiki");
	if ( img.content.wiki==="" ) {
		jQuery("#wiki").removeAttr("href");
		jQuery("#wiki").html("");
	}
	jQuery("#anthem").html(img.content.anthem);
	jQuery("#anthem").attr("src",img.content.anthemURI);
}

jQuery(".sound .btn").click(function() {
	jQuery(".sound .btn").removeClass('active');
	jQuery(this).addClass('active');
	var audio = document.getElementById("sound");
	var canPlayOgg = ("" !== audio.canPlayType("audio/ogg"));
	var ext="mp3";
	if(canPlayOgg){
		ext="ogg";
	}
	if ( this.innerHTML=="Off" ) {
		audio.pause();
	}
	if ( this.innerHTML=="Birds" ) {
		audio.src="http://www.soundrown.com/Audio/Final%20Normalized/" + ext + "/Birds%20Final%20Thirty."+ext;
		audio.load();
		audio.play();
	}
	if ( this.innerHTML=="Waves" ) {
		audio.src="http://www.soundrown.com/Audio/Final%20Normalized/" + ext + "/Waves%20Final%20Thirty."+ext;
		audio.load();
		audio.play();
	}
});

jQuery(".direction .btn").click(function() {
	jQuery(".direction .btn").removeClass('active');
	jQuery(this).addClass('active');
	if ( this.innerHTML=="Latitude" ) {
		locationURI=latitude;
		initialLoad();
	}
	if ( this.innerHTML=="Longitude" ) {
		locationURI=longitude;
		initialLoad();
	}
});

jQuery("select").change(function () {
      jQuery("select option:selected").each(function () {
			var zoom=parseInt( jQuery(this).text(), 10);
			map.setZoom(zoom);
            mapZoom = zoom;
          });
    })
    .trigger('change');
