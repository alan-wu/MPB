require("../styles/my_styles.css");
var THREE = require('zincjs').THREE;
var ITEM_LOADED = require("../utility").ITEM_LOADED;

/**
 * Provides rendering of the 3D-scaffold data in the dom of the provided id with models
 * defined in the modelsLoader.
 * @class
 * @param {PJP.ModelsLoader} ModelsLoaderIn - defined in modelsLoade.js, providing locations of files.
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.BodyViewer} on.
 * 
 * @author Alan Wu
 * @returns {PJP.BodyViewer}
 */
var BodyViewer = function(ModelsLoaderIn)  {
  (require('./RendererModule').RendererModule).call(this);
	var currentSpecies = 'human';
	var bodyScenes = new Array();
	bodyScenes['human'] = undefined;
	bodyScenes['pig'] = undefined;
	bodyScenes['mouse'] = undefined;
	bodyScenes['rat'] = undefined;
	// Flag for removing geometry from ZincScene when not visgble, thus freeing the memory. Default is false.
	var removeWhenNotVisible = false;
	var modelsLoader = ModelsLoaderIn;
	var systemPartAddedCallbacks = new Array();
	//Represents each physiological organ systems as folder in the dat.gui.
	var systemList =["Musculo-skeletal", "Cardiovascular", "Respiratory", "Digestive",
	  "Skin (integument)", "Urinary", "Brain & Central Nervous", "Immunological",
	  "Endocrine", "Female Reproductive", "Male Reproductive", "Special sense organs"];
	var systemMeta = undefined;
	var _this = this;
	_this.typeName = "Body Viewer";
	
	/**
	 * This callback is triggered when a body part is clicked.
	 * @callback
	 */
	var _pickingBodyCallback = function() {
		return function(intersects, window_x, window_y) {
			var bodyClicked = false;
			for (var i = 0; i < intersects.length; i++) {
				if (intersects[i] !== undefined && (intersects[ i ].object.name !== undefined)) {
					if (!intersects[ i ].object.name.includes("Body")) {
						_this.setSelectedByObjects([intersects[ i ].object], true);
						return;
					} else {
						bodyClicked = true;
					}
				}
			}
		}	
	};
	
	/**
	 * This callback is triggered when a body part is hovered over by the mosue.
	 * @callback
	 */
	var _hoverBodyCallback = function() {
		return function(intersects, window_x, window_y) {
			var bodyHovered = false;
			for (var i = 0; i < intersects.length; i++) {
				if (intersects[i] !== undefined && (intersects[ i ].object.name !== undefined)) {
					if (!intersects[ i ].object.name.includes("Body")) {
					  _this.displayArea.style.cursor = "pointer";
					  _this.toolTip.setText(intersects[ i ].object.name);
					  _this.toolTip.show(window_x, window_y);
				    _this.setHighlightedByObjects([intersects[ i ].object], true);
						return;
					} else {
						bodyHovered = true;
					}
				}
			}
			_this.setHighlightedByObjects([], true);
			if (bodyHovered) {
			  _this.displayArea.style.cursor = "pointer";
			  _this.toolTip.setText("Body");
			  _this.toolTip.show(window_x, window_y);
			} else {
			  _this.toolTip.hide();
			  _this.displayArea.style.cursor = "auto";
			}
			
		}
	};

	var removeGeometry = function(systemName, name) {
		if (removeWhenNotVisible) {
			var speciesMeta = systemMeta[currentSpecies];
			if (speciesMeta[systemName].hasOwnProperty(name) && speciesMeta[systemName][name].geometry) {
				currentScene.removeZincGeometry(speciesMeta[systemName][name].geometry);
				speciesMeta[systemName][name]["loaded"] = ITEM_LOADED.FALSE;
				speciesMeta[systemName][name].geometry = undefined;
			}
			
		}
	}
	
	/**
	 * This is called when a body part visibility control is switch on/off.
	 * @callback
	 */
	this.changeBodyPartsVisibility = function(name, systemName, value) {
    var speciesMeta = systemMeta[currentSpecies];
		if (speciesMeta[systemName].hasOwnProperty(name) && speciesMeta[systemName][name].geometry) {
		  speciesMeta[systemName][name].geometry.setVisibility(value);
		}
		if (value == false) {
			removeGeometry(systemName, name);
		} else {
			readModel(systemName, name, false);
		}
	}
	
	var _addBodyPartCallback = function(systemName, partName, item, scaling, useDefautColour, startup) {
		return function(geometry) {
			item["loaded"] = ITEM_LOADED.TRUE;
			item.geometry = geometry;
			if (startup) {
        for (var i = 0; i < systemPartAddedCallbacks.length;i++) {
          systemPartAddedCallbacks[i](systemName, partName,
            (item["loaded"] == ITEM_LOADED.TRUE));
        }
			}
			if (scaling == true) {
				geometry.morph.scale.x = 1.00;
				geometry.morph.scale.y = 1.00;
				geometry.morph.scale.z = 1.03;
				//geometry.morph.position.y = 20;
				geometry.morph.position.z = -47;
			}
			if (useDefautColour)
				modelsLoader.setGeometryColour(geometry, systemName, partName);
			if (partName == "Body") {
				geometry.setAlpha(0.5);
				geometry.morph.material.side = THREE.FrontSide;
			}
			var annotation = new (require('../utilities/annotation').annotation)();
			annotation.data = {species:currentSpecies, system:systemName, part:partName};
			geometry.userData = [annotation];
		}
	}
	
	this.getSystemList = function() {
	  return systemList;
	}
	
	this.changeSpecies = function(speciesName) {
	  currentSpecies = speciesName;
	  var scene = _this.zincRenderer.getSceneByName(currentSpecies);
	  if (scene == undefined) {
	    scene = _this.zincRenderer.createScene(currentSpecies);
	  }
	  _this.scene = scene;
	  _this.zincRenderer.setCurrentScene(scene);
	}
	
	this.addSystemPartAddedCallback = function(callback) {
	  if (typeof(callback === "function"))
	    systemPartAddedCallbacks.push(callback);
	}
	
	this.forEachPartInBody = function(callback) {
    var speciesMeta = systemMeta[currentSpecies];
    for (var systemName  in speciesMeta) {
      var partMap = speciesMeta[systemName];
      for (var partName in partMap) {
        if (partMap.hasOwnProperty(partName)) {
          var item = partMap[partName];
          var visibility = false;
          if (item && (item["loaded"] === ITEM_LOADED.TRUE) && item.geometry) {
            visibility = item.geometry.morph.visible;
          }
          callback(systemName, partName, visibility);
        }
      }
    }
	}
	 
	/**
	 * Initialise the {@link PJP.BodyViewer}, it will create a detached renderer until
	 * a display area is passed in as an argument on intialiseRenderer.
	 */
	var initialise = function() {
	  _this.initialiseRenderer(undefined);
	  if (_this.zincRenderer) {
      _this.scene = _this.zincRenderer.createScene("human");
      _this.zincRenderer.setCurrentScene(_this.scene);
      _this.scene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
      var directionalLight = _this.scene.directionalLight;
      directionalLight.intensity = 1.4;
      var zincCameraControl = _this.scene.getZincCameraControls();
      zincCameraControl.enableRaycaster(_this.scene, _pickingBodyCallback(), _hoverBodyCallback());
      zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
      zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
	  }
	}
		
	var readModel = function(systemName, partName, startup) {
	  if (_this.scene) {
      var speciesMeta = systemMeta[currentSpecies];
  		item = speciesMeta[systemName][partName];
  		if (item["loaded"] ==  ITEM_LOADED.FALSE) {
  			var downloadPath = item["BodyURL"];
  			var scaling = false;
  			item["loaded"] =  ITEM_LOADED.DOWNLOADING;
  			if (item["FileFormat"] == "JSON") {
  				if (systemName == "Musculo-skeletal" || systemName == "Skin (integument)")
  					scaling = true;
  				_this.scene.loadMetadataURL(downloadPath, _addBodyPartCallback(systemName, partName, item, scaling, false, startup));
  			}
  			else if (item["FileFormat"] == "STL")
  			  _this.scene.loadSTL(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
  			else if (item["FileFormat"] == "OBJ") 
  			  _this.scene.loadOBJ(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
  		}
	  }
	}
	
	var readBodyRenderModel = function(systemName, partMap) {
		for (var partName in partMap) {
			if (partMap.hasOwnProperty(partName)) {
				var item = partMap[partName];
				item["loaded"] = ITEM_LOADED.FALSE;
				if (item["loadAtStartup"] == true) {
					readModel(systemName, partName, true);
				} else {
	        for (var i = 0; i < systemPartAddedCallbacks.length;i++) {
	          systemPartAddedCallbacks[i](systemName, partName, false);
	        }
				}
			}
		}
	}
	
	/**
	 * Signal the {@link PJP.BodyViewer} to start reading the meta file.
	 * @async
	 */
	this.readSystemMeta = function() {
	  if (!systemMeta) {
  		systemMeta = modelsLoader.cloneSystemMeta();
  		var speciesMeta = systemMeta[currentSpecies];
  		//systemMeta = systemMeta.slice();
  		for (var speciesItem  in speciesMeta) {
  			readBodyRenderModel(speciesItem, speciesMeta[speciesItem]);	
  		}
	  }
	}
	
	initialise();
}

BodyViewer.prototype = Object.create((require('./RendererModule').RendererModule).prototype);
exports.BodyViewer = BodyViewer;
