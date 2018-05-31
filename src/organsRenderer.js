var dat = require("./dat.gui.js");
require("./styles/dat-gui-swec.css");
require("./styles/my_styles.css");
var THREE = require('three');

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
exports.OrgansViewer = function(ModelsLoaderIn, DialogName)  {
	var currentSpecies = undefined;
	var pickerScene = undefined;
	var displayScene = undefined;
	var defaultScene = undefined;
	var secondaryScene = undefined;
	var tertiaryScene = undefined;
	var nerveMapScene = undefined;
	var windowWidth, windowHeight;
	var organGui;
	var currentImgZoom = 1.0;
	var organGuiControls = new function() {
		this.Speed = 500;
	};
	var imgRightClickDown = false;
	var comparedSceneIsOn = false;
	var additionalSpecies = undefined;
	var currentName = "";
	var currentSystem = "";
	var currentPart = "";
	var currentSpecies  = "";
	//Current model's associate data, data fields, external link, nerve map informations,
	//these are proived in the organsFileMap array.
	var associateData = undefined;
	var dataFields = undefined;
	var externalOrganLink = undefined;
	var nerveMap = undefined;
	var nerveMapIsActive = false;
	var timeoutID = 0;
	var fullScreen = false;
	var organPartsGui;
	// data used by dat.gui to control model specific controls. 
	var organPartGuiControls = function() {
	};
	var timeSlider = undefined;
	var texSlider = undefined;
	var speedSlider = undefined;
	var dialogObject = undefined;
	var localDialogName = DialogName;
	var toolTip = undefined;
	  
	
	// data used by dat.gui to control non-model specific controls. 
	var organsControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	/**
	 * {ImageCombiner}.
	 */
	var imageCombiner = undefined;
	
	var UIIsReady = false;
	var tissueViewer = undefined;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var modelsLoader = ModelsLoaderIn;
	var _this = this;
	
	//ZincRenderer for the primary display of model.
	var organsRenderer = null;
	//Secondary renderer, used for comparing species models.
	var secondaryRenderer = null;
	
	//Array for storing different species models urls.
	var organsFileMap = new Array();
	
	//Array for storing rat's models urls and its associated data.
	var ratOrgansFileMap = new Array();
	ratOrgansFileMap["Cardiovascular"] = new Array();
	ratOrgansFileMap["Cardiovascular"]["Kidneys-Arteries"] = {
			view: "rat/cardiovascular/arteries/rat_kidneys_view.json",
			meta: "rat/cardiovascular/arteries/rat_kidneys_1.json",
			picker: undefined,
			associateData: undefined	
	};
	
	//Array for storing human's models urls and its associated data.
	var humanOrgansFileMap = new Array();
	humanOrgansFileMap["Cardiovascular"] = new Array();
	humanOrgansFileMap["Digestive"] = new Array();
	humanOrgansFileMap["Respiratory"] = new Array();
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
			nerveMap: new Array()};
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
	
	var getPos = function(el) {
	    for (var lx=0, ly=0;
			el != null;
			lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
		return {x: lx,y: ly};
	}
	
	/**
	 * Used to update internal timeer in scene when time slider has changed.
	 */
	var timeSliderChanged = function() {
		if (!nerveMapIsActive) {
			if (pickerScene)
				pickerScene.setMorphsTime(timeSlider.value * 30);
			if (displayScene)
				displayScene.setMorphsTime(timeSlider.value * 30);
		} else if (nerveMapScene) {
				nerveMapScene.setMorphsTime(timeSlider.value * 30);
				if (nerveMap && nerveMap.additionalReader)
					nerveMap.additionalReader.setTime(timeSlider.value / 100.0);
		}
	}
	
	/**
	 * Update the time slider and other renderers/scenes when time has changed.
	 */
	var updateTimeSlider = function() {
		var currentTime = organsRenderer.getCurrentTime();
		var sliderValue = currentTime / 30.0;
		timeSlider.value = sliderValue;
		if (!nerveMapIsActive && pickerScene)
			pickerScene.setMorphsTime(currentTime);
		if (nerveMap && nerveMap.additionalReader)
			nerveMap.additionalReader.setTime(currentTime / 3000.0);
	}
	
	var updateTimeSliderCallback = function() {
		return function() {
			updateTimeSlider();
		}
	}
	
	var playPauseAnimation = function(element) {
		if (element.className == "play") {
			element.className = "pause";
			organsRenderer.playAnimation = true;
		} else {
			element.className = "play";
			organsRenderer.playAnimation = false;	
		}
	}
	
	/**
	 * Speed slider has moved, adjust the play speed of the renderer.
	 * @callback
	 */
	var speedSliderChanged = function() {
		return function(value) {
			organsRenderer.setPlayRate(value);
		}
	}
	
	var updateSpeedSlider = function() {
		var playRate = organsRenderer.getPlayRate();
		organGuiControls.Speed = playRate;
		speedSlider.updateDisplay();	
	}
	
	var texSliderChanged = function() {
		if (nerveMap && nerveMap.additionalReader)
			nerveMap.additionalReader.setSliderPos(texSlider.value);
	}
	
	var setOrgansPanelTitle = function(name) {
	  console.log("Fix setOrgansPanelTitle");
	 	//var text_display = document.getElementById('OrganTitle');
		//text_display.innerHTML = "<strong>Organ: <span style='color:#FF4444'>" + name + "</span></strong>";
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
				if (displayScene.sceneName == "human/Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					toolTip.setText("Node " + id);
					toolTip.show(window_x, window_y);
					var tissueTitle = "<strong>Tissue: <span style='color:#FF4444'>" + id + "</span></strong>";
					if (tissueViewer) {
						tissueViewer.setTissueTitleString(tissueTitle);
						tissueViewer.showButtons(true);
						tissueViewer.showCollagenVisible(true);
					}
				} else if (displayScene.sceneName.includes("human/Cardiovascular/Arterial")) {
				  toolTip.setText("Click to show vascular model");
				  toolTip.show(window_x, window_y);
					if (tissueViewer)
						tissueViewer.resetTissuePanel();
					if (cellPanel)
						cellPanel.resetCellPanel();
					if (modelPanel)
						modelPanel.openModel("BG_Circulation_Model.svg");
				}
			}
		}
	};
	
	/** 
	 * Callback function when a pickable object has been hovered over. It will show
	 * objecty id/name as tooltip text.
	 * 
	 * @callback
	 */
	var _hoverCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				if (displayScene.sceneName == "human/Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					dialogObject.find("#organsDisplayArea")[0].style.cursor = "pointer";
	        toolTip.setText("Node " + id);
	        toolTip.show(window_x, window_y);
				} else if (displayScene.sceneName.includes("human/Cardiovascular/Arterial")) {
					dialogObject.find("#organsDisplayArea")[0].style.cursor = "pointer";
					toolTip.setText("Click to show vascular model");
					toolTip.show(window_x, window_y);
				}
			}
			else {
			  toolTip.hide();
				dialogObject.find("#organsDisplayArea")[0].style.cursor = "auto";
			}
		}
	};

	var updateOrganPartsVisibilty = function(name, flag) {
		return function(zincGeometry) {
			if (zincGeometry.groupName && zincGeometry.groupName == name) {
				zincGeometry.setVisibility(flag);
			}
		}
	}
	
	/**
	 * Change visibility for parts of the current scene.
	 */
	var changeOrganPartsVisibility = function(name, value) {
		displayScene.forEachGeometry(updateOrganPartsVisibilty(name, value));
		displayScene.forEachGlyphset(updateOrganPartsVisibilty(name, value));
		if (pickerScene) {
			pickerScene.forEachGeometry(updateOrganPartsVisibilty(name, value))
			pickerScene.forEachGlyphset(updateOrganPartsVisibilty(name, value));
		}
	}
	
	var changeOrganPartsVisibilityCallback = function(name) {
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
	 * Callback function when a data geometry has been toggled on/off the scene.
	 */
	var changeDataGeometryVisibility = function() {
		return function(value) {
			if ((displayScene.findGeometriesWithGroupName("Data Geometry").length > 0) ||
					(displayScene.findGlyphsetsWithGroupName("Data Geometry").length > 0)) {
				changeOrganPartsVisibility("Data Geometry", value);
			} else {
				for ( var i = 0; i < associateData.length; i ++ ) {
					var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
					var metaItem = systemMeta[associateData[i].SystemName][associateData[i].PartName];
					var downloadPath = metaItem["BodyURL"];
					var color = new THREE.Color("#0099ff");
					if (metaItem["FileFormat"] == "JSON")
						displayScene.loadMetadataURL(downloadPath, _addDataGeometryCallback("Data Geometry", color));
					else if (metaItem["FileFormat"] == "STL")
						displayScene.loadSTL(downloadPath, "Data Geometry", _addDataGeometryCallback("Data Geometry", color));
					else if (metaItem["FileFormat"] == "OBJ") 
						displayScene.loadOBJ(downloadPath, "Data Geometry", _addDataGeometryCallback("Data Geometry", color));
				}
			}
		}
	}
	
	/** 
	 * Update layout of the organs panel, there are three different layouts at this moment.
	 * 1. Normal display - Fullscreen/split screen with a single display.
	 * 2. Nerve map display - Three panels when it is on fullscreen display.
	 * 3. Species comparison display - Two panels when it is on fullscreen display.
	 */
	var updateLayout = function() {
		if (fullScreen) {
			if (comparedSceneIsOn) {
				var element = dialogObject.find("#organsDisplayArea")[0];
				element.style.width = "50%";
				element = dialogObject.find("#organsSecondaryDisplayArea")[0];
				element.className = "organsSecondSceneDisplay";
				element.style.display = "block";
				element = dialogObject.find("#timeSliderContainer")[0];
				element.style.width = "50%";
				element = dialogObject.find("#organsTertieryDisplayArea")[0];
				element.style.display = "none";
			} else if (nerveMapIsActive) {
				var element = dialogObject.find("#organsDisplayArea")[0];
				element.style.width = "33%";
				element = dialogObject.find("#organsSecondaryDisplayArea")[0];
				element.className = "organsSecondNerveDisplay";
				element.style.display = "block";
				element = dialogObject.find("#timeSliderContainer")[0];
				element.style.width = "33%";
				element = dialogObject.find("#organsTertieryDisplayArea")[0];
				element.style.display = "block";
			} else {
				var element = dialogObject.find("#organsDisplayArea")[0];
				element.style.width = "100%";
				element = dialogObject.find("#timeSliderContainer")[0];
				element.style.width = "100%";
				element = dialogObject.find("#organsSecondaryDisplayArea")[0];
				element.style.display = "none";
				element = dialogObject.find("#organsTertieryDisplayArea")[0];
				element.style.display = "none";
			}
		} else {
			var element = dialogObject.find("#organsDisplayArea")[0];
			element.style.width = "100%";
			element = dialogObject.find("#timeSliderContainer")[0];
			element.style.width = "100%";
			element = dialogObject.find("#organsSecondaryDisplayArea")[0];
			element.style.display = "none";
			element = dialogObject.find("#organsTertieryDisplayArea")[0];
			element.style.display = "none";
		}
		
		if (nerveMapIsActive) {
			element = dialogObject.find("#texSlider")[0];
			element.style.display = "block";
			element = dialogObject.find("#organsImgContainer")[0];
			element.style.display = "block";
			element = dialogObject.find("#organsSecondaryDisplayRenderer")[0];
			element.style.display = "none";
			element = dialogObject.find("#CheckboxTree")[0];
			element.style.display = "block";
			
		} else {
			element = dialogObject.find("#texSlider")[0];
			element.style.display = "none";
			element = dialogObject.find("#organsImgContainer")[0];
			element.style.display = "none";
			element = dialogObject.find("#organsSecondaryDisplayRenderer")[0];
			element.style.display = "block";
			element = dialogObject.find("#CheckboxTree")[0];
			element.style.display = "none";
				
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
		var sceneName = currentName + "_nervemap";
		nerveMapScene = organsRenderer.getSceneByName(sceneName);
		if (nerveMapScene == undefined) {
			var downloadPath = modelsLoader.getOrgansDirectoryPrefix() + "/" + nerveMap.threed.meta;
			nerveMapScene = organsRenderer.createScene(sceneName);
			nerveMapScene.loadMetadataURL(downloadPath, _addNerveMapGeometryCallback("threed"));
			if (nerveMap.threed.view !== undefined)
				nerveMapScene.loadViewURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + nerveMap.threed.view);
			else {
				nerveMapScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
			}
			nerveMapScene.ambient.intensity = 8.0;
			nerveMapScene.directionalLight.intensity = 0;
			var zincCameraControl = nerveMapScene.getZincCameraControls();
			zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
			nerveMap.additionalReader = new PJP.VaryingTexCoordsReader(nerveMapScene);
			var urlsArray = [ modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_0.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi1_time_1.json",
			                  modelsLoader.getOrgansDirectoryPrefix() + "/digestive/stomach/nerve_map/3d/xi0_time_0.json"];
			nerveMap.additionalReader.loadURLsIntoBufferGeometry(urlsArray);
		}
		organsRenderer.setCurrentScene(nerveMapScene);	
	}
	
	/**
	 * Load the appropriate svg diagram to the svg viewer on the organs panel.
	 */
	var setupOrgansNerveSVG = function() {
			var svgObject = dialogObject.find("#organSVG")[0];
			if (nerveMap["svg"]["url"]) {
				svgObject.setAttribute('data', nerveMap["svg"]["url"] );	
			}
	}

	/**
	 * Create/Get the secondary renderer and display relavant models on it. 
	 */
	var setupSecondaryRenderer = function(species) {
		if (secondaryRenderer == null)
			secondaryRenderer = PJP.setupRenderer("organsSecondaryDisplayRenderer");
		var sceneName = currentSpecies + "/" + currentName;
		secondaryScene = secondaryRenderer.getSceneByName(sceneName);
		if (secondaryScene == undefined) {
			var details = organsFileMap[species][currentSystem][currentPart];
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
		secondaryRenderer.animate();
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
			var texture = new THREE.Texture(bitmap);
			targetScene.forEachGeometry(setTextureForGeometryCallback(texture));
			if (nerveMap)
				nerveMap.additionalReader.setTexture(texture);
		}
	}

	var activateAdditionalNerveMapRenderer = function() {
		updateLayout();
		setupOrgansNerveSVG();
	}
	
	/**
	 * Nerve map has been toggled on/off, change organs renderer layput.
	 */
	var changeNerveMapVisibility = function() {
		nerveMapIsActive = !nerveMapIsActive;
		if (nerveMapIsActive)
			setupNerveMapPrimaryRenderer();
		else {
			organsRenderer.setCurrentScene(displayScene);
		}
		activateAdditionalNerveMapRenderer();
	}
	
	var organsBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			dialogObject.find("#organsSecondaryDisplayArea")[0].style.backgroundColor = backgroundColourString;
			var colour = new THREE.Color(backgroundColourString);
			var internalRenderer = organsRenderer.getThreeJSRenderer();
			internalRenderer.setClearColor( colour, 1 );
			if (secondaryRenderer) {
				internalRenderer = secondaryRenderer.getThreeJSRenderer();
				internalRenderer.setClearColor( colour, 1 );
			}
		}
	}
	
	var expandCollapseOrgans = function(source, portName) {
		if (source.value == "Expand") {
			fullScreen = true;
		} else {
			fullScreen = false;
		}
		expandCollapse(source, portName);
		activateAdditionalNerveMapRenderer();
	}
	
	/**
	 * Initialise organs panel, setup primary renderer and dat.gui UI.
	 */ 
	var initialiseOrgansVisualisation = function() {
	  toolTip = new (require("./tooltip").ToolTip)(dialogObject);
		organsRenderer = require("./utility").setupRenderer("organsDisplayArea");
		organsRenderer.addPreRenderCallbackFunction(updateTimeSliderCallback());
		defaultScene = organsRenderer.getCurrentScene();
		organGui = new dat.GUI({autoPlace: false});
		organGui.domElement.id = 'gui';
		organGui.close();
		var control = new organsControl();
		var controller = organGui.addColor(control, 'Background');
		controller.onChange(organsBackGroundChanged());
		var customContainer = dialogObject.find("#organGui")[0].append(organGui.domElement);
		var resetViewButton = { 'Reset View':function(){ organsRenderer.resetView() }};
		var viewAllButton = { 'View All':function(){ organsRenderer.viewAll() }};
		organGuiControls.Speed = 500.0;
		speedSlider = organGui.add(organGuiControls, 'Speed', 0, 5000).step(50).onChange(speedSliderChanged());
		organGui.add(resetViewButton, 'Reset View');
		organGui.add(viewAllButton, 'View All');
		organPartsGui = organGui.addFolder('Visibility Control');
		organPartsGui.open();
		organsRenderer.animate();
	}

	var imgZoom = function() {
		var cssRule = (require('./utility').findCSSRule)(".organsImg");
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
	
	/**
	 * Add UI callbacks after html page has been loaded.
	 */
	var addUICallback = function() {
		var organLinkeButton = dialogObject.find("#organLinkButton")[0];
		organLinkeButton.onclick = function() { openOrganModelLink() };
		//var organsScreenButton = dialogObject.find("#organsScreenButton")[0];
		//organsScreenButton.onclick = function() { expandCollapseOrgans(organsScreenButton, 'organsDisplayPort') };
		timeSlider = dialogObject.find("#organ_animation_slider")[0];
		timeSlider.oninput= function() { timeSliderChanged() };
		texSlider = dialogObject.find("#texSlider")[0];
		texSlider.oninput= function() { texSliderChanged() };
		var organsPlayToggle = dialogObject.find("#organsPlayToggle")[0];
		organsPlayToggle.onclick = function() { playPauseAnimation(organsPlayToggle) };
		var element = dialogObject.find("#organsImgContainer")[0];
		enableImageMouseInteraction(element);
	}
	
  var createNewDialog = function(data) {
    dialogObject = require("./utility").createDialogContainer(localDialogName, data);
    addUICallback();
    initialiseOrgansVisualisation();
    UIIsReady = true;
  }
	
	/**
	 * initialise loading of the html layout for the organs panel, 
	 * this is called when the {@link PJP.OrgansViewer} is created.
	 * 
	 * @async 
	 */
	 var initialise = function() {
      createNewDialog(require("./snippets/organsViewer.html"));
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
				if (!organPartGuiControls.hasOwnProperty(geometry.groupName)) {
					organPartGuiControls[geometry.groupName] = true;
					organPartsGui.add(organPartGuiControls, geometry.groupName).onChange(changeOrganPartsVisibilityCallback(geometry.groupName));
				}
				if (useDefautColour)
					modelsLoader.setGeometryColour(geometry, systemName, partName);
				var organDetails = getOrganDetails(currentSpecies, systemName, partName);
				if (organDetails === undefined || organDetails.view == undefined)
				{
					displayScene.viewAll();
					var zincCameraControl = displayScene.getZincCameraControls();
					var viewport = zincCameraControl.getCurrentViewport();
					zincCameraControl.setDefaultCameraSettings(viewport);
					displayScene.resetView();
				}
			}
		}
	}
	
	/** 
	 * Toggle data field displays. Data fields displays flow/pressure and other activities of the
	 * organs.
	 */
	var toggleFieldVisibility = function(dataFields) {
		return function(value) {
			for ( var i = 0; i < dataFields.length; i ++ ) {
				if (value != i) {
					var geometryName = dataFields[i].PartName;
					changeOrganPartsVisibility(geometryName, false);
				}
			}
			if (value > -1) {
				var partName = dataFields[value].PartName;
				if ((displayScene.findGeometriesWithGroupName(partName).length > 0) ||
					(displayScene.findGlyphsetsWithGroupName(partName).length > 0)) {
					changeOrganPartsVisibility(partName, true);
				} else {
					var partDetails = getOrganDetails(dataFields[value].SystemName, partName);
					if (partDetails != undefined) {
						displayScene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + partDetails.meta);
					}
				}
			}
		}
	}
	
	/**
	 * Return an array containing name(s) of species that also contains the currently displayed organs.
	 * @returns {Array} containing species name 
	 */
	var getAvailableSpecies = function() {
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
	
	var changeComparedSpecies = function(species) {
		if (species == "none") {
			comparedSceneIsOn = false;
			updateLayout();
		} else{
			nerveMapIsActive = false;
			comparedSceneIsOn = true;
			updateLayout();
			setupSecondaryRenderer(species);
		}
	}

	/**
	 * Reset dat.gui ui and also update it to fit the current displaying
	 * organs.
	 */
	var updateOrganSpecificGui = function() {
		organPartGuiControls = function() {
		};
		organGui.removeFolder('Visibility Control');
		organPartsGui = organGui.addFolder('Visibility Control');
		organPartsGui.open();
		if (associateData) {
			organPartGuiControls["Data Geometry"] = false;
			organPartsGui.add(organPartGuiControls, "Data Geometry").onChange(changeDataGeometryVisibility());
		}
		if (dataFields) {
			organPartGuiControls.Field = -1;
			var fieldPairs = {};
			fieldPairs["None"] = -1;
			for ( var i = 0; i < dataFields.length; i ++ ) {
				fieldPairs[dataFields[i].PartName] = i; 
			}
			organPartsGui.add(organPartGuiControls, 'Field', fieldPairs ).onChange(toggleFieldVisibility(dataFields));
		}
		if (nerveMap) {
			var nerveMapButton = { 'Toggle nerve':function(){ changeNerveMapVisibility() }};
			organPartsGui.add(nerveMapButton, 'Toggle nerve');
		}
		var otherSpecies = getAvailableSpecies();
		if (otherSpecies.length > 1) {
			organPartGuiControls["Compared With"] = "none";
			var comparedSelected = organPartsGui.add(organPartGuiControls, 'Compared With', otherSpecies);
			comparedSelected.onChange(function(species) {
				changeComparedSpecies(species);
			} );
			
		}
				
		var element = dialogObject.find("#texSlider")[0];
		element.style.display = "none";
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
		if (UIIsReady) {
			if (speciesName && systemName && partName) {
				resetZoom();
				currentSpecies = speciesName;
				currentSystem = systemName;
				currentPart = partName;
				nerveMapIsActive = false;
				comparedSceneIsOn = false;
				var systemMeta = modelsLoader.getSystemMeta(currentSpecies);
				var metaItem = systemMeta[systemName][partName];
				// This is used as title
				var name = speciesName + "/" + systemName + "/" + partName;
				currentName = name;
				//Get informations from the array
				var organsDetails = getOrganDetails(currentSpecies, systemName, partName);
				associateData = undefined;
				dataFields = undefined;
				externalOrganLink = undefined;
				nerveMap = undefined;
				if (organsDetails !== undefined){
					if (organsDetails.sceneName !== undefined)
						name = speciesName + "/" + organsDetails.sceneName;
					associateData = organsDetails.associateData;
					if (organsDetails.fields)
						dataFields = organsDetails.fields;
					externalOrganLink = organsDetails.externalLink;
					nerveMap = organsDetails.nerveMap;
				}
				var button = dialogObject.find("#organLinkButton")[0];
				if (externalOrganLink) {
					button.style.visibility = "visible";
				} else {
					button.style.visibility = "hidden";
				}

				var organScene = organsRenderer.getSceneByName(name);
				// Check if organ scene exist,
				// Exist: Set it as current scene and update the gui.
				// Not: Create a new scene
				if (organScene == undefined) {
					updateOrganSpecificGui();
					organScene = organsRenderer.createScene(name);
					displayScene = organScene;
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
							pickerScene = organsRenderer.createScene(pickerSceneName);
							pickerScene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + organsDetails.picker);
							zincCameraControl.enableRaycaster(pickerScene, _pickingCallback(), _hoverCallback());
						} else {
							zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
						}
					} else {
						organScene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
						var downloadPath = metaItem["BodyURL"];
						if (metaItem["FileFormat"] == "JSON") {
							organScewith_body.htmlne.loadMetadataURL(downloadPath, _addOrganPartCallback(systemName, partName, false));
						}
						else if (metaItem["FileFormat"] == "STL")
							organScene.loadSTL(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
						else if (metaItem["FileFormat"] == "OBJ") 
							organScene.loadOBJ(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
						organsRenderer.setCurrentScene(organScene);
						var zincCameraControl = organScene.getZincCameraControls();
						zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
						zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
						zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
					}
					var directionalLight = organScene.directionalLight;
					directionalLight.intensity = 1.4;
					organsRenderer.setCurrentScene(organScene);
				} else if (displayScene != organScene){
					updateOrganSpecificGui();
					organsRenderer.setCurrentScene(organScene);
					displayScene = organScene;
					var pickerSceneName = name + "_picker_scene";
					pickerScene = organsRenderer.getSceneByName(pickerSceneName);
					displayScene.forEachGeometry(_addOrganPartCallback());
					displayScene.forEachGlyphset(_addOrganPartCallback());
				}
				setOrgansPanelTitle(name);
				updateTimeSlider();
				updateSpeedSlider();
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
	
	
	var triggerAnimation = function() {
		if (organsRenderer.playAnimation == true) {
			organsRenderer.playAnimation = false;
		} else {
			organsRenderer.playAnimation = true;	
		}
	}
	
	var resetView = function()
	{
		organsRenderer.resetView();
	}
	
	var viewAll = function()
	{
		organsRenderer.viewAll();
	}
	
	var openOrganModelLink = function() {
		window.open(externalOrganLink, '');
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
