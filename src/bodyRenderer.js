var dat = require("./dat.gui.js");
require("./styles/dat-gui-swec.css");
require("./styles/my_styles.css");
var THREE = require("three");
var ITEM_LOADED = require("./utility").ITEM_LOADED;

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
  (require('./BaseModule').BaseModule).call(this);
	var currentScene = undefined;
	var currentSpecies = 'human';
	var bodyScenes = new Array();
	var toolTip = undefined;
	bodyScenes['human'] = undefined;
	bodyScenes['pig'] = undefined;
	bodyScenes['mouse'] = undefined;
	bodyScenes['rat'] = undefined;
	var rendererContainer = undefined;
	// Flag for removing geometry from ZincScene when not visgble, thus freeing the memory. Default is false.
	var removeWhenNotVisible = false;
	var organsViewer = undefined;
	var modelsLoader = ModelsLoaderIn;
	var displayArea = undefined;
	var systemPartAddedCallbacks = new Array();
	var graphicsHighlight = new (require("./utilities/graphicsHighlight").GraphicsHighlight)();
	//ZincRenderer for this viewer.
	var bodyRenderer = null;
	 /**  Notifier handle for informing other modules of any changes **/
  var eventNotifiers = [];
	//Represents each physiological organ systems as folder in the dat.gui.
	var systemList =["Musculo-skeletal", "Cardiovascular", "Respiratory", "Digestive",
	  "Skin (integument)", "Urinary", "Brain & Central Nervous", "Immunological",
	  "Endocrine", "Female Reproductive", "Male Reproductive", "Special sense organs"];
	var systemMeta = undefined;
	var _this = this;
	_this.typeName = "Body Viewer";
	
	/**
	 * Set the organs viewer this {@link PJP.BodyViewer} fires event to.
	 * 
	 * @param {PJP.OrgansViewer} OrgansViewerIn - target Organs Viewer to fire the event to.
	 */
	this.setOrgansViewer = function(OrgansViewerIn) {
		organsViewer = OrgansViewerIn;
	}

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
						if (organsViewer)
							organsViewer.loadOrgans(currentSpecies, intersects[ i ].object.userData[0], intersects[ i ].object.name);
						_this.setSelectedByObjects([intersects[ i ].object], true);
						return;
					} else {
						bodyClicked = true;
					}
				}
			}
			if (bodyClicked && organsViewer) {
				organsViewer.loadOrgans(currentSpecies, "Skin (integument)", "Body");
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
					  displayArea.style.cursor = "pointer";
				    toolTip.setText(intersects[ i ].object.name);
				    toolTip.show(window_x, window_y);
				    _this.setHighlightedByObjects([intersects[ i ].object], true);
						return;
					} else {
						bodyHovered = true;
					}
				}
			}
			_this.setHighlightedByObjects([], true);
			if (bodyHovered) {
			  displayArea.style.cursor = "pointer";
        toolTip.setText("Body");
        toolTip.show(window_x, window_y);
			} else {
			  toolTip.hide();
			  displayArea.style.cursor = "auto";
			}
			
		}
	};
	
  var publishChanges = function(objects, eventType) {
    var ids = new Array();
    for (var i = 0; i < objects.length; i++) {
      ids[i] = objects[i].name;
    }
    for (var i = 0; i < eventNotifiers.length; i++) {
      eventNotifiers[i].publish(_this, eventType, ids);
    }
  }
	
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
	
  this.setHighlightedByObjects = function(objects, propagateChanges) {
    var changed = graphicsHighlight.setHighlighted(objects);
    if (changed && propagateChanges) {
      var eventType = require("./utilities/eventNotifier").EVENT_TYPE.HIGHLIGHTED;
      publishChanges(objects, eventType);
    }
    return changed;
  }
  
  this.setSelectedByObjects = function(objects, propagateChanges) {
    var changed = graphicsHighlight.setSelected(objects);
    if (changed && propagateChanges) {
      var eventType = require("./utilities/eventNotifier").EVENT_TYPE.SELECTED;
      publishChanges(objects, eventType);
    }
    return changed;
  }
  
  this.findObjectsByGroupName = function(groupName) {
    var geometries = displayScene.findGeometriesWithGroupName(groupName);
    var objects = [];
    for (var i = 0; i < geometries.length; i ++ ) {
      objects.push(geometries[i].morph);
    }
    var glyphsets = displayScene.findGlyphsetsWithGroupName(groupName);
    for (var i = 0; i < glyphsets.length; i ++ ) {
      glyphsets[i].forEachGlyph(addGlyphToArray(objects));
    }
    
    return objects;
  }
  
  this.setHighlightedByGroupName = function(groupName, propagateChanges) {
    var objects = _this.findObjectsByGroupName(groupName);
    return _this.setHighlightedByObjects(objects, propagateChanges);
  }
  
  this.setSelectedByGroupName = function(groupName, propagateChanges) {
    var objects = _this.findObjectsByGroupName(groupName);
    return _this.setSelectedByObjects(objects, propagateChanges);
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
			geometry.morph.userData = [systemName, partName];
		}
	};
	
	this.changeBackgroundColour = function(backgroundColourString) {
	  var colour = new THREE.Color(backgroundColourString);
	  if (bodyRenderer) {
	    var internalRenderer = bodyRenderer.getThreeJSRenderer();
	    internalRenderer.setClearColor( colour, 1 );
	  }
	}
	
	this.getSystemList = function() {
	  return systemList;
	  
	}
	
	this.resetView = function() {
	  if (bodyRenderer)
	    bodyRenderer.resetVIew;
	}
	
	this.viewAll = function() {
	  if (bodyRenderer)
	    bodyRenderer.viewAll;
	}
	
	this.changeSpecies = function(speciesName) {
	  currentSpecies = speciesName;
	  var scene = bodyRenderer.getSceneByName(currentSpecies);
	  if (scene == undefined) {
	    scene = bodyRenderer.createScene(currentSpecies);
	  }
	  currentScene = scene;
	  bodyRenderer.setCurrentScene(scene);
	}
	
	this.addSystemPartAddedCallback = function(callback) {
	  if (typeof(callback === "function"))
	    systemPartAddedCallbacks.push(callback);
	}
	
	/** Initialise everything in the bodyRender, including the 3D renderer,
	 *  dat.gui UI and picker for the 3D renderer.
	 * 
	 */
	this.initialiseRenderer = function(displayAreaIn) {
	  if (bodyRenderer === undefined || rendererContainer === undefined) {
	    var returnedValue = (require("./utility").createRenderer)();
	    bodyRenderer = returnedValue["renderer"];
	    rendererContainer = returnedValue["container"];
	    var scene = bodyRenderer.createScene("human");
	    bodyRenderer.setCurrentScene(scene);
	    scene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
	    currentScene = scene;
	    var directionalLight = scene.directionalLight;
	    directionalLight.intensity = 1.4;
	    var zincCameraControl = scene.getZincCameraControls();
	    zincCameraControl.enableRaycaster(scene, _pickingBodyCallback(), _hoverBodyCallback());
	    zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
	    zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
	  }
	  if (displayAreaIn) {
	    displayArea = displayAreaIn;
	    displayArea.appendChild( rendererContainer );
	    bodyRenderer.animate();
	    if (toolTip === undefined)
	      toolTip = new (require("./tooltip").ToolTip)(displayArea);
	  } 
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
	}
	
  this.addNotifier = function(eventNotifier) {
    eventNotifiers.push(eventNotifier);
  }
	
	var readModel = function(systemName, partName, startup) {
    var speciesMeta = systemMeta[currentSpecies];
		item = speciesMeta[systemName][partName];
		if (item["loaded"] ==  ITEM_LOADED.FALSE) {
			var downloadPath = item["BodyURL"];
			var scaling = false;
			item["loaded"] =  ITEM_LOADED.DOWNLOADING;
			if (item["FileFormat"] == "JSON") {
				if (systemName == "Musculo-skeletal" || systemName == "Skin (integument)")
					scaling = true;
				currentScene.loadMetadataURL(downloadPath, _addBodyPartCallback(systemName, partName, item, scaling, false, startup));
			}
			else if (item["FileFormat"] == "STL")
				currentScene.loadSTL(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
			else if (item["FileFormat"] == "OBJ") 
				currentScene.loadOBJ(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
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
	
	this.destroy = function() {
	  bodyRenderer = undefined;
	  systemMeta = undefined;
	  (require('./BaseModule').BaseModule).prototype.destroy.call( _this );
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

BodyViewer.prototype = Object.create((require('./BaseModule').BaseModule).prototype);
exports.BodyViewer = BodyViewer;
