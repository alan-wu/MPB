PJP.BodyViewer = function(PanelName)  {

	var bodyScene = undefined;
	var modelsTransformationMap = new Array();
	var bodyGui;
	var bodyPartsGui;
	var currentHoveredMaterial = undefined;
	var currentSelectedMaterial = undefined;
	var systemGuiFolder = new Array();
	var remvoeWhenNotVisibile = false;
	var UIIsReady = false;
	
	systemGuiFolder["Musculo-skeletal"] = undefined;
	systemGuiFolder["Cardiovascular"] = undefined;
	systemGuiFolder["Respiratory"] = undefined;
	systemGuiFolder["Digestive"] = undefined;
	systemGuiFolder["Skin (integument)"] = undefined;
	systemGuiFolder["Urinary"] = undefined;
	systemGuiFolder["Brain & Central Nervous"] = undefined;
	systemGuiFolder["Immunological"] = undefined;
	systemGuiFolder["Endocrine"] = undefined;
	systemGuiFolder["Female Reproductive"] = undefined;
	systemGuiFolder["Male Reproductive"] = undefined;
	systemGuiFolder["Special sense organs"] = undefined;
	
	var systemPartsGuiControls = new Array();
	systemPartsGuiControls["Musculo-skeletal"] = function() {};
	systemPartsGuiControls["Cardiovascular"] = function() {};
	systemPartsGuiControls["Respiratory"] = function() {};
	systemPartsGuiControls["Digestive"] = function() {};
	systemPartsGuiControls["Skin (integument)"] = function() {};
	systemPartsGuiControls["Urinary"] = function() {};
	systemPartsGuiControls["Brain & Central Nervous"] = function() {};
	systemPartsGuiControls["Immunological"] = function() {};
	systemPartsGuiControls["Endocrine"] = function() {};
	systemPartsGuiControls["Female Reproductive"] = function() {};
	systemPartsGuiControls["Male Reproductive"] = function() {};
	systemPartsGuiControls["Special sense organs"] = function() {};
	
	var bodyControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	
	var _this = this;
	
	var bodyRenderer = null;
	
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
						organsViewer.loadOrgans(intersects[ i ].object.userData[0], intersects[ i ].object.name);
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
				organsViewer.loadOrgans("Skin (integument)", "Body");
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
							currentHoveredMaterial.depthFunc = THREE.LessEqualDepth;
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
			if (currentHoveredMaterial && currentHoveredMaterial != currentSelectedMaterial) {
				currentHoveredMaterial.emissive.setHex(0x000000);
			}
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
	
	var removeGeometry = function(systemName, name) {
		if (remvoeWhenNotVisibile) {
			var systemMeta = modelsLoader.getSystemMeta();
			if (systemMeta[systemName].hasOwnProperty(name) && systemMeta[systemName][name].geometry) {
				bodyScene.removeZincGeometry(systemMeta[systemName][name].geometry);
				systemMeta[systemName][name]["loaded"] = PJP.ITEM_LOADED.FALSE;
				systemMeta[systemName][name].geometry = undefined;
			}
			
		}
	}
	
	var changeBodyPartsVisibility = function(name, systemName) {
		return function(value) { 
			var systemMeta = modelsLoader.getSystemMeta();
			if (systemMeta[systemName].hasOwnProperty(name) && systemMeta[systemName][name].geometry) {
				systemMeta[systemName][name].geometry.setVisibility(value);
			}
			var isPartial = false;
			if (value == false) {
				removeGeometry(systemName, name);
				systemPartsGuiControls[systemName].All = false;
				for (var partName in systemPartsGuiControls[systemName]) {
					if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
						if (systemPartsGuiControls[systemName][partName] == true) {
							isPartial = true;
							break;
						}
					}
				}
				updateSystemButtons(systemName, false, isPartial);
			} else {
				readModel(systemName, name, false);
				for (var partName in systemPartsGuiControls[systemName]) {
					if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
						if (systemPartsGuiControls[systemName][partName] == false) {
							updateSystemButtons(systemName, false, true);
							return;
						}
					}
				}
				systemPartsGuiControls[systemName].All = true;
			}
			updateSystemButtons(systemName, systemPartsGuiControls[systemName].All, isPartial);
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
	
	var updateSystemButtons = function(systemName, value, isPartial) {
		var element = document.getElementById(systemName);
		if (value == true)
			element.className = "w3-circle systemToggleButton systemToggleButtonOn";
		else {
			if (isPartial)
				element.className = "w3-circle systemToggleButton systemToggleButtonPartial";
			else
				element.className = "w3-circle systemToggleButton systemToggleButtonOff";
		}
	}
	
	var toggleSystem = function(systemName, value) {
		systemPartsGuiControls[systemName]["All"] = value;
		for (var partName in systemPartsGuiControls[systemName]) {
			if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
				if (systemPartsGuiControls[systemName][partName] != value) {
					var systemMeta = modelsLoader.getSystemMeta();
					if (systemMeta[systemName].hasOwnProperty(partName)) {
						systemPartsGuiControls[systemName][partName] = value;
						if (systemMeta[systemName][partName].geometry) {
							systemMeta[systemName][partName].geometry.setVisibility(value);
							removeGeometry(systemName, partName);
						}
						if (value == true) {
							readModel(systemName, partName, false);
						}
					}
				}
			}
		}
		for (var i = 0; i < systemGuiFolder[systemName].__controllers.length; i++) {
			systemGuiFolder[systemName].__controllers[i].updateDisplay();
			systemGuiFolder[systemName].__controllers[i].__prev = 
				systemGuiFolder[systemName].__controllers[i].__checkbox.checked;
		}
		updateSystemButtons(systemName, value, false);
	}
	
	var toggleSystemCallback = function(systemName) {
		return function(value) { 
			toggleSystem(systemName, value);
		}
	}
	
	var _addSystemPartGuiControl = function(systemName, partName, item, geometry, visible) {
		if (systemName) {
			if (systemGuiFolder[systemName] !== undefined &&
				systemPartsGuiControls.hasOwnProperty(systemName)) {
				if (!systemGuiFolder[systemName].hasOwnProperty(partName)) {
					systemPartsGuiControls[systemName][partName] = visible;
					systemGuiFolder[systemName].add(systemPartsGuiControls[systemName], partName).onChange(changeBodyPartsVisibility(partName, systemName));
					if (visible == true) {
						for (var partName in systemPartsGuiControls[systemName]) {
							if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
								if (systemPartsGuiControls[systemName][partName] == false) {
									updateSystemButtons(systemName, false, true);
									return;
								}
							}
						}
						systemPartsGuiControls[systemName].All = true;
						updateSystemButtons(systemName, true, false);
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
			}
		}
	}
	
	this.systemButtonPress = function(receivedElement) {
		var systemName = receivedElement.id;
		toggleSystem(systemName, !(systemPartsGuiControls[systemName]["All"]));
	}
	
	var _transformBodyPart = function(key, geometry) {
		if (modelsTransformationMap.hasOwnProperty(key) &&
				modelsTransformationMap[key].transformation !== undefined)
			geometry.morph.applyMatrix (modelsTransformationMap[key].transformation);
	};
	
	var _addBodyPartCallback = function(systemName, partName, item, scaling, useDefautColour, startup) {
		return function(geometry) {
			//_transformBodyPart(key, geometry);
			item["loaded"] = PJP.ITEM_LOADED.TRUE;
			item.geometry = geometry;
			if (startup)
				_addSystemPartGuiControl(systemName, partName, item, geometry, (item["loaded"] ==  PJP.ITEM_LOADED.TRUE));
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
	
	var addSystemFolder = function() {
		for (var key in systemGuiFolder) {
			if (systemGuiFolder.hasOwnProperty(key) && systemPartsGuiControls.hasOwnProperty(key)) {
				systemGuiFolder[key] = bodyGui.addFolder(key);
				systemGuiFolder[key].close();
				systemPartsGuiControls[key]["All"] = false;
				systemGuiFolder[key].add(systemPartsGuiControls[key], "All").onChange(toggleSystemCallback(key));
			}
		}
	}
	
	var bodyBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			//document.getElementById("mainBody").style.backgroundColor = backgroundColourString;
			var colour = new THREE.Color(backgroundColourString);
			var internalRenderer = bodyRenderer.getThreeJSRenderer();
			internalRenderer.setClearColor( colour, 1 );
		}
	}
	
	
	var initialiseBodyPanel = function() {
		bodyRenderer = PJP.setupRenderer("bodyDisplayArea");
		bodyGui = new dat.GUI({autoPlace: false});
		bodyGui.domElement.id = 'gui';
		var control = new bodyControl();
		var controller = bodyGui.addColor(control, 'Background');
		controller.onChange(bodyBackGroundChanged());
		bodyGui.close();
		addSystemFolder();
		var customContainer = document.getElementById("bodyGui").append(bodyGui.domElement);
		var resetViewButton = { 'Reset View':function(){ bodyRenderer.resetView() }};
		var scene = bodyRenderer.getCurrentScene();
		scene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
		bodyScene=scene;
		var directionalLight = scene.directionalLight;
		directionalLight.intensity = 1.4;
		var zincCameraControl = scene.getZincCameraControls();
		zincCameraControl.enableRaycaster(scene, _pickingBodyCallback(), _hoverBodyCallback());
		zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
		zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
	
		bodyGui.add(resetViewButton, 'Reset View');
		bodyRenderer.animate();
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.getElementById(PanelName);
			var childNodes = link.import.body.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			initialiseBodyPanel();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/bodyViewer.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);
	}
	
	var readModel = function(systemName, partName, startup) {
		var systemMeta = modelsLoader.getSystemMeta();
		item = systemMeta[systemName][partName];
		if (item["loaded"] ==  PJP.ITEM_LOADED.FALSE) {
			var downloadPath = item["BodyURL"];
			var scaling = false;
			item["loaded"] =  PJP.ITEM_LOADED.DOWNLOADING;
			if (item["FileFormat"] == "JSON") {
				if (systemName == "Musculo-skeletal" || systemName == "Skin (integument)")
					scaling = true;
				bodyScene.loadMetadataURL(downloadPath, _addBodyPartCallback(systemName, partName, item, scaling, false, startup));
			}
			else if (item["FileFormat"] == "STL")
				bodyScene.loadSTL(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
			else if (item["FileFormat"] == "OBJ") 
				bodyScene.loadOBJ(downloadPath, partName, _addBodyPartCallback(systemName, partName, item, scaling, true, startup));
		}
	}
	
	
	var readBodyRenderModel = function(systemName, partMap) {
		for (var partName in partMap) {
			if (partMap.hasOwnProperty(partName)) {
				var item = partMap[partName]; toggleSystem
				item["loaded"] =  PJP.ITEM_LOADED.FALSE;
				if (item["loadAtStartup"] == true) {
					readModel(systemName, partName, true);
				} else {
					_addSystemPartGuiControl(systemName, partName, item, undefined, false);
				}
			}
		}
		
	}
	
	this.readSystemMeta = function() {
		if (UIIsReady) {
			var systemMeta = modelsLoader.getSystemMeta();
			for (var systemItem  in systemMeta) {
				readBodyRenderModel(systemItem, systemMeta[systemItem]);	
			}
		} else {
			setTimeout(function(){ _this.readSystemMeta(); }, 500);
		}
	}
	
	initialise();

}

