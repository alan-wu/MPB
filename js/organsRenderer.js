var pickerScene = undefined;
var displayScene = undefined;
var defaultScene = undefined;
var windowWidth, windowHeight;
var organGui;
var organGuiControls = new function() {
	this.Time = 0.1;
};
var organPartsGui;
var organPartGuiControls = function() {
};
var timeSlider = undefined;

var organsControl = function() {
	  this.Background = [ 255, 255, 255 ]; // RGB array
};


var organsFileMap = new Array();

organsFileMap["Cardiovascular"] = new Array();
organsFileMap["Respiratory"] = new Array();
organsFileMap["Cardiovascular"]["Heart"] = {
		view: "cardiovascular/heart/heart_view.json",
		meta: "cardiovascular/heart/animated_nerve_1.json",
		picker: "cardiovascular/heart/picking_node_1.json"};
organsFileMap["Cardiovascular"]["Aorta"] = {
		view: undefined,
		meta: "cardiovascular/arteries/arteries_1.json",
		picker: undefined,
		sceneName: "Cardiovascular/Arterial System",
		data: [{SystemName: "Cardiovascular", PartName: "Aorta"},
		       {SystemName: "Cardiovascular", PartName: "Left Upper Limb"},
		       {SystemName: "Cardiovascular", PartName: "Left Lower Limb"},
		       {SystemName: "Cardiovascular", PartName: "Right Upper Limb"},
		       {SystemName: "Cardiovascular", PartName: "Right Lower Limb"}]};
organsFileMap["Cardiovascular"]["Left Upper Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
organsFileMap["Cardiovascular"]["Left Lower Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
organsFileMap["Cardiovascular"]["Right Upper Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
organsFileMap["Cardiovascular"]["Right Lower Limb"] = organsFileMap["Cardiovascular"]["Aorta"];
organsFileMap["Respiratory"]["Lungs"] = {
		view: "respiratory/lungs_view.json",
		meta: "respiratory/lungs_1.json",
		picker: undefined};

function getPos(el) {
    for (var lx=0, ly=0;
		el != null;
		lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x: lx,y: ly};
}

var sliderChanged = function() {
	return function(value) {
		if (pickerScene)
			pickerScene.setMorphsTime(value * 30);
		if (displayScene)
			displayScene.setMorphsTime(value * 30);
	}
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
			} else if (displayScene.sceneName.includes("Cardiovascular/")) {
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

var changeOrganPartsVisibility = function(name) {
	return function(value) {
		displayScene.forEachGeometry(updateOrganPartsVisibilty(name, value));
		displayScene.forEachGlyphset(updateOrganPartsVisibilty(name, value));Left
		if (pickerScene) {
			pickerScene.forEachGeometry(updateOrganPartsVisibilty(name, value))
			pickerScene.forEachGlyphset(updateOrganPartsVisibilty(name, value));
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
		var internalRenderer = zincRenderer.getThreeJSRenderer();
		internalRenderer.setClearColor( colour, 1 );
	}
}


function initialiseOrgansVisualisation() {
	defaultScene = zincRenderer.getCurrentScene();
	organGui = new dat.GUI({autoPlace: false});
	organGui.domElement.id = 'gui';
	organGui.close();
	var control = new organsControl();
	var controller = organGui.addColor(control, 'Background');
	controller.onChange(organsBackGroundChanged());
	var customContainer = document.getElementById("organGui").append(organGui.domElement);
	var resetViewButton = { 'Reset View':function(){ zincRenderer.resetView() }};
	var playButton = { 'Play/Pause':function(){ triggerAnimation() }};
	timeSlider = organGui.add(organGuiControls, 'Time', 0.0, 100.0).step(0.1).onChange(sliderChanged());
	organGuiControls.Time = 0.0;
	organGui.add(resetViewButton, 'Reset View');
	organGui.add(playButton, 'Play/Pause');
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
				organPartsGui.add(organPartGuiControls, geometry.groupName).onChange(changeOrganPartsVisibility(geometry.groupName));
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

var resetOrganSpecificGui = function() {
	organPartGuiControls = function() {
	};
	organGui.removeFolder('Visibility Control');
	organPartsGui = organGui.addFolder('Visibility Control');
	organPartsGui.open();
}

function loadOrgans(systemName, partName) {
	if (systemName && partName) {
		var metaItem = systemMeta[systemName][partName];
		var name = systemName + "/" + partName;
		var organsDetails = getOrganDetails(systemName, partName);
		if (organsDetails !== undefined && organsDetails.sceneName !== undefined)
			name = organsDetails.sceneName;
		var organScene = zincRenderer.getSceneByName(name);
		if (organScene == undefined) {
			resetOrganSpecificGui();
			organScene = zincRenderer.createScene(name);
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
				if (organsDetails.picker != undefined) {
					var pickerSceneName = name + "_picker_scene";
					pickerScene = zincRenderer.createScene(pickerSceneName);
					pickerScene.loadMetadataURL(organsDirectoryPrefix + "/" + organsDetails.picker);
					var zincCameraControl = organScene.getZincCameraControls();
					zincCameraControl.enableRaycaster(pickerScene, _pickingCallback(), _hoverCallback());
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
				zincRenderer.setCurrentScene(organScene);
				var zincCameraControl = organScene.getZincCameraControls();
				zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
			}
			var directionalLight = organScene.directionalLight;
			directionalLight.intensity = 1.4;
			zincRenderer.setCurrentScene(organScene);
		} else if (displayScene != organScene){
			resetOrganSpecificGui();
			zincRenderer.setCurrentScene(organScene);
			displayScene = organScene;
			var pickerSceneName = name + "_picker_scene";
			pickerScene = zincRenderer.getSceneByName(pickerSceneName);
			displayScene.forEachGeometry(_addOrganPartCallback());
			displayScene.forEachGlyphset(_addOrganPartCallback());
		}
		setOrgansString(name);
	}
}

function showHideOrgans(flag) {
	return function(zincGeometry) {
			zincGeometry.setVisibility(flag);
	}
}

function showOrgans() {
	zincRenderer.setCurrentScene(displayScene);
	if (pickerScene)
		pickerScene.forEachGlyphset(showHideOrgans(true));
}

function hideOrgans() {
	zincRenderer.setCurrentScene(defaultScene);
	if (pickerScene)
		pickerScene.forEachGlyphset(showHideOrgans(false));

}

var triggerAnimation = function() {
	if (zincRenderer.playAnimation == true) {
		zincRenderer.playAnimation = false;
	} else {
		zincRenderer.playAnimation = true;	
	}
}

function resetView()
{
	zincRenderer.resetView();
}

function viewAll()
{
	zincRenderer.viewAll();
}


var updateTimeSlider = function() {
	return function() {
		if (zincRenderer.playAnimation == true)	{
			var currentTime = zincRenderer.getCurrentTime();
			var sliderValue = currentTime / 30.0;
			organGuiControls.Time = sliderValue;
			if (pickerScene)
				pickerScene.setMorphsTime(currentTime);
			timeSlider.updateDisplay();
		}
	}	
}