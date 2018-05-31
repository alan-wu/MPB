var dat = require("./dat.gui.js");
require("./styles/dat-gui-swec.css");
require("./styles/my_styles.css");
var THREE = require("three");

/**
 * Used for viewing 3D tissue image stacks, it may include clickable points which
 * may provide additional informations and trigger actions on other panels.
 * 
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.TissueViewer} on.
 * @class
 * 
 * @author Alan Wu
 * @returns {PJP.TissueViewer}
 */
exports.TissueViewer = function(DialogName)  {
	//ZincScene for this renderer.
	var textureScene;
	var sceneFirstPass, renderer;
	
	var rtTexture, transferTexture;
	var cubeTextures = ['collagen', 'crop', 'collagen_large', 'crop'];
	var materialFirstPass;
	var materialSecondPass;
	var tissueRenderer;
	var sphere, sphere2, pickerSphere, pickerSphere2;
	var tissueScene;
	var meshFirstPass, meshSecondPass;
	var cellPickerScene;
	//dat.gui container
	var gui;
	var guiControls;
	// a link to the constitutive laws of the cardiac cells
	var constitutiveLawsLink = "https://models.physiomeproject.org/mechanical_constitutive_laws";
	var UIIsReady = false;
	var cellPanel = undefined;
	var modelPanel = undefined;
  var dialogObject = undefined;
  var localDialogName = DialogName;
  var toolTip = undefined;
	var _this = this;
	
	this.setCellPanel = function(CellPanelIn) {
		cellPanel = CellPanelIn;
	}
	
	this.setModelPanel = function(ModelPanelIn) {
		modelPanel = ModelPanelIn;
	}
	
	var openConstitutiveLawsLink = function() {
		window.open(constitutiveLawsLink, '');
	}
	
	//A cell has been picked, display something on the cell and model panels
	var openCellModelUI = function(id) {
		var cellTitle = "<strong>Cell: <span style='color:#FF4444'>" + id + "</span></strong>";
		if (cellPanel) {
			cellPanel.setCellPanelTitle(cellTitle);
			cellPanel.openCell();
		}
		if (modelPanel)
			modelPanel.openModel("Myocyte_v6_Grouped.svg");
	}
	
	/** 
	 * Callback function when a pickable object has been picked. It will then call functions in cell panel
	 * and model panel to show corresponding informations.
	 * 
	 * @callback
	 */
	var _pickingCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				openCellModelUI("1");
			}
		}	
	};
	
	/**
	 * Callback function when a pickable object has been hovered over. It will show
	 * objecty id/name as tooltip text.
	 */
	var _hoverCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined && intersects[0].object !== undefined &&
					(intersects[0].object.geometry instanceof THREE.SphereGeometry)) {
			  toolTip.setText("Cell model " + 1);
			  toolTip.show(window_x, window_y);
				dialogObject.find("#tissueDisplayArea")[0].style.cursor = "pointer";
			}
			else {
			  toolTip.hide();
				dialogObject.find("#tissueDisplayArea")[0].style.cursor = "auto";
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
	
	//Callback function for rendering the first pass scene
	var renderFirstPass = function() {
		return function() {
			//Render first pass and store the world space coords of the back face fragments into the texture.
			tissueRenderer.getThreeJSRenderer().render( sceneFirstPass, tissueRenderer.getCurrentScene().camera, rtTexture, true );
		}	
	}
	
	//Update dat.gui widget
	var updateDatGui = function()
	{
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
	}
	
	//Update the shader uniforms defining the boundaries 
	var updateBoundaryUniforms = function() {
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
		updateBoundaryUniforms();
		updateDatGui();	
	}
	
	//boundary has been changed from dat.gui, update the values and send to the shaders
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
			updateBoundaryUniforms();		
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
	
	//Set default parameters for texture
	var setDefaultTextureParameters = function(textureName) {
		var texture = cubeTextures[textureName];
		texture.generateMipmaps = false;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
	}
	
	//Setup volume renderer
	var volumeRenderStart = function(shaderText) {
	  toolTip = new (require("./tooltip").ToolTip)(dialogObject);
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
		
		//create the renderer
		var container = document.createElement( 'div' );
		dialogObject.find("#tissueDisplayArea")[0].appendChild( container );
		container.style.height = "100%"
		container.style.backgroundColor = "white";
		tissueRenderer = new (require("zincjs").Renderer)(container, window);
		tissueRenderer.initialiseVisualisation();
		tissueRenderer.playAnimation = false;
		
		//create the scene for visualisations
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
		setDefaultTextureParameters('collagen');
		setDefaultTextureParameters('crop');
		setDefaultTextureParameters('collagen_large');
		setDefaultTextureParameters('crop_large');
	 
		//Create a render target for preprocessing, first pass material and mesh will be render into 
		//rtTexture
		var screenSize = new THREE.Vector2( container.clientWidth, container.clientHeight );
		rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
												{ 	minFilter: THREE.LinearFilter,
													magFilter: THREE.LinearFilter,
													wrapS:  THREE.ClampToEdgeWrapping,
													wrapT:  THREE.ClampToEdgeWrapping,
													format: THREE.RGBFormat,
													generateMipmaps: false} );
	
		//First pass material
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
	
		//Second pass material
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
	
		//First pass scene
		sceneFirstPass = new THREE.Scene();
	
		// Create a new box geometry in which the volume render is located
		var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
		boxGeometry.doubleSided = true;
	
		meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
		meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );
	
		sceneFirstPass.add( meshFirstPass );
		tissueScene.addObject( meshSecondPass );
		
		
		//Create sphere and add it to tissueScene for display
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
	
		//Create sphere and picker scene for object picking
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
		//Disable autoclear
		tissueScene.autoClearFlag = false;
		
		//setup dat.gui
		gui = new dat.GUI({autoPlace: false});
		gui.domElement.id = 'gui';
		gui.close();
		var customContainer = dialogObject.find("#tissueGui")[0].append(gui.domElement);
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
		//add a prerender callback to always render the first pass before the second pass
		tissueRenderer.addPreRenderCallbackFunction(renderFirstPass());
		tissueRenderer.animate();
	}
	
	var addUICallback = function() {
		var callbackElement = dialogObject.find("#cellButton1")[0];
		callbackElement.onclick = function() { openCellModelUI('Cardiac myocyte'); };
		callbackElement = dialogObject.find("#cellButton2")[0];
		callbackElement.onclick = function() { openCellModelUI('Cardiac fibroblast'); };
		callbackElement = dialogObject.find("#cellButton3")[0];
		callbackElement.onclick = function() { openConstitutiveLawsLink(); };
	}
	
	//initialising the loading of the volume renderer
	var volumeRenderInit = function() {
	  var shaderText = [
      require('./shaders/tissueShaderFirstPass.vs'),
      require('./shaders/tissueShaderFirstPass.fs'),
      require('./shaders/tissueShaderSecondPass.vs'),
      require('./shaders/tissueShaderSecondPass.fs')];
	  volumeRenderStart(shaderText);
	  /*
	  require('zincjs').loadExternalFiles([
	    require('./shaders/tissueShaderFirstPass.vs'),
	    require('./shaders/tissueShaderFirstPass.fs'),
	    require('./shaders/tissueShaderSecondPass.vs'),
	    require('./shaders/tissueShaderSecondPass.fs')], 
      function (shaderText) {
	      volumeRenderStart(shaderText);
	    }, function (url) {
        alert('Failed to download "' + url + '"');
      });
      */
	}
	
  var createNewDialog = function(data) {
    dialogObject = require("./utility").createDialogContainer(localDialogName, data);
    addUICallback();
    volumeRenderInit();
    UIIsReady = true;
  }
  
  /**
   * Initialise loading of the page, this is called when 
   * the {@link PJP.TissueViewer} is created.
   * @async
   */
  var initialise = function() {
    createNewDialog(require("./snippets/tissueViewer.html"));
  }
	
	/**
	 * Set the title string for {@link PJP.TissueViewer}.
	 * @param {String} text - Tissue viewer title to be set.
	 */
	this.setTissueTitleString = function(text) {
	  console.log("Fix setOrgansPanelTitle");
	 	//var text_display = document.getElementById('TissueTitle');
	 	//text_display.innerHTML = text;
	}
 
	this.showButtons = function(flag) {
		if (flag)
			dialogObject.find("#cellButtonContainer")[0].style.visibility = "visible";
		else
			dialogObject.find("#cellButtonContainer")[0].style.visibility = "hiddenlink ";
	}
	
	/**
	 * Display the volume rendering
	 */
	this.showCollagenVisible = function(flag) {
		changeModels(guiControls.model);
		materialSecondPass.visible = flag;
		tissueScene.getZincCameraControls().updateDirectionalLight();
		sphere.visible = flag;
		sphere2.visible = flag;
		pickerSphere.visible = flag;
		pickerSphere2.visible = flag;
	}
	
	/**
	 * Reset the panel and hide all displays
	 */
	this.resetTissuePanel = function() {
	 	var text_display = document.getElementById('TissueTitle');
	 	text_display.innerHTML = "<strong>Tissue</strong>";
	 	_this.showCollagenVisible(false);
		_this.showButtons(false);
	}
	
	initialise();
}
