var bodyDirectoryPrefix = "models/body";
var organsDirectoryPrefix = "models/organsViewerModels";
var metaURL = bodyDirectoryPrefix + "/" + "bodyMeta.json";
var systemMeta = [];
var ITEM_LOADED = { FALSE: -1, DOWNLOADING: 0, TRUE: 1 };
var systemColour = new Array();
systemColour["Cardiovascular"] = new THREE.Color("rgb(50%, 12%, 0%)");
systemColour["Digestive"] = new THREE.Color("mistyrose");
systemColour["Respiratory"] = new THREE.Color("palevioletred");
systemColour["Male Reproductive"] = new THREE.Color("salmon");
systemColour["Brain & Central Nervous"] = new THREE.Color("peachpuff");
systemColour["Skin (integument)"] = new THREE.Color("rgb(90%, 70%, 50%)");
systemColour["Urinary"] = new THREE.Color("rgb(50%, 12%, 10%)");
systemColour["Musculo-skeletal"] = new THREE.Color("rgb(90%, 90%, 70%)");

var partColour = new Array();
partColour["Muscle"] = new THREE.Color("rgb(50%, 12%, 10%)");

var setGeometryColour = function(geometry, systemName, partName) {
	if(systemColour.hasOwnProperty(systemName))
		geometry.morph.material.color = systemColour[systemName];
	for (var key in partColour) {
		if (partName.includes(key)) {
			if(partColour.hasOwnProperty(key))
				geometry.morph.material.color = partColour[key];
		}
	}
}


var readMetaFile = function(systemName, partMap) {
	systemMeta[systemName] = partMap;
	readBodyRenderModel(systemName, partMap);
}

var loadSystemMetaURL = function(url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	        var metadata = JSON.parse(xmlhttp.responseText);
	        readMetaFile(metadata["System"], metadata["Part"]);
	    }
	}
	var requestURL = bodyDirectoryPrefix + "/" + url;
	xmlhttp.open("GET", requestURL, true);
	xmlhttp.send();	
}

var initialiseLoading = function() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	        var metadata = JSON.parse(xmlhttp.responseText);
	        var metaLocations = metadata["SystemMetaLocation"];
	        for (var i = 0; i < metaLocations.length; i++)
	        	loadSystemMetaURL(metaLocations[i]);
	    }
	}
	xmlhttp.open("GET", metaURL, true);
	xmlhttp.send();	
}