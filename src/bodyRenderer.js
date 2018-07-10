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
exports.BodyViewer = function(ModelsLoaderIn)  {

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
	//Represents each physiological organ systems as folder in the dat.gui.
	 var systemList =["Musculo-skeletal", "Cardiovascular", "Respiratory", "Digestive",
	    "Skin (integument)", "Urinary", "Brain & Central Nervous", "Immunological",
	    "Endocrine", "Female Reproductive", "Male Reproductive", "Special sense organs"];
	var _this = this;
	
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
						graphicsHighlight.setSelected([intersects[ i ].object]);
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
				    graphicsHighlight.setHighlighted([intersects[ i ].object]);
						return;
					} else {
						bodyHovered = true;
					}
				}
			}
			graphicsHighlight.resetHighlighted();
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
	
	var removeGeometry = function(systemName, name) {
		if (removeWhenNotVisible) {
			var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
			if (systemMeta[systemName].hasOwnProperty(name) && systemMeta[systemName][name].geometry) {
				currentScene.removeZincGeometry(systemMeta[systemName][name].geometry);
				systemMeta[systemName][name]["loaded"] = ITEM_LOADED.FALSE;
				systemMeta[systemName][name].geometry = undefined;
			}
			
		}
	}
	
	/**
	 * This is called when a body part visibility control is switch on/off.
	 * @callback
	 */
	this.changeBodyPartsVisibility = function(name, systemName, value) {
		var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
		if (systemMeta[systemName].hasOwnProperty(name) && systemMeta[systemName][name].geometry) {
			systemMeta[systemName][name].geometry.setVisibility(value);
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
    var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
    for (var systemName  in systemMeta) {
      var partMap = systemMeta[systemName];
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
	
	var readModel = function(systemName, partName, startup) {
		var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
		item = systemMeta[systemName][partName];
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
	
	/**
	 * Signal the {@link PJP.BodyViewer} to start reading the meta file.
	 * @async
	 */
	this.readSystemMeta = function() {
		var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
		for (var systemItem  in systemMeta) {
			readBodyRenderModel(systemItem, systemMeta[systemItem]);	
		}
	}
	
	initialise();
}

