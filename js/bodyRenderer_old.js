var bodyScene = undefined;
var modelsTransformationMap = new Array();
var bodyGui;
var bodyPartsGui;
var currentHoveredMaterial = undefined;
var currentSelectedMaterial = undefined;
var systemGuiFolder = new Array();
var nameGeometryMap = new Array();
systemGuiFolder["Musculo-skeletal"] = undefined;
systemGuiFolder["Cardiovascular"] = undefined;
systemGuiFolder["Respiratory"] = undefined;
systemGuiFolder["Digestive"] = undefined;
systemGuiFolder["Skin (integument)"] = undefined;
systemGuiFolder["Urinary"] = undefined;
systemGuiFolder["Brain & central nervous"] = undefined;
systemGuiFolder["Lymphoid"] = undefined;
systemGuiFolder["Endocrine"] = undefined;
systemGuiFolder["Female reproductive"] = undefined;
systemGuiFolder["Male reproductive"] = undefined;
systemGuiFolder["Special sense organs"] = undefined;

var systemPartsGuiControls = new Array();
systemPartsGuiControls["Musculo-skeletal"] = function() {};
systemPartsGuiControls["Cardiovascular"] = function() {};
systemPartsGuiControls["Respiratory"] = function() {};
systemPartsGuiControls["Digestive"] = function() {};
systemPartsGuiControls["Skin (integument)"] = function() {};
systemPartsGuiControls["Urinary"] = function() {};
systemPartsGuiControls["Brain & central nervous"] = function() {};
systemPartsGuiControls["Lymphoid"] = function() {};
systemPartsGuiControls["Endocrine"] = function() {};
systemPartsGuiControls["Female reproductive"] = function() {};
systemPartsGuiControls["Male reproductive"] = function() {};
systemPartsGuiControls["Special sense organs"] = function() {};

var transformationMatrix = new THREE.Matrix4();
transformationMatrix.set(0.493844, -0.823957, 0.277871, 30,
									  0.0782172, 0.6760355, 0.92953, -130,
									  -0.866025, -0.437309, 0.242407, 1227,
									  0, 0, 0, 1);
modelsTransformationMap["heart"] = {
		transformation: transformationMatrix,
		folder: "cardiovascular",
		system: "Cardiovascular"};

transformationMatrix = new THREE.Matrix4();
transformationMatrix.set(120, 0, 0, 0,
									0, 120, 0, -110,
									0, 0, 120, 1230,
									0, 0, 0, 1);
modelsTransformationMap["lungs"] = {
		transformation: transformationMatrix,
		folder: "respiratory",
		system: "Respiratory"};

modelsTransformationMap["heart_vascular"] = {
		folder: "cardiovascular",
		system: "Cardiovascular"};

modelsTransformationMap["body"]  = {
		folder: "skin",
		system: "Skin (integument)"};

modelsTransformationMap["left_clavicle"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_femur"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_fibula"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};

modelsTransformationMap["left_foot"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_hand"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_hip"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_humerus"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_kidney"] = {
		folder: "urinary",
		system: "Urinary"};
modelsTransformationMap["left_radius"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_tibia"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_lowerlimb_muscles"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_upperlimb_muscles"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["left_ulna"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};

modelsTransformationMap["right_clavicle"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_femur"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_fibula"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_foot"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_hand"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_hip"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_humerus"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_kidney"] = {
		folder: "urinary",
		system: "Urinary"};
modelsTransformationMap["right_radius"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};
modelsTransformationMap["right_tibia"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};

modelsTransformationMap["spine"] = {
		folder: "musculo",
		system: "Musculo-skeletal"};



var showBodyTooltip = function(name, x, y) {
	tiptextElement.innerHTML = name;
	tooltipcontainerElement.style.left = x +"px";
	tooltipcontainerElement.style.top = (y - 20) + "px";
	tipElement.style.visibility = "visible";
	tipElement.style.opacity = 1;
	tiptextElement.style.visibility = "visible";
	tiptextElement.style.opacity = 1;
}

var hideBodyTooltip = function() {
	tipElement.style.visibility = "hidden";
	tipElement.style.opacity = 0;
	tiptextElement.style.visibility = "hidden";
	tiptextElement.style.opacity = 0;
}


var _pickingBodyCallback = function() {
	return function(intersects, window_x, window_y) {
		var bodyClicked = false;
		for (var i = 0; i < intersects.length; i++) {
			if (intersects[i] !== undefined && (intersects[ i ].object.name !== undefined)) {
				if (!intersects[ i ].object.name.includes("Body")) {
					loadOrgans(intersects[ i ].object.name);
					if (currentSelectedMaterial && currentSelectedMaterial != intersects[ i ].object.material) {
						if (currentSelectedMaterial == currentHoveredMaterial)
							currentSelectedMaterial.emissive.setHex(0x0000FF);
						else
							currentSelectedMaterial.emissive.setHex(0x000000);
					}
					currentSelectedMaterial = intersects[ i ].object.material;
					currentSelectedMaterial.emissive.setHex(0x00FF00);
					return;
				} else {
					bodyClicked = true;
				}
			}
		}
		if (bodyClicked) {
			loadOrgans("Body");
		}
	}	
};

var _hoverBodyCallback = function() {
	return function(intersects, window_x, window_y) {
		var bodyHovered = false;
		for (var i = 0; i < intersects.length; i++) {
			if (intersects[i] !== undefined && (intersects[ i ].object.name !== undefined)) {
				if (!intersects[ i ].object.name.includes("Body")) {
					document.getElementById("bodyDisplayArea").style.cursor = "pointer";
					showBodyTooltip(intersects[ i ].object.name, window_x, window_y);
					if (currentHoveredMaterial &&
					  intersects[ i ].object.material != currentHoveredMaterial && currentHoveredMaterial != currentSelectedMaterial) {
						currentHoveredMaterial.emissive.setHex(0x000000);
					}
					if (intersects[ i ].object.material != currentSelectedMaterial) {
						currentHoveredMaterial = intersects[ i ].object.material;
						currentHoveredMaterial.emissive.setHex(0x0000FF);
					} else {
						currentHoveredMaterial = undefined;
					}
					return;
				} else {
					bodyHovered = true;
				}
			}
		}
		if (currentHoveredMaterial && currentHoveredMaterial != currentSelectedMaterial)
			currentHoveredMaterial.emissive.setHex(0x000000);
		currentHoveredMaterial = undefined;
		if (bodyHovered) {
			document.getElementById("bodyDisplayArea").style.cursor = "pointer";
			showBodyTooltip("Body", window_x, window_y);
		} else {
			hideTooltip();
			document.getElementById("bodyDisplayArea").style.cursor = "auto";
		}
		
	}
};

function updateBodyPartsVisibilty(name, flag) {
	return function(zincGeometry) {
		if (zincGeometry.groupName && zincGeometry.groupName == name) {
			zincGeometry.setVisibility(flag);
		}
	}
}
	

var changeBodyPartsVisibility = function(name, systemName) {
	return function(value) { 
		if (nameGeometryMap.hasOwnProperty(name)) {
			nameGeometryMap[name].setVisibility(value);
		}
		if (value == false) {
			systemPartsGuiControls[systemName].All = false;
		} else {
			for (var partName in systemPartsGuiControls[systemName]) {
				if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
					if (systemPartsGuiControls[systemName][partName] == false)
						return;
				}
			}
			systemPartsGuiControls[systemName].All = true;
		}
		for (var i = 0; i < systemGuiFolder[systemName].__controllers.length; i++) {
			if (systemGuiFolder[systemName].__controllers[i].property == "All") {
				systemGuiFolder[systemName].__controllers[i].updateDisplay();
				systemGuiFolder[systemName].__controllers[i].__prev = 
					systemGuiFolder[systemName].__controllers[i].__checkbox.checked;
				return;
			}
		}
	}
}

var toggleSystem = function(systemName) {
	return function(value) { 
		for (var partName in systemPartsGuiControls[systemName]) {
			if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
				if (systemPartsGuiControls[systemName][partName] != value) {
					if (nameGeometryMap.hasOwnProperty(partName)) {
						systemPartsGuiControls[systemName][partName] = value;
						nameGeometryMap[partName].setVisibility(value);
					}
				}
			}
		}
		for (var i = 0; i < systemGuiFolder[systemName].__controllers.length; i++) {
			if (systemGuiFolder[systemName].__controllers[i].property != "All") {
				systemGuiFolder[systemName].__controllers[i].updateDisplay();
				systemGuiFolder[systemName].__controllers[i].__prev = 
					systemGuiFolder[systemName].__controllers[i].__checkbox.checked;
			}
		}
	}
}

var _addSystemPartGuiControl = function(key, geometry) {
	if (geometry.groupName && modelsTransformationMap.hasOwnProperty(key) &&
			modelsTransformationMap[key].system !== undefined) {
		var systemName = modelsTransformationMap[key].system;
		if (systemGuiFolder[systemName] !== undefined &&
			systemPartsGuiControls.hasOwnProperty(systemName)) {
			if (!systemGuiFolder[systemName].hasOwnProperty(geometry.groupName)) {
				systemPartsGuiControls[systemName][geometry.groupName] = true;
				systemGuiFolder[systemName].add(systemPartsGuiControls[systemName], geometry.groupName).onChange(changeBodyPartsVisibility(geometry.groupName, systemName));
				nameGeometryMap[geometry.groupName] = geometry;
			}
		}
	}
}

var _transformBodyPart = function(key, geometry) {
	if (modelsTransformationMap.hasOwnProperty(key) &&
			modelsTransformationMap[key].transformation !== undefined)
		geometry.morph.applyMatrix (modelsTransformationMap[key].transformation);
};

var _addBodyPartCallback = function(key) {
	return function(geometry) {
		_transformBodyPart(key, geometry);
		_addSystemPartGuiControl(key, geometry);
	}	
};

var addSystemFolder = function() {
	for (var key in systemGuiFolder) {
		if (systemGuiFolder.hasOwnProperty(key) && systemPartsGuiControls.hasOwnProperty(key)) {
			systemGuiFolder[key] = bodyGui.addFolder(key);
			systemGuiFolder[key].close();
			systemPartsGuiControls[key]["All"] = true;
			systemGuiFolder[key].add(systemPartsGuiControls[key], "All").onChange(toggleSystem(key));
		}
	}
}

function loadBody() {
	bodyGui = new dat.GUI({autoPlace: false});
	bodyGui.domElement.id = 'gui';
	bodyGui.close();
	addSystemFolder();
	var customContainer = document.getElementById("bodyGui").append(bodyGui.domElement);
	var resetViewButton = { 'Reset View':function(){ bodyRenderer.resetView() }};
	var scene = bodyRenderer.getCurrentScene();
	scene.loadViewURL("body/body_view.json");
	bodyScene=scene;
	var directionalLight = scene.directionalLight;
	directionalLight.intensity = 1.4;
	for (var key in modelsTransformationMap) {
		var folderName = modelsTransformationMap[key].folder;
		if (modelsTransformationMap.hasOwnProperty(key)) {
			var fileName = "body/" + folderName + "/" + key + "_1.json";
			scene.loadMetadataURL(fileName, _addBodyPartCallback(key));
		}
	}
	
	var zincCameraControl = scene.getZincCameraControls();
	zincCameraControl.enableRaycaster(scene, _pickingBodyCallback(), _hoverBodyCallback());	

	bodyGui.add(resetViewButton, 'Reset View');
}					
