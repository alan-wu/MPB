var THREE = require('zincjs').THREE;
// Current model's associate data, data fields, external link, nerve map
// informations,
// these are proived in the organsFileMap array.
var OrgansSceneData = function() {
  this.currentName = "";
  this.currentSystem = "";
  this.currentPart = "";
  this.currentSpecies  = "";
  this.metaURL = "";
  this.viewURL = "";
  this.geometries = [];
  this.lines = [];
  this.glyphsets = [];
  this.pointsets = [];
  this.currentTime = 0.0;
  this.timeVarying = false;
  // Current model's associate data, data fields, external link, nerve map
	// informations,
  this.nerveMap = undefined;
  this.nerveMapIsActive = false;
}

/**
 * Viewer of 3D-organs models. Users can toggle on/off different views. Data is
 * displayed instead if models are not available.
 * 
 * @class
 * @param {PJP.ModelsLoader}
 *            ModelsLoaderIn - defined in modelsLoade.js, providing locations of
 *            files.
 * @param {String}
 *            PanelName - Id of the target element to create the
 *            {@link PJP.OrgansViewer} on.
 * @author Alan Wu
 * @returns {PJP.OrgansViewer}
 */
var OrgansViewer = function(ModelsLoaderIn)  {
  (require('./RendererModule').RendererModule).call(this);
	var pickerScene = undefined;
	var nerveMapScene = undefined;
	this.sceneData = new OrgansSceneData();
	/** new* */
	var timeChangedCallbacks = new Array();
	var sceneChangedCallbacks = new Array();
	var organPartAddedCallbacks = new Array();
	var layoutUpdateRequiredCallbacks = new Array();
	var modelsLoader = ModelsLoaderIn;
	var _this = this;
	_this.typeName = "Organ Viewer";
	
	this.getSceneData = function() {
	  return _this.sceneData;
	}

	/**
	 * Used to update internal timer in scene when time slider has changed.
	 */
	this.updateTime = function(value) {
		if (!_this.sceneData.nerveMapIsActive) {
			if (pickerScene)
				pickerScene.setMorphsTime(value * 30);
			if (_this.scene)
				_this.scene.setMorphsTime(value * 30);
		} else if (nerveMapScene) {
				nerveMapScene.setMorphsTime(value * 30);
				if (_this.sceneData.nerveMap && _this.sceneData.nerveMap.additionalReader)
					_this.sceneData.nerveMap.additionalReader.setTime(value / 100.0);
		}
		_this.sceneData.currentTime = value;
	}
	
	/**
	 * Update the time slider and other renderers/scenes when time has changed.
	 */
	var preRenderTimeUpdate = function() {
		var currentTime = _this.zincRenderer.getCurrentTime();
		for (var i = 0; i < timeChangedCallbacks.length;i++) {
			timeChangedCallbacks[i](currentTime);
		}
		if (!_this.sceneData.nerveMapIsActive && pickerScene)
			pickerScene.setMorphsTime(currentTime);
		if (_this.sceneData.nerveMap && _this.sceneData.nerveMap.additionalReader)
			_this.sceneData.nerveMap.additionalReader.setTime(currentTime / 3000.0);
		_this.sceneData.currentTime = currentTime / 30.0;
	}
	
	var preRenderTimeUpdateCallback = function() {
		return function() {
		  preRenderTimeUpdate();
		}
	}
	
	 /**
		 * Add a callback which will be called when time has changed
		 */
	this.addTimeChangedCallback = function(callback) {
	  if (typeof(callback === "function"))
	    timeChangedCallbacks.push(callback);
	}
	
	this.setTexturePos = function(value) {
		if (_this.sceneData.nerveMap && _this.sceneData.nerveMap.additionalReader)
			_this.sceneData.nerveMap.additionalReader.setSliderPos(value);
	}
	
	 this.addLayoutUpdateRequiredCallback = function(callback) {
	    if (typeof(callback === "function")) {
	      layoutUpdateRequiredCallbacks.push(callback);
	    }
	  }
	
	this.addSceneChangedCallback = function(callback) {
	  if (typeof(callback === "function")) {
	    sceneChangedCallbacks.push(callback);
	  }
	}
	
	this.addOrganPartAddedCallback = function(callback) {
    if (typeof(callback === "function"))
      organPartAddedCallbacks.push(callback);
  }
	 
	/**
	 * Callback function when a pickable object has been picked. It will then
	 * call functions in tissueViewer and cellPanel to show corresponding
	 * informations.
	 * 
	 * @callback
	 */
	var _pickingCallback = function() {
		return function(intersects, window_x, window_y) {
			var intersected = _this.getIntersectedObject(intersects);
			if (intersected !== undefined) {
				if (intersected.object.name) {
					if (_this.toolTip !== undefined) {
						_this.toolTip.setText(intersected.object.name);
						_this.toolTip.show(window_x, window_y);
					}
					_this.displayMessage(intersected.object.name + " selected.");
					_this.setSelectedByObjects([intersected.object], true);
				}
			} else {
				if (_this.toolTip !== undefined) {
					_this.toolTip.hide();
				}
				_this.setSelectedByObjects([], true);
			}
		}
	};
	
	/**
	 * Callback function when a pickable object has been hovered over. It will
	 * show objecty id/name as _this.toolTip text.
	 * 
	 * @callback
	 */
	var _hoverCallback = function() {
		return function(intersects, window_x, window_y) {
			var intersected = _this.getIntersectedObject(intersects);
			if (intersected !== undefined) {
				if (intersected.object.name) {
				  _this.displayArea.style.cursor = "pointer";
				  if (_this.toolTip !== undefined) {
  					_this.toolTip.setText(intersected.object.name);
  					_this.toolTip.show(window_x, window_y);
				  }
				  _this.setHighlightedByObjects([intersected.object], true);
				  return;
				}
			} else {
				if (_this.toolTip !== undefined) {
					_this.toolTip.hide();
				}
				_this.displayArea.style.cursor = "auto";
				_this.setHighlightedByObjects([], true);
			}
		}
	};

	var changeOrganPartsVisibilityForScene = function(scene, name, value, type) {
		if (type == "all" || type == "geometries") {
			var geometries = scene.findGeometriesWithGroupName(name);
			for (var i = 0; i < geometries.length; i ++ ) {
				geometries[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "glyphsets") {
			var glyphsets = scene.findGlyphsetsWithGroupName(name);
			for (var i = 0; i < glyphsets.length; i ++ ) {
				glyphsets[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "pointsets") {
			var pointsets = scene.findPointsetsWithGroupName(name);
			for (var i = 0; i < pointsets.length; i ++ ) {
				pointsets[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "lines") {
			var lines = scene.findLinesWithGroupName(name);
			for (var i = 0; i < lines.length; i ++ ) {
				lines[i].setVisibility(value);
			}
		}
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeGeometriesVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'geometries');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'geometries');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeGlyphsetsVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'glyphsets');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'glyphsets');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeLinesVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'lines');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'lines');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changePointsetsVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'pointsets');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'pointsets');
	}
				
	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeOrganPartsVisibility = function(name, value, typeIn) {
		var type = "all";
		if (typeIn !== undefined)
			type = typeIn;
		changeOrganPartsVisibilityForScene(_this.scene, name, value, type);
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, type);
	}
	
	this.changeOrganPartsVisibilityCallback = function(name) {
		return function(value) {
			_this.changeOrganPartsVisibility(name, value);
		}
	}
	
	/**
	 * Change some of the ZincGeometry property for never map geometry
	 * 
	 * @callback
	 */
	var _addNerveMapGeometryCallback = function(GroupName) {
		return function(geometry) {
			geometry.groupName = GroupName;
			if (imageCombiner && geometry.morph && geometry.morph.material.map) {
				geometry.morph.material.map = new THREE.Texture(imageCombiner.getCombinedImage());
				geometry.morph.material.map.needsUpdate = true;
				geometry.morph.material.needsUpdate = true;
			}
		}
	}
	
	/**
	 * Read in the nerve map models onto the primary renderer when nerve map has
	 * been toggled on.
	 */
	var setupNerveMapPrimaryRenderer = function() {
		var sceneName = _this.sceneData.currentName + "_nervemap";
		nerveMapScene = _this.zincRenderer.getSceneByName(sceneName);
		if (nerveMapScene == undefined) {
			var downloadPath = modelsLoader.getOrgansDirectoryPrefix() + "/" + _this.sceneData.nerveMap.threed.meta;
			nerveMapScene = _this.zincRenderer.createScene(sceneName);
			nerveMapScene.loadMetadataURL(downloadPath, _addNerveMapGeometryCallback("threed"));
			if (_this.sceneData.nerveMap.threed.view !== undefined)
				nerveMapScene.loadViewURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + _this.sceneData.nerveMap.threed.view);
			else {
				nerveMapScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
			}
			nerveMapScene.ambient.intensity = 8.0;
			nerveMapScene.directionalLight.intensity = 0;
			var zincCameraControl = nerveMapScene.getZincCameraControls();
			zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
			_this.sceneData.nerveMap.additionalReader = new (require("../varyingTexCoordsReader").VaryingTexCoordsReader)(nerveMapScene);
			var urlsArray = [ modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_0.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_1.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi0_time_0.json"];
			_this.sceneData.nerveMap.additionalReader.loadURLsIntoBufferGeometry(urlsArray);
		}
		_this.zincRenderer.setCurrentScene(nerveMapScene);
		_this.graphicsHighlight.reset();
	}
	
	var activateAdditionalNerveMapRenderer = function() {
	    for (var i = 0; i < layoutUpdateRequiredCallbacks.length;i++) {
	      layoutUpdateRequiredCallbacks[i](false, true);
	    }
	}
	
	/**
	 * Nerve map has been toggled on/off, change organs renderer layput.
	 */
	this.changeNerveMapVisibility = function() {
		_this.sceneData.nerveMapIsActive = !_this.sceneData.nerveMapIsActive;
		if (_this.sceneData.nerveMapIsActive)
			setupNerveMapPrimaryRenderer();
		else {
			_this.zincRenderer.setCurrentScene(_this.scene);
			_this.graphicsHighlight.reset();
		}
		activateAdditionalNerveMapRenderer();
	}
	
	this.changeBackgroundColour = function(backgroundColourString) {
		var colour = new THREE.Color(backgroundColourString);
		if (_this.zincRenderer) {
			var internalRenderer = _this.zincRenderer.getThreeJSRenderer();
			internalRenderer.setClearColor( colour, 1 );
		}
	}

	var addOrganPartToSceneData = function(zincObject) {
		if (zincObject.groupName) {
			if (zincObject.isGeometry) {
				if (!_this.sceneData.geometries.includes(zincObject.groupName)) {
					_this.sceneData.geometries.push(zincObject.groupName);
				}
			} else if (zincObject.isGlyphset) {
				if (!_this.sceneData.glyphsets.includes(zincObject.groupName)) {
					_this.sceneData.glyphsets.push(zincObject.groupName);
				}
			} else if (zincObject.isLines) {
				if (!_this.sceneData.lines.includes(zincObject.groupName)) {
					_this.sceneData.lines.push(zincObject.groupName);
				}
			} else if (zincObject.isPointset) {
				if (!_this.sceneData.pointsets.includes(zincObject.groupName)) {
					_this.sceneData.pointsets.push(zincObject.groupName);
				}
			}
		}
	}

	var addOrganPart = function(systemName, partName, useDefautColour, zincObject) {
		if (zincObject.groupName) {
			for (var i = 0; i < organPartAddedCallbacks.length;i++) {
				organPartAddedCallbacks[i](zincObject.groupName, _this.scene.isTimeVarying());
			}
			if (useDefautColour)
				modelsLoader.setGeometryColour(zincObject, systemName, partName);
			addOrganPartToSceneData(zincObject);
			_this.displayMessage(zincObject.groupName + " loaded.");
		} else {
			_this.displayMessage("Resource loaded.");
		}
		var annotation = new (require('../utilities/annotation').annotation)();
		annotation.data = {species:_this.sceneData.currentSpecies, system:systemName, part:partName, group:zincObject.groupName};
		zincObject.userData = [annotation];
	}

	  /**
		 * New organs geometry has been added to the scene, add UIs and make
		 * sure the viewport is correct.
		 */
	  var _addOrganPartCallback = function(systemName, partName, useDefautColour) {
	    return function(zincObject) {
	    	addOrganPart(systemName, partName, useDefautColour, zincObject);
	    }
	  }
	  
	  var downloadCompletedCallback = function() {
		  return function() {
			  _this.settingsChanged();
			  _this.scene.viewAll();
			  _this.sceneData.timeVarying = _this.scene.isTimeVarying();
			  _this.displayMessage("All resources loaded.");
		  }
	  }
	  
	  var singleItemDownloadCompletedCallback = function(systemName, partName, useDefautColour) {
		    return function(geometry) {
		    	addOrganPart(systemName, partName, useDefautColour, geometry);
		    	_this.settingsChanged();
		    }
	  }
	  
	  /**
		 * Toggle data field displays. Data fields displays flow/pressure and      <button @click="play">Play</button>
		 * other activities of the organs.
		 */
	  this.updateFieldvisibility = function(dataFields, value) {
      for ( var i = 0; i < dataFields.length; i ++ ) {
        if (value != i) {
          var geometryName = dataFields[i].PartName;
          _this.changeOrganPartsVisibility(geometryName, false);
        }
      }
      if (value > -1) {
        var partName = dataFields[value].PartName;
        if ((_this.scene.findGeometriesWithGroupName(partName).length > 0) ||
          (_this.scene.findGlyphsetsWithGroupName(partName).length > 0)) {
          _this.changeOrganPartsVisibility(partName, true);
        } else {
          var partDetails = getOrganDetails(dataFields[value].SystemName, partName);
          if (partDetails != undefined) {
            _this.scene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + partDetails.meta);
          }
        }
	    }
	  }
	  
	  /**
		 * Return an array containing name(s) of species that also contains the
		 * currently displayed organs.
		 * 
		 * @returns {Array} containing species name
		 */
	  this.getAvailableSpecies = function(currentSpecies, currentSystem, currentPart) {
	    var availableSpecies = new Array();
	    availableSpecies.push("none");
	    var keysArray = Object.keys(organsFileMap);
	    for (index in keysArray) {
	      var species = keysArray[index];
	      if (species != currentSpecies) {
	        if (organsFileMap[species].hasOwnProperty(currentSystem) &&
	            organsFileMap[species][currentSystem].hasOwnProperty(currentPart)) {
	          availableSpecies.push(species);
	        }
	      }
	    }
	    return availableSpecies;
	  }
	  
	  var setSceneData = function(speciesName, systemName, partName, organsDetails) {
	        _this.sceneData.nerveMapIsActive = false;
	        _this.sceneData.nerveMap = undefined;
	        _this.sceneData.metaURL = "";
	        _this.sceneData.viewURL = "";
	        _this.sceneData.currentSpecies = speciesName;
	        _this.sceneData.currentSystem = systemName;
			_this.sceneData.currentPart = partName;
			_this.sceneData.currentTime = 0.0;
			_this.sceneData.geometries.splice(0);
			_this.sceneData.lines.splice(0);
			_this.sceneData.glyphsets.splice(0);
			_this.sceneData.pointsets.splice(0);
			_this.sceneData.timeVarying = false;
	        // This is used as title
	        var name = "";
	        if (speciesName)
	        	name = speciesName + "/";
	        if (systemName)
	        	name = systemName + "/";
	        if (partName)
	        	name = partName;
	        _this.sceneData.currentName = name;
	  }

	  this.loadOrgansFromURL = function(url, speciesName, systemName, partName, viewURL) {
		  if (_this.zincRenderer) {
			  if (partName && (_this.sceneData.metaURL !== url)) {
			      setSceneData(speciesName, systemName, partName, undefined);
			      var name = _this.sceneData.currentName;
			      var organScene = _this.zincRenderer.getSceneByName(name);
			      if (organScene) {
			    	  organScene.clearAll();
			      } else {
			    	  organScene = _this.zincRenderer.createScene(name);
			      }
			      for (var i = 0; i < sceneChangedCallbacks.length;i++) {
			    	  sceneChangedCallbacks[i](_this.sceneData);
			      }
			      if (viewURL && viewURL != "") {
			    	  _this.sceneData.viewURL = viewURL;
				      organScene.loadViewURL(_this.sceneData.viewURL);
			      } else
			    	  _this.sceneData.viewURL = undefined;
			      _this.sceneData.metaURL = url;
			      _this.displayMessage("Downloading...");
			      organScene.loadMetadataURL(url, _addOrganPartCallback(systemName, partName, false),
			    	  downloadCompletedCallback());	      
			      _this.scene = organScene;
			      _this.zincRenderer.setCurrentScene(organScene);
			      _this.graphicsHighlight.reset();
			      var zincCameraControl = organScene.getZincCameraControls();
			      zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
			      zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			      zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
			  }
		  }
	  }
	  	  
	  this.alignCameraWithSelectedObject = function(transitionTime) {
	    var objects = _this.graphicsHighlight.getSelected();
	    if (objects && objects[0] && objects[0].userData) {
	      _this.scene.alignObjectToCameraView(objects[0].userData, transitionTime);
	    }
	  }
	  
	  this.exportSettings = function() {
		  var settings = {};
		  settings.name = _this.instanceName;
		  if (_this.sceneData.currentSystem)
			  settings.system = _this.sceneData.currentSystem;
		  if (_this.sceneData.currentSpecies)
			  settings.species  = _this.sceneData.currentSpecies;
		  if (_this.sceneData.currentPart)
			  settings.part = _this.sceneData.currentPart;
		  settings.metaURL = _this.sceneData.metaURL;
		  if (_this.sceneData.viewURL)
			  settings.viewURL = _this.sceneData.viewURL;
		  settings.dialog = "Organ Viewer";
		  return settings;
	  }
	  
	  this.importSettings = function(settings) {
		  if (settings && (settings.dialog == this.typeName)) {
			  _this.setName(settings.name);
			  if (settings.metaURL !== undefined && settings.metaURL != "") {
				  _this.loadOrgansFromURL(settings.metaURL, settings.species,
					settings.system, settings.part, settings.viewURL);
			  } else {
				  _this.loadOrgans(settings.species, settings.system, settings.part);
			  }
			  return true;
		  }
		  return false;
	  }
		
	/**
	 * initialise loading of the html layout for the organs panel, this is
	 * called when the {@link PJP.OrgansViewer} is created.
	 * 
	 * @async
	 */
	 var initialise = function() {
	   _this.initialiseRenderer(undefined);
	   if (_this.zincRenderer)
	     _this.zincRenderer.addPreRenderCallbackFunction(preRenderTimeUpdateCallback());
  }
	 
	initialise();

}

OrgansViewer.prototype = Object.create((require('./RendererModule').RendererModule).prototype);
exports.OrgansViewer = OrgansViewer;
