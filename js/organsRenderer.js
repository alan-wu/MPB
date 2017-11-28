
PJP.OrgansViewer = function(ModelsLoaderIn, PanelName)  {
	var pickerScene = undefined;
	var displayScene = undefined;
	var defaultScene = undefined;
	var windowWidth, windowHeight;
	var organGui;
	var organGuiControls = new function() {
		this.Time = 0.0;
		this.Speed = 500;
	};
	var associateData = undefined;
	var dataFields = undefined;
	var externalOrganLink = undefined;
	var timeoutID = 0;
	
	var organPartsGui;
	var organPartGuiControls = function() {
	};
	var timeSlider = undefined;
	var speedSlider = undefined;
	var organsControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	var UIIsReady = false;
	var tissueViewer = undefined;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var modelsLoader = ModelsLoaderIn;
	
	var _this = this;
	
	var organsRenderer = null;
	
	var organsFileMap = new Array();
	
	organsFileMap["Cardiovascular"] = new Array();
	organsFileMap["Digestive"] = new Array();
	organsFileMap["Respiratory"] = new Array();
	organsFileMap["Cardiovascular"]["Heart"] = {
			view: "cardiovascular/heart/heart_view.json",
			meta: "cardiovascular/heart/animated_nerve_1.json",
			picker: "cardiovascular/heart/picking_node_1.json",
			associateData: undefined,
			externalLink: "https://models.cellml.org/e/bd/deforming_heart.rdf/view"};
	organsFileMap["Cardiovascular"]["Arterial Flow"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_flow_1.json",
			picker: undefined,
			associateData: undefined};
	organsFileMap["Cardiovascular"]["Arterial Pressure"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_pressure_1.json",
			picker: undefined,
			associateData: undefined};
	organsFileMap["Cardiovascular"]["Arterial Velocity"] = {
			view: undefined,
			meta: "cardiovascular/arteries/arterial_velocity_1.json",
			picker: undefined,
			associateData: undefined};
	organsFileMap["Cardiovascular"]["Aorta"] = {
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
	organsFileMap["Cardiovascular"]
	
	organsFileMap["Cardiovascular"]["Left Upper Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
	organsFileMap["Cardiovascular"]["Left Lower Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
	organsFileMap["Cardiovascular"]["Right Upper Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
	organsFileMap["Cardiovascular"]["Right Lower Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
	organsFileMap["Digestive"]["Stomach"] = {
			view: undefined,
			meta: "digestive/stomach_1.json",
			picker: undefined,
			associateData: undefined};
	organsFileMap["Respiratory"]["Lungs"] = {
			view: "respiratory/lungs_view.json",
			meta: "respiratory/lungs_1.json",
			picker: undefined,
			associateData: undefined};
	
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
	
	var timeSliderChanged = function() {
		return function(value) {
			if (pickerScene)
				pickerScene.setMorphsTime(value * 30);
			if (displayScene)
				displayScene.setMorphsTime(value * 30);
		}
	}
	
	var updateTimeSlider = function() {
		var currentTime = organsRenderer.getCurrentTime();
		var sliderValue = currentTime / 30.0;
		organGuiControls.Time = sliderValue;
		if (pickerScene)
			pickerScene.setMorphsTime(currentTime);
		timeSlider.updateDisplay();	
	}
	
	var updateTimeSliderCallback = function() {
		return function() {
			updateTimeSlider();
		}	
	}
	
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
	
	var setOrgansString = function(name) {
	 	var text_display = document.getElementById('OrganTitle');
		text_display.innerHTML = "<strong>Organ: <span style='color:#FF4444'>" + name + "</span></strong>";
	}
	
	var setToolTipText = function(text) {
		tiptextElement.innerHTML = text;
	}
	
	var _pickingCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				if (displayScene.sceneName == "Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					setToolTipText("Node " + id);
					currentHoverId = id;
					showTooltip(window_x, window_y);
					var tissueTitle = "<strong>Tissue: <span style='color:#FF4444'>" + id + "</span></strong>";
					if (tissueViewer) {
						tissueViewer.setTissueTitleString(tissueTitle);
						tissueViewer.showButtons(true);
						tissueViewer.showCollagenVisible(true);
					}
				} else if (displayScene.sceneName.includes("Cardiovascular/Arterial")) {
					setToolTipText("Click to show vascular model");
					showTooltip(window_x, window_y);
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
	
	var _hoverCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				if (displayScene.sceneName == "Cardiovascular/Heart") {
					var id = Math.round(intersects[ 0 ].object.material.color.b * 255) ;
					setToolTipText("Node " + id);
					currentHoverId = id;
					document.getElementById("organsDisplayArea").style.cursor = "pointer";
					showTooltip(window_x, window_y);
				} else if (displayScene.sceneName.includes("Cardiovascular/Arterial")) {
					document.getElementById("organsDisplayArea").style.cursor = "pointer";
					setToolTipText("Click to show vascular model");
					showTooltip(window_x, window_y);
				}
			}
			else {
				hideTooltip();
				document.getElementById("organsDisplayArea").style.cursor = "auto";
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
	
	var _addDataGeometryCallback = function() {
		return function(geometry) {
			geometry.groupName = "Data Geometry";
			geometry.morph.material.color = new THREE.Color("#0099ff");
		}
	}
	
	var changeDataGeometryVisibility = function() {
		return function(value) {
			if ((displayScene.findGeometriesWithGroupName("Data Geometry").length > 0) ||
					(displayScene.findGlyphsetsWithGroupName("Data Geometry").length > 0)) {
				changeOrganPartsVisibility("Data Geometry", value);
			} else {
				for ( var i = 0; i < associateData.length; i ++ ) {
					var systemMeta = modelsLoader.getSystemMeta();
					var metaItem = systemMeta[associateData[i].SystemName][associateData[i].PartName];
					var downloadPath = metaItem["BodyURL"];
					if (metaItem["FileFormat"] == "JSON")
						displayScene.loadMetadataURL(downloadPath, _addDataGeometryallback());
					else if (metaItem["FileFormat"] == "STL")
						displayScene.loadSTL(downloadPath, "Data Geometry", _addDataGeometryCallback());
					else if (metaItem["FileFormat"] == "OBJ") 
						displayScene.loadOBJ(downloadPath, "Data Geometry", _addDataGeometryCallback());
				}
			}
		}
	}
	
	var organsBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			var colour = new THREE.Color(backgroundColourString);
			var internalRenderer = organsRenderer.getThreeJSRenderer();
			internalRenderer.setClearColor( colour, 1 );
		}
	}
	
	var initialiseOrgansVisualisation = function() {
		organsRenderer = PJP.setupRenderer("organsDisplayArea");
		organsRenderer.addPreRenderCallbackFunction(updateTimeSliderCallback());
		defaultScene = organsRenderer.getCurrentScene();
		organGui = new dat.GUI({autoPlace: false});
		organGui.domElement.id = 'gui';
		organGui.close();
		var control = new organsControl();
		var controller = organGui.addColor(control, 'Background');
		controller.onChange(organsBackGroundChanged());
		var customContainer = document.getElementById("organGui").append(organGui.domElement);
		var resetViewButton = { 'Reset View':function(){ organsRenderer.resetView() }};
		var viewAllButton = { 'View All':function(){ organsRenderer.viewAll() }};
		var playButton = { 'Play/Pause':function(){ triggerAnimation() }};
		organGuiControls.Time = 0.0;
		organGuiControls.Speed = 500.0;
		timeSlider = organGui.add(organGuiControls, 'Time', 0.0, 100.0).step(0.1).onChange(timeSliderChanged());
		organGui.add(playButton, 'Play/Pause');
		speedSlider = organGui.add(organGuiControls, 'Speed', 0, 5000).step(50).onChange(speedSliderChanged());
		organGui.add(resetViewButton, 'Reset View');
		organGui.add(viewAllButton, 'View All');
		organPartsGui = organGui.addFolder('Visibility Control');
		organPartsGui.open();
		organsRenderer.animate();
	}
	
	var addUICallback = function() {
		var callbackElement = document.getElementById("organLinkButton");
		callbackElement.onclick = function() { openOrganModelLink() };
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.getElementById(PanelName);
			var childNodes = null;
			if (link.import.body !== undefined)
				childNodes = link.import.body.childNodes;
			else if (link.childNodes !== undefined)
				childNodes = link.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			addUICallback();
			initialiseOrgansVisualisation();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/organsViewer.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}
	
	var getOrganDetails = function(systemName, partName) {
		if (systemName && partName) {
			if (organsFileMap.hasOwnProperty(systemName) && organsFileMap[systemName].hasOwnProperty(partName))
				return organsFileMap[systemName][partName];
		}
		return undefined;
	}
	
	var _addOrganPartCallback = function(systemName, partName, useDefautColour) {
		return function(geometry) {
			if (geometry.groupName) {
				if (!organPartGuiControls.hasOwnProperty(geometry.groupName)) {
					organPartGuiControls[geometry.groupName] = true;
					organPartsGui.add(organPartGuiControls, geometry.groupName).onChange(changeOrganPartsVisibilityCallback(geometry.groupName));
				}
				if (useDefautColour)
					modelsLoader.setGeometryColour(geometry, systemName, partName);
				var organDetails = getOrganDetails(systemName, partName);
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
	
	var resetOrganSpecificGui = function() {
		organPartGuiControls = function() {
		};
		organGui.removeFolder('Visibility Control');
		organPartsGui = organGui.addFolder('Visibility Control');
		organPartsGui.open();
		if (associateData) {
			organPartGuiControls["Data Geometry"] = false;
			organPartsGui.add(organPartGuiControls, "Data Geometry").onChange(changeDataGeometryVisibility("Data Geometry"));
		}
		if (dataFields) {
			organPartGuiControls.Field = -1;
			var fieldPairs = {};
			fieldPairs["None"] = -1
			for ( var i = 0; i < dataFields.length; i ++ ) {
				fieldPairs[dataFields[i].PartName] = i; 
			}
			organGui.add(organPartGuiControls, 'Field', fieldPairs ).onChange(toggleFieldVisibility(dataFields));
		}
	}
	
	this.loadOrgans = function(systemName, partName) {
		if (UIIsReady) {
			if (systemName && partName) {
				var systemMeta = modelsLoader.getSystemMeta();
				var metaItem = systemMeta[systemName][partName];
				var name = systemName + "/" + partName;
				var organsDetails = getOrganDetails(systemName, partName);
				associateData = undefined;
				dataFields = undefined;
				externalOrganLink = undefined;
				if (organsDetails !== undefined){
					if (organsDetails.sceneName !== undefined)
						name = organsDetails.sceneName;
					associateData = organsDetails.associateData;
					if (organsDetails.fields)
						dataFields = organsDetails.fields;
					externalOrganLink = organsDetails.externalLink;
				}
				var button = document.getElementById("organLinkButton");
				if (externalOrganLink) {
					button.style.visibility = "visible";
				} else {
					button.style.visibility = "hidden";
				}
					
				var organScene = organsRenderer.getSceneByName(name);
				if (organScene == undefined) {
					resetOrganSpecificGui();
					organScene = organsRenderer.createScene(name);
					displayScene = organScene;
					var directionalLight = organScene.directionalLight;
					directionalLight.intensity = 1.4;
					if (organsDetails != undefined) {
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
					resetOrganSpecificGui();
					organsRenderer.setCurrentScene(organScene);
					displayScene = organScene;
					var pickerSceneName = name + "_picker_scene";
					pickerScene = organsRenderer.getSceneByName(pickerSceneName);
					displayScene.forEachGeometry(_addOrganPartCallback());
					displayScene.forEachGlyphset(_addOrganPartCallback());
				}
				setOrgansString(name);
				updateTimeSlider();
				updateSpeedSlider();
			}
		} else {
			if (timeoutID == 0)
				timeoutID = setTimeout(loadOrgansTimeputCallback(systemName, partName), 500);
		}
	}
	
	var loadOrgansTimeputCallback = function(systemName, partName) {
		return function () {
			timeoutID = 0;
			_this.loadOrgans(systemName, partName);
		}
	}
	
	var showHideOrgans = function(flag) {
		return function(zincGeometry) {
				zincGeometry.setVisibility(flag);
		}
	}
	
	var showOrgans = function() {
		organsRenderer.setCurrentScene(displayScene);
		if (pickerScene)
			pickerScene.forEachGlyphset(showHideOrgans(true));
	}
	
	var hideOrgans = function() {
		organsRenderer.setCurrentScene(defaultScene);
		if (pickerScene)
			pickerScene.forEachGlyphset(showHideOrgans(false));
	
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

}

