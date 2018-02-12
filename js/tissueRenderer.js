PJP.TissueViewer = function(PanelName)  {

	var textureScene;
	var sceneFirstPass, sceneSecondPass, renderer;
	
	var rtTexture, transferTexture;
	var cubeTextures = ['collagen', 'crop', 'collagen_large', 'crop'];
	var materialFirstPass;
	var materialSecondPass;
	var tissueRenderer;
	var sphere, sphere2, pickerSphere, pickerSphere2;
	var tissueScene;
	var meshFirstPass, meshSecondPass;
	var cellPickerScene;
	var gui;
	var guiControls;
	var constitutiveLawsLink = "https://models.physiomeproject.org/mechanical_constitutive_laws";
	var UIIsReady = false;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var _this = this;
	
	this.setCellPanel = function(CellPanelIn) {
		cellPanel = CellPanelIn;
	}
	
	this.setModelPanel = function(ModelPanelIn) {
		modelPanel = ModelPanelIn;
	}
	
	var showCellTooltip = function(id, x, y) {
		setToolTipText("Cell model " + id);
		tooltipcontainerElement.style.left = x +"px";
		tooltipcontainerElement.style.top = (y - 20) + "px";
		tipElement.style.visibility = "visible";
		tipElement.style.opacity = 1;
		tiptextElement.style.visibility = "visible";
		tiptextElement.style.opacity = 1;
		currentHoverId = id;
	}
	
	var hideCellTooltip = function() {
		tipElement.style.visibility = "hidden";
		tipElement.style.opacity = 0;
		tiptextElement.style.visibility = "hidden";
		tiptextElement.style.opacity = 0;
	}
	
	var openConstitutiveLawsLink = function() {
		window.open(constitutiveLawsLink, '');
	}
	
	var openCellModelUI = function(id) {
		var cellTitle = "<strong>Cell: <span style='color:#FF4444'>" + id + "</span></strong>";
		if (cellPanel) {
			cellPanel.setCellPanelTitle(cellTitle);
			cellPanel.openCell();
		}
		if (modelPanel)
			modelPanel.openModel("Myocyte_v6_Grouped.svg");
	}
	
	var _pickingCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				openCellModelUI("1");
			}
		}	
	};
	
	var _hoverCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined && intersects[0].object !== undefined &&
					(intersects[0].object.geometry instanceof THREE.SphereGeometry)) {
				showCellTooltip(1, window_x, window_y);
				document.getElementById("tissueDisplayArea").style.cursor = "pointer";
			}
			else {
				hideCellTooltip();
				document.getElementById("tissueDisplayArea").style.cursor = "auto";
			}
		}	
	};
	
	
	var changeModels = function(value) {
		materialSecondPass.uniforms.cubeTex.value =  cubeTextures[value];
		if (value.includes('crop')) {
			materialSecondPass.uniforms.black_flip.value = false;
		} else {
			materialSecondPass.uniforms.black_flip.value = true;
		}
		materialSecondPass.uniforms.slides_per_side.value = 16;
	}
	
	var renderFirstPass = function() {
		return function() {
			//Render first pass and store the world space coords of the back face fragments into the texture.
			tissueRenderer.getThreeJSRenderer().render( sceneFirstPass, tissueRenderer.getCurrentScene().camera, rtTexture, true );
		}	
	}
	
	var updateDatGui = function()
	{
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
	}
	
	var updateUniforms = function() {
		materialFirstPass.uniforms.min_x.value = guiControls.min_x;
		materialFirstPass.uniforms.max_x.value = guiControls.max_x;
		materialFirstPass.uniforms.min_y.value = guiControls.min_y;
		materialFirstPass.uniforms.max_y.value = guiControls.max_y;		
		materialFirstPass.uniforms.min_z.value = guiControls.min_z;
		materialFirstPass.uniforms.max_z.value = guiControls.max_z;		
		
		materialSecondPass.uniforms.min_x.value = guiControls.min_x;
		materialSecondPass.uniforms.max_x.value = guiControls.max_x;
		materialSecondPass.uniforms.min_y.value = guiControls.min_y;
		materialSecondPass.uniforms.max_y.value = guiControls.max_y;		
		materialSecondPass.uniforms.min_z.value = guiControls.min_z;
		materialSecondPass.uniforms.max_z.value = guiControls.max_z;		
	}
	
	var resetSlider = function() {
		guiControls.min_x = 0;
		guiControls.max_x = 1.0;
		guiControls.min_y = 0;
		guiControls.max_y = 1.0;
		guiControls.min_z = 0;
		guiControls.max_z = 1.0;
		updateUniforms();
		updateDatGui();	
	}
	
	var changeBoundary = function(name) {
		return function(value) {
			if (name == "min_x")
			{
				if (guiControls.min_x >= guiControls.max_x)
					guiControls.max_x = guiControls.min_x + 0.01;
			}
			if (name == "min_y")
			{
				if (guiControls.min_y >= guiControls.max_y)
					guiControls.max_y = guiControls.min_y + 0.01;
			}
			if (name == "min_z")
			{
				if (guiControls.min_z >= guiControls.max_z)
					guiControls.max_z = guiControls.min_z + 0.01;
			}
			if (name == "max_x")
			{pickerSphere
				if (guiControls.max_x <= guiControls.min_x)
					guiControls.min_x = guiControls.max_x - 0.01;
			}
			if (name == "max_y")
			{
				if (guiControls.max_y <= guiControls.min_y)
					guiControls.min_y = guiControls.max_y - 0.01;
			}
			if (name == "max_z")
			{
				if (guiControls.max_z <= guiControls.min_z)
					guiControls.min_z = guiControls.max_z - 0.01;
			}
			updateUniforms();		
			updateDatGui();
		}	
	}
	
	var volumeRenderBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			var colour = new THREE.Color(backgroundColourString);
			var renderer = tissueRenderer.getThreeJSRenderer();
			renderer.setClearColor( colour, 1 );
		}
	}
	
	
	var volumeRenderStart = function(shaderText) {
	
		guiControls = new function() {
			this.model = 'collagen';
			this.steps = 256.0;
			this.alphaCorrection = 5.0;
			this.min_x = 0.01;
			this.max_x = 0.99;
			this.min_y = 0.01;
			this.max_y = 0.99;
			this.min_z = 0.01;
			this.max_z = 0.99;
			this.Background = [ 255, 255, 255 ]; // RGB array
		};
		
		activated = false;
		
		var container = document.createElement( 'div' );
		document.getElementById("tissueDisplayArea").appendChild( container );
		container.style.height = "100%"
		container.style.backgroundColor = "white";
		tissueRenderer = new Zinc.Renderer(container, window);
		tissueRenderer.initialiseVisualisation();
		tissueRenderer.playAnimation = false;
		
		tissueScene = tissueRenderer.getCurrentScene();
		var renderer = tissueRenderer.getThreeJSRenderer();
		renderer.setClearColor( 0xffffff, 1 );
		var camera = tissueScene.camera;
		camera.near = 0.01;
		camera.far = 3000.0;
		camera.position.z = 3.0;
	
		//Load the 2D texture containing the Z slices.
		cubeTextures['collagen'] = THREE.ImageUtils.loadTexture('textures/collagen.png');
		cubeTextures['crop'] = THREE.ImageUtils.loadTexture('textures/crop.jpg');
		cubeTextures['collagen_large'] = THREE.ImageUtils.loadTexture('textures/collagen_large.png');
		cubeTextures['crop_large'] = THREE.ImageUtils.loadTexture('textures/crop_large.jpg');

		//Don't let it generate mipmaps to save memory and apply linear filtering to prevent use of LOD.
		cubeTextures['collagen'].generateMipmaps = false;
		cubeTextures['collagen'].minFilter = THREE.LinearFilter;
		cubeTextures['collagen'].magFilter = THREE.LinearFilter;
		cubeTextures['collagen'].wrapS = THREE.RepeatWrapping;
		cubeTextures['collagen'].wrapT = THREE.RepeatWrapping;
		
		cubeTextures['crop'].generateMipmaps = false;
		cubeTextures['crop'].minFilter = THREE.LinearFilter;
		cubeTextures['crop'].magFilter = THREE.LinearFilter;
		cubeTextures['crop'].wrapS = THREE.RepeatWrapping;
		cubeTextures['crop'].wrapT = THREE.RepeatWrapping;
		
		cubeTextures['collagen_large'].generateMipmaps = false;
		cubeTextures['collagen_large'].minFilter = THREE.LinearFilter;
		cubeTextures['collagen_large'].magFilter = THREE.LinearFilter;
		cubeTextures['collagen_large'].wrapS = THREE.RepeatWrapping;
		cubeTextures['collagen_large'].wrapT = THREE.RepeatWrapping;
		
		cubeTextures['crop_large'].generateMipmaps = false;
		cubeTextures['crop_large'].minFilter = THREE.LinearFilter;
		cubeTextures['crop_large'].magFilter = THREE.LinearFilter;
		cubeTextures['crop_large'].wrapS = THREE.RepeatWrapping;
		cubeTextures['crop_large'].wrapT = THREE.RepeatWrapping;
	 
	 
		var screenSize = new THREE.Vector2( container.clientWidth, container.clientHeight );
		rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
												{ 	minFilter: THREE.LinearFilter,
													magFilter: THREE.LinearFilter,
													wrapS:  THREE.ClampToEdgeWrapping,
													wrapT:  THREE.ClampToEdgeWrapping,
													format: THREE.RGBFormat,
													generateMipmaps: false} );
	
	
		materialFirstPass = new THREE.ShaderMaterial( {
			vertexShader: shaderText[0],
			fragmentShader: shaderText[1],
			side: THREE.BackSide,
			uniforms: {	min_x : {type: "1f" , value: guiControls.min_x },
				max_x : {type: "1f" , value: guiControls.max_x },
				min_y : {type: "1f" , value: guiControls.min_y },
				max_y : {type: "1f" , value: guiControls.max_y },
				min_z : {type: "1f" , value: guiControls.min_z },
				max_z : {type: "1f" , value: guiControls.max_z }}
		} );
	
		materialSecondPass = new THREE.ShaderMaterial( {
			vertexShader: shaderText[2],
			fragmentShader: shaderText[3],
			transparent: true,
			depthTest: true,
			side: THREE.FrontSide,
			uniforms: {	tex:  { type: "t", value: rtTexture.texture },
						cubeTex:  { type: "t", value: cubeTextures['collagen'] },
						steps : {type: "1f" , value: guiControls.steps },
						alphaCorrection : {type: "1f" , value: guiControls.alphaCorrection },
						min_x : {type: "1f" , value: guiControls.min_x },
						max_x : {type: "1f" , value: guiControls.max_x },
						min_y : {type: "1f" , value: guiControls.min_y },
						max_y : {type: "1f" , value: guiControls.max_y },
						min_z : {type: "1f" , value: guiControls.min_z },
						max_z : {type: "1f" , value: guiControls.max_z },
						slides_per_side : {type: "1f" , value: 16 },
						black_flip : {value: true}}
		 });
	
		sceneFirstPass = new THREE.Scene();
	
		var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
		boxGeometry.doubleSided = true;
	
		meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
		meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );
	
		sceneFirstPass.add( meshFirstPass );
		tissueScene.addObject( meshSecondPass );
		
		
		var geometry = new THREE.SphereGeometry( 0.02, 16, 16 );
		var material = new THREE.MeshPhongMaterial( { color: 0x3920d9, shading: THREE.SmoothShading,  shininess: 0.5 } );
		
		sphere = new THREE.Mesh( geometry, material );
		sphere.position.x = 0.279;
		sphere.position.y = 0.14;
		sphere.position.z = 0.52;
		sphere.visible = false;
		tissueScene.addObject( sphere );
		
		sphere2 = new THREE.Mesh( geometry, material );
		sphere2.position.x = 0.279;
		sphere2.position.y = -0.2;
		sphere2.position.z = 0.32;
		sphere2.visible = false;
		tissueScene.addObject( sphere2 );
	
		cellPickerScene = tissueRenderer.createScene("cell_picker_scene");
		var zincCameraControl = tissueScene.getZincCameraControls();
		zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
		zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
		pickerSphere = new THREE.Mesh( geometry, material );
		pickerSphere.position.x = 0.279;
		pickerSphere.position.y = 0.14;
		pickerSphere.position.z = 0.52;
		pickerSphere.visible = false;
		
		pickerSphere2 = new THREE.Mesh( geometry, material );
		pickerSphere2.position.x = 0.279;
		pickerSphere2.position.y = -0.2;
		pickerSphere2.position.z = 0.32;
		pickerSphere2.visible = false;
		
		cellPickerScene.addObject( pickerSphere );
		cellPickerScene.addObject( pickerSphere2 );
		zincCameraControl.enableRaycaster(cellPickerScene, _pickingCellCallback(), _hoverCellCallback());
		tissueScene.autoClearFlag = false;
		
		gui = new dat.GUI({autoPlace: false});
		gui.domElement.id = 'gui';
		gui.close();
		var customContainer = document.getElementById("tissueGui").append(gui.domElement);
		var controller = gui.addColor(guiControls, 'Background');
		controller.onChange(volumeRenderBackGroundChanged());
		var modelSelected = gui.add(guiControls, 'model', [ 'collagen', 'crop', 'collagen_large', 'crop_large'] );
		var resetSliderButton = { 'Reset':function(){ resetSlider() }};
		gui.add(guiControls, 'min_x', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_x"));
		gui.add(guiControls, 'max_x', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_x"));
		gui.add(guiControls, 'min_y', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_y"));
		gui.add(guiControls, 'max_y', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_y"));
		gui.add(guiControls, 'min_z', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_z"));
		gui.add(guiControls, 'max_z', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_z"));
		gui.add(resetSliderButton,'Reset');
		
		modelSelected.onChange(function(value) {
			changeModels(value);
		} );
		
		resetSlider();
		materialSecondPass.visible = false;
		tissueRenderer.addPreRenderCallbackFunction(renderFirstPass());
		tissueRenderer.animate();
	}
	
	var addUICallback = function() {
		var callbackElement = document.getElementById("cellButton1");
		callbackElement.onclick = function() { openCellModelUI('Cardiac myocyte'); };
		callbackElement = document.getElementById("cellButton2");
		callbackElement.onclick = function() { openCellModelUI('Cardiac fibroblast'); };
		callbackElement = document.getElementById("cellButton3");
		callbackElement.onclick = function() { openConstitutiveLawsLink(); };
	}
	
	var volumeRenderInit = function() {
		loadExternalFiles(['shaders/tissueShaderFirstPass.vs', 'shaders/tissueShaderFirstPass.fs',
		                   'shaders/tissueShaderSecondPass.vs', 'shaders/tissueShaderSecondPass.fs'], 
		                   function (shaderText) {
								volumeRenderStart(shaderText);
							}, function (url) {
							alert('Failed to download "' + url + '"');});
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
			volumeRenderInit();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/tissueViewer.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}
	
	this.setTissueTitleString = function(text) {
	 	var text_display = document.getElementById('TissueTitle');
	 	text_display.innerHTML = text;
	}
	
	this.showButtons = function(flag) {
		if (flag)
			document.getElementById("cellButtonContainer").style.visibility = "visible";
		else
			document.getElementById("cellButtonContainer").style.visibility = "hidden";
	}
	
	this.showCollagenVisible = function(flag) {
		changeModels(guiControls.model);
		materialSecondPass.visible = flag;
		tissueScene.getZincCameraControls().updateDirectionalLight();
		sphere.visible = flag;
		sphere2.visible = flag;
		pickerSphere.visible = flag;
		pickerSphere2.visible = flag;
	}
	
	this.resetTissuePanel = function() {
	 	var text_display = document.getElementById('TissueTitle');
	 	text_display.innerHTML = "<strong>Tissue</strong>";
	 	_this.showCollagenVisible(false);
		_this.showButtons(false);
	}
	
	initialise();
}
