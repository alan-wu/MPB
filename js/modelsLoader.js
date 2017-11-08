PJP.ModelsLoader = function()  {
	var _this = this;
	var metaFilesReady = false;
	var bodyDirectoryPrefix = "models/body";
	var organsDirectoryPrefix = "models/organsViewerModels";
	var metaURL = bodyDirectoryPrefix + "/" + "bodyMeta.json";
	var systemMeta = [];
	var systemColour = new Array();
	var numberOfDownloadings = 0;
	var systemMetaReadyCallbackFunctions = [];
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
	
	this.setGeometryColour = function(geometry, systemName, partName) {
		if(systemColour.hasOwnProperty(systemName))
			geometry.morph.material.color = systemColour[systemName];
		for (var key in partColour) {
			if (partName.includes(key)) {
				if(partColour.hasOwnProperty(key))
					geometry.morph.material.color = partColour[key];
			}
		}
	}
	
	this.getSystemMeta = function() {
		return systemMeta;
	}
	
	this.getBodyDirectoryPrefix = function() {
		return bodyDirectoryPrefix;
	}
	
	this.getOrgansDirectoryPrefix = function() {
		return organsDirectoryPrefix;
	}
	
	
	this.addSystemMetaIsReadyCallback = function(callbackFunctions) {		
		systemMetaReadyCallbackFunctions.push(callbackFunctions);
	}
	
	var loadSystemMetaURL = function(url) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		        var metadata = JSON.parse(xmlhttp.responseText);
		        systemMeta[metadata["System"]] = metadata["Part"];
		        numberOfDownloadings = numberOfDownloadings - 1;
		        if (numberOfDownloadings == 0) {
		        	metaFilesReady = true;
		        	for (i = 0; i < systemMetaReadyCallbackFunctions.length; i++) {
		        		systemMetaReadyCallbackFunctions[i].call();
		        	}
		        }
		    }
		}
		var requestURL = url;
		xmlhttp.open("GET", requestURL, true);
		xmlhttp.send();
	}

	this.initialiseLoading = function() {
		if (metaFilesReady == false) {
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
			    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			        var metadata = JSON.parse(xmlhttp.responseText);
			        var metaLocations = metadata["SystemMetaLocation"];
			        numberOfDownloadings = metaLocations.length;
			        for (var i = 0; i < metaLocations.length; i++)
			        	loadSystemMetaURL(metaLocations[i]);
			    }
			}
			xmlhttp.open("GET", metaURL, true);
			xmlhttp.send();
		}
	}
}
