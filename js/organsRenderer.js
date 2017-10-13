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

var organPartsGui;
var organPartGuiControls = function() {
};
var timeSlider = undefined;
var speedSlider = undefined;
var organsControl = function() {
	  this.Background = [ 255, 255, 255 ]; // RGB array
};

var organsFileMap = new Array();

organsFileMap["Cardiovascular"] = new Array();
organsFileMap["Digestive"] = new Array();
organsFileMap["Respiratory"] = new Array();
organsFileMap["Cardiovascular"]["Heart"] = {
		view: "cardiovascular/heart/heart_view.json",
		meta: "cardiovascular/heart/animated_nerve_1.json",
		picker: "cardiovascular/heart/picking_node_1.json",
		associateData: undefined};
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

function getPos(el) {
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

var showTooltip = function(x, y) {
	tooltipcontainerElement.style.left = x +"px";
	tooltipcontainerElement.style.top = (y - 20) + "px";
	tipElement.style.visibility = "visible";
	tipElement.style.opacity = 1;
	tiptextElement.style.visibility = "visible";
	tiptextElement.style.opacity = 1;
}


var hideTooltip = function() {
	currentHoverId = -1;
	tipElement.style.visibility = "hidden";
	tipElement.style.opacity = 0;
	tiptextElement.style.visibility = "hidden";
	tiptextElement.style.opacity = 0;
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
				setTissueTitleString(tissueTitle);
				document.getElementById("cellButtonContainer").style.visibility = "visible";
				showCollagenVisible(true);
			} else if (displayScene.sceneName.includes("Cardiovascular/Arterial")) {
				setToolTipText("Click to show vascular model");
				showTooltip(window_x, window_y);
				resetTissuePanel();
				resetCellPanel();
				openModel("BG_Circulation_Model.svg");
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

function updateOrganPartsVisibilty(name, flag) {
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
				var metaItem = systemMeta[associateData[i].SystemName][associateData[i].PartName];
				var downloadPath = metaItem["BodyURL"];
				console.log(downloadPath);
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
		var blueValue = parseInt(value[2]);Left
		
		var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
		//document.getElementById("mainBody").style.backgroundColor = backgroundColourString;
		var colour = new THREE.Color(backgroundColourString);
		var internalRenderer = organsRenderer.getThreeJSRenderer();
		internalRenderer.setClearColor( colour, 1 );
	}
}


function initialiseOrgansVisualisation() {
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
				setGeometryColour(geometry, systemName, partName);
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
					displayScene.loadMetadataURL(organsDirectoryPrefix + "/" + partDetails.meta);
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

function loadOrgans(systemName, partName) {
	if (systemName && partName) {
		var metaItem = systemMeta[systemName][partName];
		var name = systemName + "/" + partName;
		var organsDetails = getOrganDetails(systemName, partName);
		associateData = undefined;
		dataFields = undefined;
		if (organsDetails !== undefined){
			if (organsDetails.sceneName !== undefined)
				name = organsDetails.sceneName;
			associateData = organsDetails.associateData;
			if (organsDetails.fields)
				dataFields = organsDetails.fields;
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
					organScene.loadViewURL(organsDirectoryPrefix + "/" + organsDetails.view);
				else {
					organScene.loadViewURL(bodyDirectoryPrefix + "/body_view.json");
				}
				organScene.loadMetadataURL(organsDirectoryPrefix + "/" + organsDetails.meta, 
					_addOrganPartCallback(systemName, partName, false));
				var zincCameraControl = organScene.getZincCameraControls();
				if (organsDetails.picker != undefined) {
					var pickerSceneName = name + "_picker_scene";
					pickerScene = organsRenderer.createScene(pickerSceneName);
					pickerScene.loadMetadataURL(organsDirectoryPrefix + "/" + organsDetails.picker);
					zincCameraControl.enableRaycaster(pickerScene, _pickingCallback(), _hoverCallback());
				} else {
					zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
				}
			} else {
				organScene.loadViewURL(bodyDirectoryPrefix + "/body_view.json");
				var downloadPath = metaItem["BodyURL"];
				if (metaItem["FileFormat"] == "JSON") {
					organScene.loadMetadataURL(downloadPath, _addOrganPartCallback(systemName, partName, false));
				}
				else if (metaItem["FileFormat"] == "STL")
					organScene.loadSTL(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
				else if (metaItem["FileFormat"] == "OBJ") 
					organScene.loadOBJ(downloadPath, partName, _addOrganPartCallback(systemName, partName, true));
				organsRenderer.setCurrentScene(organScene);
				var zincCameraControl = organScene.getZincCameraControls();
				zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
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
}

function showHideOrgans(flag) {
	return function(zincGeometry) {
			zincGeometry.setVisibility(flag);
	}
}

function showOrgans() {
	organsRenderer.setCurrentScene(displayScene);
	if (pickerScene)
		pickerScene.forEachGlyphset(showHideOrgans(true));
}

function hideOrgans() {
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

function resetView()
{
	organsRenderer.resetView();
}

function viewAll()
{
	organsRenderer.viewAll();
}
