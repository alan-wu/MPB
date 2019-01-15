var THREE = require('zincjs').THREE;

/**
 * Provides utilities function for files IO, this is used primarily by
 * {@link PJP.BodyViewer}.
 * 
 * @class
 * @author Alan Wu
 * @returns {PJP.ModelsLoader}
 */
exports.ModelsLoader = function()  {
	var _this = this;
	var metaFilesReady = false;
	var bodyDirectoryPrefix = "models/body";
	var organsDirectoryPrefix = "models/organsViewerModels";
	this.systemMetaURL = bodyDirectoryPrefix + "/" + "bodyMeta.json";
	var systemMeta = {};
	systemMeta['human'] = {};
	systemMeta['pig'] = {};
	systemMeta['rat'] = {};
	systemMeta['mouse'] = {};
	var systemColour = {};
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
	
	/**
	 * Provide meta for available data with the provided species name.
	 * 
	 * @param {string} speciesName
	 * @returns {PJP.ModelsLoader~systemMeta}
	 */
	this.getSystemMeta = function(speciesName) {
		return systemMeta[speciesName];
	}
	
	/**
	 * Provide prefix for all the data URLs.
	 * 
	 * @returns {string}
	 */
	this.getBodyDirectoryPrefix = function() {
		return bodyDirectoryPrefix;
	}
	
	/**
	 * Provide prefix for all the model URLs.
	 * 
	 * @returns {string}
	 */
	this.getOrgansDirectoryPrefix = function() {
		return organsDirectoryPrefix;
	}
	
	/**
	 * Call the provided function which will be triggered when the system meta is ready.
	 */
	this.addSystemMetaIsReadyCallback = function(callbackFunctions) {		
		systemMetaReadyCallbackFunctions.push(callbackFunctions);
	}
	
	var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
	}
	
	this.cloneSystemMeta = function() {
    return clone(systemMeta);
}

	
	//Load the json file containing informations about models availability
	var loadSystemMetaURL = function(url) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		        var metadata = JSON.parse(xmlhttp.responseText);
		        systemMeta['human'][metadata["System"]] = metadata["Part"];
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
			xmlhttp.open("GET", _this.systemMetaURL, true);
			xmlhttp.send();
		}
	}
}
