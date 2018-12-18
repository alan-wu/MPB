var THREE = require('zincjs').THREE;

//Current model's associate data, data fields, external link, nerve map informations,
//these are proived in the organsFileMap array.
var OrgansSceneData = function() {
  this.currentName = "";
  this.currentSystem = "";
  this.currentPart = "";
  this.currentSpecies  = "";
  //Current model's associate data, data fields, external link, nerve map informations,
  //these are proived in the organsFileMap array.
  this.associateData = undefined;
  this.dataFields = undefined;
  this.externalOrganLink = undefined;
  this.nerveMap = undefined;
  this.nerveMapIsActive = false;
}


/**
 * Viewer of 3D-organs models. Users can toggle on/off different views. Data is displayed instead
 * if models are not available.
 * 
 * @class
 * @param {PJP.ModelsLoader} ModelsLoaderIn - defined in modelsLoade.js, providing locations of files.
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.OrgansViewer} on.
 * @author Alan Wu
 * @returns {PJP.OrgansViewer}
 */
var OrgansViewer = function(ModelsLoaderIn)  {
  (require('./RendererModule').RendererModule).call(this);
	var pickerScene = undefined;
	var secondaryScene = undefined;
	var tertiaryScene = undefined;
	var nerveMapScene = undefined;
	var currentImgZoom = 1.0;
	var imgRightClickDown = false;
	var compareSceneIsOn = false;
	var additionalSpecies = undefined;
	var sceneData = new OrgansSceneData();
	var timeoutID = 0;
	/**new**/
	var timeChangedCallbacks = new Array();
	var sceneChangedCallbacks = new Array();
	var organPartAddedCallbacks = new Array();
	var layoutUpdateRequiredCallbacks = new Array();
	/** Suscriptions to changes **/
	var suscriptions = [];
	/**
	 * {ImageCombiner}.
	 */
	var imageCombiner = undefined;
	var tissueViewer = undefined;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var modelsLoader = ModelsLoaderIn;
	var _this = this;
	_this.typeName = "Organs Viewer";
	//Secondary renderer, used for comparing species models.
	var secondaryRenderer = undefined;
	var secondaryRendererContainer = undefined;
	var secondaryDisplayArea = undefined;
	
	//Array for storing different species models urls.
	var organsFileMap = {};
	
	//Array for storing rat's models urls and its associated data.
	var ratOrgansFileMap = {};
	ratOrgansFileMap["Cardiovascular"] = {};
	ratOrgansFileMap["Cardiovascular"]["Kidneys-Arteries"] = {
			view: "rat/cardiovascular/arteries/rat_kidneys_view.json",
			meta: "rat/cardiovascular/arteries/rat_kidneys_1.json",
			picker: undefined,
			associateData: undefined	
	};
	 ratOrgansFileMap["Digestive"] = {};
	 ratOrgansFileMap["Digestive"]["Stomach"] = {
	     view: "rat/digestive/stomach/rat_stomach_view.json",
	     meta: "rat/digestive/stomach/rat_stomach_meta.json",
	     picker: undefined,
	     associateData: undefined  
	  };
	
	//Array for storing human's models urls and its associated data.
	var humanOrgansFileMap = {};
	humanOrgansFileMap["Cardiovascular"] = {};
	humanOrgansFileMap["Digestive"] = {};
	humanOrgansFileMap["Respiratory"] = {};
	humanOrgansFileMap["Cardiovascular"]["Heart"] = {
			view: "cardiovascular/heart/heart_view.json",
			meta: "cardiovascular/heart/animated_nerve_1.json",
			picker: "cardiovascular/heart/picking_node_1.json",
			associateData: undefined,
			externalLink: "https://models.cellml.org/e/bd/deforming_heart.rdf/view"};
	humanOrgansFileMap["Cardiovascular"]["Arterial Flow"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_flow_1.json",
			picker: undefined,
			associateData: undefined};
	humanOrgansFileMap["Cardiovascular"]["Arterial Pressure"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_pressure_1.json",
			picker: undefined,
			associateData: undefined};
	humanOrgansFileMap["Cardiovascular"]["Arterial Velocity"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_velocity_1.json",
			picker: undefined,
			associateData: undefined};
	humanOrgansFileMap["Cardiovascular"]["Aorta"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arteries_1.json",
			picker: undefined,
			sceneName: "Cardiovascular/Arterial System",
			associateData: [{SystemName: "Cardiovascular", PartName: "Aorta"},
			       {SystemName: "Cardiovascular", PartName: "Left Upper Limb"},
			       {SystemName: "Cardiovascular", PartName: "Left Lower Limb"},
			       {SystemName: "Cardiovascular", PartName: "Right Upper Limb"},
			       {SystemName: "Cardiovascular", PartName: "Right Lower Limb"}],
			 fields: [{SystemName: "Cardiovascular", PartName: "Arterial Flow"},
			          {SystemName: "Cardiovascular", PartName: "Arterial Pressure"},
			          {SystemName: "Cardiovascular", PartName: "Arterial Velocity"}]};
	humanOrgansFileMap["Cardiovascular"]["Left Upper Limb"] = humanOrgansFileMap["Cardiovascular"]["Aorta"];
	humanOrgansFileMap["Cardiovascular"]["Left Lower Limb"] = humanOrgansFileMap["Cardiovascular"]["Aorta"];
	humanOrgansFileMap["Cardiovascular"]["Right Upper Limb"] = humanOrgansFileMap["Cardiovascular"]["Aorta"];
	humanOrgansFileMap["Cardiovascular"]["Right Lower Limb"] = humanOrgansFileMap["Cardiovascular"]["Aorta"];
	humanOrgansFileMap["Digestive"]["Stomach"] = {
			view: undefined,
			meta: "digestive/stomach_1.json",
			picker: undefined,
			associateData: undefined,
			nerveMap: {}};
	humanOrgansFileMap["Digestive"]["Stomach"].nerveMap["threed"] = {meta: "digestive/stomach/nerve_map/3d/stomach_nerve_3d_1.json", 
			view: "digestive/stomach/nerve_map/3d/stomach_nerve_3d_view.json"};
	humanOrgansFileMap["Digestive"]["Stomach"].nerveMap["twod"] = {meta: "digestive/stomach/nerve_map/2d/stomach_nerve_2d_1.json",
			view: "digestive/stomach/nerve_map/2d/stomach_nerve_2d_view.json"};
	humanOrgansFileMap["Digestive"]["Stomach"].nerveMap["normalised"] = {meta: "digestive/stomach_1.json", view: undefined};
	humanOrgansFileMap["Digestive"]["Stomach"].nerveMap["svg"] = {url: 'svg/Myocyte_v6_Grouped.svg'};
	humanOrgansFileMap["Respiratory"]["Lungs"] = {
			view: "respiratory/lungs_view.json",
			meta: "respiratory/lungs_1.json",
			picker: undefined,
			associateData: undefined};
  humanOrgansFileMap["Cardiovascular"]["ScaffoldHeart"] = {
      meta: "cardiovascular/scaffold_heart/heart_metadata.json"};
  humanOrgansFileMap["Cardiovascular"]["Neuro"] = {
      view: "cardiovascular/neuro/cardiac_neuro_view.json",
      meta: "cardiovascular/neuro/cardiac_neuro_metadata.json"};
	
	organsFileMap['human'] = humanOrgansFileMap;
	organsFileMap['rat'] = ratOrgansFileMap;
	
	
	this.setTissueViewer = function(TissueViewerIn) {
		tissueViewer = TissueViewerIn;
	}
	
	this.setCellPanel = function(CellPanelIn) {
		cellPanel = CellPanelIn;
	}
	
	this.setModelPanel = function(ModelPanelIn) {
		modelPanel = ModelPanelIn;
	}
	
	this.getSceneData = function() {
	  return sceneData;
	}

	/**
	 * Used to update internal timer in scene when time slider has changed.
	 */
	this.updateTime = function(value) {
		if (!sceneData.nerveMapIsActive) {
			if (pickerScene)
				pickerScene.setMorphsTime(value * 30);
			if (_this.scene)
				_this.scene.setMorphsTime(value * 30);
		} else if (nerveMapScene) {
				nerveMapScene.setMorphsTime(value * 30);
				if (sceneData.nerveMap && sceneData.nerveMap.additionalReader)
					sceneData.nerveMap.additionalReader.setTime(value / 100.0);
		}
	}
	
	/**
	 * Update the time slider and other renderers/scenes when time has changed.
	 */
	var preRenderTimeUpdate = function() {
		var currentTime = _this.zincRenderer.getCurrentTime();
    for (var i = 0; i < timeChangedCallbacks.length;i++) {
      timeChangedCallbacks[i](currentTime);
    }
		if (!sceneData.nerveMapIsActive && pickerScene)
			pickerScene.setMorphsTime(currentTime);
		if (sceneData.nerveMap && sceneData.nerveMap.additionalReader)
			sceneData.nerveMap.additionalReader.setTime(currentTime / 3000.0);
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
		if (sceneData.nerveMap && sceneData.nerveMap.additionalReader)
			sceneData.nerveMap.additionalReader.setSliderPos(value);
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
 
  var addGlyphToArray = function(objects) {
    return function(glyph) {
      objects.push(glyph.getMesh());
    }
  }
  
  var publishChanges = function(objects, eventType) {
    var ids = [];
    for (var i = 0; i < objects.length; i++) {
      ids[i] = objects[i].name;
    }
    for (var i = 0; i < _this.eventNotifiers.length; i++) {
      _this.eventNotifiers[i].publish(_this, eventType, ids);
    }
  }
	
  this.setHighlightedByObjects = function(objects, propagateChanges) {
    var changed = _this.graphicsHighlight.setHighlighted(objects);
    if (changed && propagateChanges) {
      var eventType = require("../utilities/eventNotifier").EVENT_TYPE.HIGHLIGHTED;
      publishChanges(objects, eventType);
    }
    return changed;
  }
  
  this.setSelectedByObjects = function(objects, propagateChanges) {
    var changed = _this.graphicsHighlight.setSelected(objects);
    if (changed && propagateChanges) {
      var eventType = require("../utilities/eventNotifier").EVENT_TYPE.SELECTED;
      publishChanges(objects, eventType);
    }
    return changed;
  }

	/** 
	 * Callback function when a pickable object has been picked. It will then call functions in tissueViewer
	 * and cellPanel to show corresponding informations.
	 * 
	 * @callback
	 */
	var _pickingCallback = function() {
		return function(intersects, window_x, window_y) {
		  
			if (intersects[0] !== undefined) {
				if (_this.scene.sceneName == "human/Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					intersects[ 0 ].object.name = id.toString();
					//console.log(intersects[ 0 ].object.userData);
					if (_this.toolTip !== undefined) {
  					_this.toolTip.setText("Node " + id);
  					_this.toolTip.show(window_x, window_y);
					}
					var tissueTitle = "<strong>Tissue: <span style='color:#FF4444'>" + id + "</span></strong>";
					if (tissueViewer) {
						tissueViewer.setTissueTitleString(tissueTitle);
						tissueViewer.showButtons(true);
						tissueViewer.showCollagenVisible(true);
					}
					_this.setSelectedByObjects([intersects[ 0 ].object], true);
				} else if (_this.scene.sceneName.includes("human/Cardiovascular/Arterial")) {
				  if (_this.toolTip !== undefined) {
				    _this.toolTip.setText("Click to show vascular model");
				    _this.toolTip.show(window_x, window_y);
				  }
					if (tissueViewer)
						tissueViewer.resetTissuePanel();
					if (cellPanel)
						cellPanel.resetCellPanel();
					if (modelPanel)
						modelPanel.openModel("BG_Circulation_Model.svg");
					_this.setSelectedByObjects([intersects[ 0 ].object], true);
				} else if ((_this.scene.sceneName.includes("human/Cardiovascular/ScaffoldHeart"))||
            (_this.scene.sceneName.includes("human/Cardiovascular/ScaffoldVentricle"))) {
				  if (intersects[ 0 ].object.name)
				    _this.setSelectedByObjects([intersects[ 0 ].object], true);
				} 
			}
		}
	};
	
	/** 
	 * Callback function when a pickable object has been hovered over. It will show
	 * objecty id/name as _this.toolTip text.
	 * 
	 * @callback
	 */
	var _hoverCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				if (_this.scene.sceneName == "human/Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					//a temporary hack to put id into object name, this will be done differently
					intersects[ 0 ].object.name = id.toString();
					_this.displayArea.style.cursor = "pointer";
					if (_this.toolTip !== undefined) {
  	        _this.toolTip.setText("Node " + id);
  	        _this.toolTip.show(window_x, window_y);
					}
					_this.setHighlightedByObjects([intersects[ 0 ].object], true);
					return;
				} else if (_this.scene.sceneName.includes("human/Cardiovascular/Arterial")) {
				  _this.displayArea.style.cursor = "pointer";
				  if (_this.toolTip !== undefined) {
  					_this.toolTip.setText("Click to show vascular model");
  					_this.toolTip.show(window_x, window_y);
				  }
				  _this.setHighlightedByObjects([intersects[ 0 ].object], true);
				  return;
				} else if ((_this.scene.sceneName.includes("human/Cardiovascular/ScaffoldHeart")) ||
				    (_this.scene.sceneName.includes("human/Cardiovascular/ScaffoldVentricle"))) {
				  _this.displayArea.style.cursor = "pointer";
          if (intersects[ 0 ].object.name) {
            if (_this.toolTip !== undefined) {
              _this.toolTip.setText(intersects[ 0 ].object.name);
              _this.toolTip.show(window_x, window_y);
            }
            _this.setHighlightedByObjects([intersects[ 0 ].object], true);
          } else {
            if (_this.toolTip !== undefined) {
              _this.toolTip.hide();
            }
            _this.setHighlightedByObjects([], true);
          }
        }
			}
			else {
			  if (_this.toolTip !== undefined) {
			    _this.toolTip.hide();
			  }
			  _this.displayArea.style.cursor = "auto";
			  _this.setHighlightedByObjects([], true);
			}
		}
	};
				
	/**
	 * Change visibility for parts of the current scene.
	 */
	var changeOrganPartsVisibility = function(name, value) {
		var geometries = _this.scene.findGeometriesWithGroupName(name);
		for (var i = 0; i < geometries.length; i ++ ) {
		  geometries[i].setVisibility(value);
		}
		var glyphsets = _this.scene.findGlyphsetsWithGroupName(name);
    for (var i = 0; i < glyphsets.length; i ++ ) {
      glyphsets[i].setVisibility(value);
    }
		if (pickerScene) {
	    geometries = pickerScene.findGeometriesWithGroupName(name);
	    for (var i = 0; i < geometries.length; i ++ ) {
	      geometries[i].setVisibility(value);
	    }
	    glyphsets = pickerScene.findGlyphsetsWithGroupName(name);
	    for (var i = 0; i < glyphsets.length; i ++ ) {
	      glyphsets[i].setVisibility(value);
	    }
		}
	}
	
	this.updateDataGeometryVisibility = function(value) {
    if ((_this.scene.findGeometriesWithGroupName("Data Geometry").length > 0) ||
        (_this.scene.findGlyphsetsWithGroupName("Data Geometry").length > 0)) {
      changeOrganPartsVisibility("Data Geometry", value);
    } else {
      for ( var i = 0; i < sceneData.associateData.length; i ++ ) {
        var systemMeta = modelsLoader.getSystemMeta(sceneData.currentSpecies);
        var metaItem = systemMeta[sceneData.associateData[i].SystemName][sceneData.associateData[i].PartName];
        var downloadPath = metaItem["BodyURL"];
        var color = new THREE.Color("#0099ff");
        if (metaItem["FileFormat"] == "JSON")
          _this.scene.loadMetadataURL(downloadPath, _addDataGeometryCallback("Data Geometry", color));
        else if (metaItem["FileFormat"] == "STL")
          _this.scene.loadSTL(downloadPath, "Data Geometry", _addDataGeometryCallback("Data Geometry", color));
        else if (metaItem["FileFormat"] == "OBJ") 
          _this.scene.loadOBJ(downloadPath, "Data Geometry", _addDataGeometryCallback("Data Geometry", color));
      }
    }
	}
	
	this.changeOrganPartsVisibilityCallback = function(name) {
		return function(value) {
			changeOrganPartsVisibility(name, value);
		}
	}
	
	var _addDataGeometryCallback = function(GroupName, color) {
		return function(geometry) {
			geometry.groupName = GroupName;
			if (color && geometry.morph)
				geometry.morph.material.color = color;
		}
	}
	
	/**
	 * Change some of the ZincGeometry property for never map geometry
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
	 * Read in the nerve map models onto the primary renderer when nerve map has been
	 * toggled on.
	 */
	var setupNerveMapPrimaryRenderer = function() {
		var sceneName = sceneData.currentName + "_nervemap";
		nerveMapScene = _this.zincRenderer.getSceneByName(sceneName);
		if (nerveMapScene == undefined) {
			var downloadPath = modelsLoader.getOrgansDirectoryPrefix() + "/" + sceneData.nerveMap.threed.meta;
			nerveMapScene = _this.zincRenderer.createScene(sceneName);
			nerveMapScene.loadMetadataURL(downloadPath, _addNerveMapGeometryCallback("threed"));
			if (sceneData.nerveMap.threed.view !== undefined)
				nerveMapScene.loadViewURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + sceneData.nerveMap.threed.view);
			else {
				nerveMapScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
			}
			nerveMapScene.ambient.intensity = 8.0;
			nerveMapScene.directionalLight.intensity = 0;
			var zincCameraControl = nerveMapScene.getZincCameraControls();
			zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
			sceneData.nerveMap.additionalReader = new (require("../varyingTexCoordsReader").VaryingTexCoordsReader)(nerveMapScene);
			var urlsArray = [ modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_0.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_1.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi0_time_0.json"];
			sceneData.nerveMap.additionalReader.loadURLsIntoBufferGeometry(urlsArray);
		}
		_this.zincRenderer.setCurrentScene(nerveMapScene);
		_this.graphicsHighlight.reset();
	}

	/**
	 * Use the secondary renderer and display relavant models on it. 
	 */
	var readSpeciesIntoSecondaryRenderer = function(species) {
		var sceneName = sceneData.currentSpecies + "/" + sceneData.currentName;
		secondaryScene = secondaryRenderer.getSceneByName(sceneName);
		if (secondaryScene == undefined) {
			var details = organsFileMap[species][sceneData.currentSystem][sceneData.currentPart];
			secondaryScene = secondaryRenderer.createScene(sceneName);
			secondaryScene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix()  + "/" +details.meta);
			if (details.view !== undefined)
				secondaryScene.loadViewURL(modelsLoader.getOrgansDirectoryPrefix()  + "/" + details.view);
			else {
				secondaryScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
			}
			secondaryScene.directionalLight.intensity = 1.4;
			var zincCameraControl = secondaryScene.getZincCameraControls();
			zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
		}
		secondaryRenderer.setCurrentScene(secondaryScene);
	}
	
	var setTextureForGeometryCallback = function(texture) {
		return function(geometry) {
			if (geometry.morph && geometry.morph.material.map) {
				geometry.morph.material.map = texture;
				geometry.morph.material.needsUpdate = true;
				texture.needsUpdate = true;
			}
		}
	}
	
	var setTextureForScene = function(targetScene, bitmap) {
		if (targetScene) {
		  console.log(targetScene)
			var texture = new THREE.Texture(bitmap);
			targetScene.forEachGeometry(setTextureForGeometryCallback(texture));
			if (sceneData.nerveMap)
				sceneData.nerveMap.additionalReader.setTexture(texture);
		}
	}

	var activateAdditionalNerveMapRenderer = function() {
    for (var i = 0; i < layoutUpdateRequiredCallbacks.length;i++) {
      layoutUpdateRequiredCallbacks[i](false, true);
    }
		//setupOrgansNerveSVG();
	}
	
	/**
	 * Nerve map has been toggled on/off, change organs renderer layput.
	 */
	this.changeNerveMapVisibility = function() {
		sceneData.nerveMapIsActive = !sceneData.nerveMapIsActive;
		if (sceneData.nerveMapIsActive)
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
    if (secondaryRenderer) {
      var internalRenderer = secondaryRenderer.getThreeJSRenderer();
      internalRenderer.setClearColor( colour, 1 );
    }
	}

	this.initialiseSecondaryRenderer = function(displayAreaIn) {
    if (secondaryRenderer === undefined || secondaryRendererContainer === undefined) {
      var returnedValue = (require("../utility").createRenderer)();
      secondaryRenderer = returnedValue["renderer"];
      secondaryRendererContainer = returnedValue["container"];
    }
    if (secondaryDisplayArea === undefined && displayAreaIn) {
      secondaryDisplayArea = displayAreaIn;
      secondaryDisplayArea.appendChild( secondaryRendererContainer );
      secondaryRenderer.animate();
    } 
  }
	
	var imgZoom = function() {
		var cssRule = (require('../utility').findCSSRule)(".organsImg");
		var zoom = currentImgZoom * 100 + "%";
		cssRule.style["max-height"] = zoom; 
		cssRule.style["max-width"] = zoom;
	}

	var imgZoomIn = function(ratio) {
		currentImgZoom = currentImgZoom + ratio;
		imgZoom();
	}

	var imgZoomOut = function(ratio) {
		currentImgZoom = currentImgZoom - ratio;
		imgZoom();
	}
	
	var resetZoom = function() {
		currentImgZoom = 1.0;
		imgZoom();
	}

	/** 
	 * Trigger zoom event on the nerve map composite image.
	 * @callback
	 */
	var onImageScrollEvent = function(event) {
			console.log(event)
			if (event.deltaY > 0) {
				imgZoomIn(0.1);
			} else if (event.deltaY < 0) {
				imgZoomOut(0.1);
			}
			event.preventDefault(); 
			event.stopPropagation();
			event.stopImmediatePropagation(); 
	}

	function onImageMouseDown( event ) {
	   	if (event.button == 2) {
	   		imgRightClickDown = true;
	   		event.preventDefault();
	   		event.stopImmediatePropagation(); 
	    } else {
	    	imgRightClickDown = false;
	    }
	}

	function onImageMouseMove( event ) {
		if (imgRightClickDown == true) {
			targetElement = dialogObject.find("#organsImgContainer")[0];
			targetElement.scrollTop += event.movementY;
			targetElement.scrollLeft -= event.movementX;
		}
	}

	function onImageMouseUp( event ) {
	   	if (event.button == 2) {
	   		event.preventDefault();
	   		event.stopPropagation();
	   		event.stopImmediatePropagation(); 
	    }
		imgRightClickDown = false;
	}

	function onImageMouseLeave( event ) {
		imgRightClickDown = false;
	}
	
	
	var enableImageMouseInteraction = function(targetElement) {
  if (targetElement.addEventListener) {
  	targetElement.addEventListener( 'mousedown', onImageMouseDown, false );
  	targetElement.addEventListener( 'mousemove', onImageMouseMove, false );
  	targetElement.addEventListener( 'mouseup', onImageMouseUp, false );
  	targetElement.addEventListener( 'mouseleave', onImageMouseLeave, false );
  	targetElement.oncontextmenu = function() { return false;};
  	targetElement.addEventListener( 'wheel', function ( event ) { onImageScrollEvent(event); }, false);
    }
	}
	
  var getOrganDetails = function(speciesName, systemName, partName) {
    if (speciesName && systemName && partName) {
      if (organsFileMap.hasOwnProperty(speciesName) &&
        organsFileMap[speciesName].hasOwnProperty(systemName) &&
        organsFileMap[speciesName][systemName].hasOwnProperty(partName))
        return organsFileMap[speciesName][systemName][partName];
    }
    return undefined;
  }
	  
	  /**
	   * New organs geometry has been added to the scene, add UIs and make sure
	   * the viewport is correct.
	   */
  var _addOrganPartCallback = function(systemName, partName, useDefautColour) {
    return function(geometry) {
      if (geometry.groupName) {
        for (var i = 0; i < organPartAddedCallbacks.length;i++) {
          organPartAddedCallbacks[i](geometry.groupName, geometry.isTimeVarying());
        }
        if (useDefautColour)
          modelsLoader.setGeometryColour(geometry, systemName, partName);
        if (systemName && partName) {
	        var organDetails = getOrganDetails(sceneData.currentSpecies, systemName, partName);
	        if (organDetails === undefined || organDetails.view == undefined)
	        {
	          _this.scene.viewAll();
	          var zincCameraControl = _this.scene.getZincCameraControls();
	          var viewport = zincCameraControl.getCurrentViewport();
	          zincCameraControl.setDefaultCameraSettings(viewport);
	          _this.scene.resetView();
	        }
	        var annotation = new (require('../utilities/annotation').annotation)();
	        annotation.data = {species:sceneData.currentSpecies, system:systemName, part:partName};
	        geometry.userData = [annotation];
        }
      }
    }
  }
	  
	  /** 
	   * Toggle data field displays. Data fields displays flow/pressure and other activities of the
	   * organs.
	   */
	  this.updateFieldvisibility = function(dataFields, value) {
      for ( var i = 0; i < dataFields.length; i ++ ) {
        if (value != i) {
          var geometryName = dataFields[i].PartName;
          changeOrganPartsVisibility(geometryName, false);
        }
      }
      if (value > -1) {
        var partName = dataFields[value].PartName;
        if ((_this.scene.findGeometriesWithGroupName(partName).length > 0) ||
          (_this.scene.findGlyphsetsWithGroupName(partName).length > 0)) {
          changeOrganPartsVisibility(partName, true);
        } else {
          var partDetails = getOrganDetails(dataFields[value].SystemName, partName);
          if (partDetails != undefined) {
            _this.scene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + partDetails.meta);
          }
        }
	    }
	  }
	  
	  /**
	   * Return an array containing name(s) of species that also contains the currently displayed organs.
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
	  
	  this.changeCompareSpecies = function(species) {
	    if (species == "none") {
	      compareSceneIsOn = false;
        for (var i = 0; i < layoutUpdateRequiredCallbacks.length;i++) {
          layoutUpdateRequiredCallbacks[i](false, false);
        }
	    } else{
	      sceneData.nerveMapIsActive = false;
	      compareSceneIsOn = true;
        for (var i = 0; i < layoutUpdateRequiredCallbacks.length;i++) {
          layoutUpdateRequiredCallbacks[i](true, false);
        }
	      readSpeciesIntoSecondaryRenderer(species);
	    }
	  }

	  /**
	   * Load organ(s) with the provided species, system and part. This will update
	   * the UIs, load in the models.
	   * If models are not available, it will attempt to display the data instead (same
	   * geometry as shown on the {@link PJP.BodyViewer}
	   * 
	   * @param {String} speciesName
	   * @param {String} systemName
	   * @param {String} systemName  
	   * @async
	   */
	  this.loadOrgans = function(speciesName, systemName, partName) {
	    //Do the work now if UI is ready otherwise try again later with a timeout setup.
	    if (_this.zincRenderer) {
	      if (speciesName && systemName && partName) {
	        resetZoom();
	        sceneData.currentSpecies = speciesName;
	        sceneData.currentSystem = systemName;
	        sceneData.currentPart = partName;
	        sceneData.nerveMapIsActive = false;
	        compareSceneIsOn = false;
	        // This is used as title
	        var name = speciesName + "/" + systemName + "/" + partName;
	        //Get informations from the array
	        var organsDetails = getOrganDetails(sceneData.currentSpecies, systemName, partName);
	        sceneData.associateData = undefined;
	        sceneData.dataFields = undefined;
	        sceneData.externalOrganLink = undefined;
	        sceneData.nerveMap = undefined;
	        if (organsDetails !== undefined){
	          if (organsDetails.sceneName !== undefined)
	            name = speciesName + "/" + organsDetails.sceneName;
	          sceneData.associateData = organsDetails.associateData;
	          if (organsDetails.fields)
	            sceneData.dataFields = organsDetails.fields;
	          sceneData.externalOrganLink = organsDetails.externalLink;
	          sceneData.nerveMap = organsDetails.nerveMap;
	        }
	        sceneData.currentName = name;

	        var organScene = _this.zincRenderer.getSceneByName(name);
	        // Check if organ scene exist,
	        // Exist: Set it as current scene and update the gui.
	        // Not: Create a new scene
	        if (organScene == undefined) {
	          _this.changeCompareSpecies("none");
	          organScene = _this.zincRenderer.createScene(name);
	          for (var i = 0; i < sceneChangedCallbacks.length;i++) {
	            sceneChangedCallbacks[i](sceneData);
	          }
	          _this.scene = organScene;
	          var directionalLight = organScene.directionalLight;
	          directionalLight.intensity = 1.4;
	          // Models with the same name exists, read in the models.
	          if (organsDetails != undefined) {
	            //Use organs specific viewports if it exists, otherwise use the default viewport.
	            if (organsDetails.view !== undefined)
	              organScene.loadViewURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + organsDetails.view);
	            else {
	              organScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
	            }
	            organScene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + organsDetails.meta, 
	              _addOrganPartCallback(systemName, partName, false));
	            var zincCameraControl = organScene.getZincCameraControls();
	            zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
	            zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
	            //Create a picker scene if it exists.
	            if (organsDetails.picker != undefined) {
	              var pickerSceneName = name + "_picker_scene";
	              pickerScene = _this.zincRenderer.createScene(pickerSceneName);
	              pickerScene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + organsDetails.picker);
	              zincCameraControl.enableRaycaster(pickerScene, _pickingCallback(), _hoverCallback());
	            } else {
	              zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
	            }
	          } else {
	            organScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
	            var systemMeta = modelsLoader.getSystemMeta(sceneData.currentSpecies);
	            var metaItem = systemMeta[systemName][partName];
	            var downloadPath = metaItem["BodyURL"];
	            if (metaItem["FileFormat"] == "JSON") {
	              organScene.loadMetadataURL(downloadPath, _addOrganPartCallback(systemName, partName, false));
	            }
	            else if (metaItem["FileFormat"] == "STL")
	              organScene.loadSTL(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
	            else if (metaItem["FileFormat"] == "OBJ") 
	              organScene.loadOBJ(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
	            _this.zincRenderer.setCurrentScene(organScene);
	            _this.graphicsHighlight.reset();
	            var zincCameraControl = organScene.getZincCameraControls();
	            zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
	            zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
	            zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
	          }
	          var directionalLight = organScene.directionalLight;
	          directionalLight.intensity = 1.4;
	          _this.zincRenderer.setCurrentScene(organScene);
	          _this.graphicsHighlight.reset();
	        } else if (_this.scene != organScene){
	          _this.changeCompareSpecies("none");
	          _this.zincRenderer.setCurrentScene(organScene);
	          _this.graphicsHighlight.reset();
	          for (var i = 0; i < sceneChangedCallbacks.length;i++) {
	            sceneChangedCallbacks[i](sceneData);
	          }
	          _this.scene = organScene;
	          var pickerSceneName = name + "_picker_scene";
	          pickerScene = _this.zincRenderer.getSceneByName(pickerSceneName);
	          _this.scene.forEachGeometry(_addOrganPartCallback());
	          _this.scene.forEachGlyphset(_addOrganPartCallback());
	        }
	        
	        preRenderTimeUpdate();
	      }
	    } else {
	      if (timeoutID == 0)
	        timeoutID = setTimeout(loadOrgansTimeoutCallback(speciesName, systemName, partName), 500);
	    }
	  }
	  
	  var loadOrgansTimeoutCallback = function(speciesName, systemName, partName) {
	    return function () {
	      timeoutID = 0;
	      _this.loadOrgans(speciesName, systemName, partName);
	    }
	  }
	  	  
	  this.alignCameraWithSelectedObject = function(transitionTime) {
	    var objects = _this.graphicsHighlight.getSelected();
	    if (objects && objects[0] && objects[0].userData) {
	      _this.scene.alignObjectToCameraView(objects[0].userData, transitionTime);
	    }
	  }
	  
	  this.destroy = function() {
	    if (_this.zincRenderer) {
	      _this.zincRenderer.dispose();
	      _this.zincRenderer.getThreeJSRenderer().dispose();
	      _this.zincRenderer = undefined;
	    }
	    if (secondaryRenderer) {
	      secondaryRenderer.dispose();
	      secondaryRenderer = null;
	    }
	    (require('./BaseModule').BaseModule).prototype.destroy.call( _this );
	  }

	/**
	 * Add UI callbacks after html page has been loaded.
	 */
	var addUICallback = function() {
		var element = dialogObject.find("#organsImgContainer")[0];
		enableImageMouseInteraction(element);
	}
		
	/**
	 * initialise loading of the html layout for the organs panel, 
	 * this is called when the {@link PJP.OrgansViewer} is created.
	 * 
	 * @async 
	 */
	 var initialise = function() {
	   //addUICallback();
	   _this.initialiseRenderer(undefined);
	   _this.zincRenderer.addPreRenderCallbackFunction(preRenderTimeUpdateCallback());
     //createNewDialog(require("./snippets/organsViewer.html"));
  }
	 
	initialise();
	
	if (0) {
    require([
             "dojo/ready",
             "dojo/dom",
             "cbtree/Tree",                     // Checkbox tree
             "cbtree/model/TreeStoreModel",   // Object Store Forest Model
             "cbtree/store/ObjectStore"         // Object Store with Hierarchy
             ], function( ready, dom, Tree, ObjectStoreModel, ObjectStore) {

               var store = new ObjectStore( { url:"models/organsViewerModels/digestive/stomach/store/neuritemap.json", idProperty:"id"});
               var model = new ObjectStoreModel( { store: store,
                                                    query: {name: "Root"},
                                                    rootLabel: "All",
                                                    checkedRoot: true
                                                  });
               var imgEle = {};
               var imgPrefix = "models/organsViewerModels/digestive/stomach/nerve_map/texture/";
               var tree = undefined;
               var imageUpdated = false;
            	   
               function modelItemChanged(item, propertyName, newValue, oldValue) {
            	  if (item.img) {
            		  if (propertyName == "checked") {
            			  var elem = imgEle[item.id];
            			  if (newValue == false) {
            				  elem.style.display = "none";
                			  imageCombiner.removeElement(elem);
            			  } else {
            				  elem.style.display = "inline";
            				  imageCombiner.addElement(elem);
            			  }
            			  imageUpdated = true;
            		  }
            	  }
               }
               
               function checkBoxClicked(item, node, event) {
            	   if (imageUpdated) {
            		   var bitmap = imageCombiner.getCombinedImage();
            		   setTextureForScene(nerveMapScene, bitmap);
            		   imageUpdated = false;
            	   }
               }
               
               function forEachChildrenCreateImageElements(container) {
            	   return function (childrenArray) {
            		   for (var i = 0; i < childrenArray.length; i++) {
            			  var currentItem = childrenArray[i];
            			  if (currentItem.img) {
            				  var imgURL = imgPrefix + currentItem.img;
            				  var elem = document.createElement("img");
            				  elem.className = "organsImg";
            				  elem.src = imgURL; 
            				  elem.style.display = "none";
            				  container.appendChild(elem);
            				  imgEle[currentItem.id] = elem;
            				  if (currentItem.checked == true) {
            					  elem.style.display = "inline";
            					  imageCombiner.addElement(elem);
            				  }
            			  }
            			  if (currentItem.colour) {
            				  if (tree._itemNodesMap[currentItem.id]) {
            					  var nodeElem = tree._itemNodesMap[currentItem.id][0].labelNode;
            					  if (nodeElem) {
            						  nodeElem.style.color = "#" + currentItem.colour;
            					  }	  
            				  }
            			  }
            			  model.getChildren(currentItem, forEachChildrenCreateImageElements(container));
            		   }
            	   }
               }
				
           	/**
           	 * Setup the tree for toggling parts of the nerve map texture/image.
           	 * Uses dojo tree and checkbox for the UI and ImageCombiner for image composition.
           	 */
               function rootIsReady() {
                 return function(root) {
                   var height = dialogObject.find("#organsRootImage")[0].height;
                   var width = dialogObject.find("#organsRootImage")[0].width;
                   imageCombiner = new ImageCombiner();
                   imageCombiner.setSize(width, height);
                   imageCombiner.addElement(dialogObject.find("#organsRootImage")[0]);
                   var container = dom.byId("organsImgContainer");
                   model.getChildren(root, forEachChildrenCreateImageElements(container));
                   var bitmap = imageCombiner.getCombinedImage();
                   setTextureForScene(nerveMapScene, bitmap);
                 }
               }

               ready( function () {
                 tree = new Tree( { model: model,
                   autoExpand:true,
                   branchIcons:false,
                   leafIcons: false,
                 } );
                 tree.domNode.style.height = "100%";
                 tree.domNode.style.fontSize = "70%";
                 model.getRoot(rootIsReady());
                 model.on("change", modelItemChanged);
                 tree.on("checkBoxClick", checkBoxClicked);
                 tree.placeAt( "CheckboxTree" );
                 tree.startup();
               });
    });
	}
}

OrgansViewer.prototype = Object.create((require('./RendererModule').RendererModule).prototype);
exports.OrgansViewer = OrgansViewer;
