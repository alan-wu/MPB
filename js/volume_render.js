var textureScene;
var sceneFirstPass, sceneSecondPass, renderer;

var rtTexture, transferTexture;
var cubeTextures = ['collagen', 'crop', 'collagen_large', 'crop'];
var materialFirstPass;
var materialSecondPass;
var myRenderer, renderer;
var sphere, sphere2, pickerSphere, pickerSphere2;
var volumeScene;
var meshFirstPass, meshSecondPass;
var cellPickerScene;
var gui;

var showCellTooltip = function(id, x, y) {
	tiptextElement.innerHTML = "Cell model " + id;
	var pos = getPos(document.getElementById("displayPort"));
	tooltipcontainerElement.style.left = x - pos.x +"px";
	tooltipcontainerElement.style.top = (y - 20) - pos.y + "px";
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


var _pickingCellCallback = function() {
	return function(intersects, window_x, window_y) {
		if (intersects[0] !== undefined) {
			cellDialog.show();
		}
	}	
};

var _hoverCellCallback = function() {
	return function(intersects, window_x, window_y) {
		if (intersects[0] !== undefined && intersects[0].object !== undefined &&
				(intersects[0].object.geometry instanceof THREE.SphereGeometry)) {
			showCellTooltip(1, window_x, window_y);
			document.getElementById("tissueDisplayPort").style.cursor = "pointer";
		}
		else {
			hideCellTooltip();
			document.getElementById("tissueDisplayPort").style.cursor = "auto";
		}
	}	
};

function changeModels(value) {
	materialSecondPass.uniforms.cubeTex.value =  cubeTextures[value];
	if (value.includes('crop')) {
		materialSecondPass.uniforms.black_flip.value = false;
		myRenderer.getThreeJSRenderer().setClearColor( 0x000000, 1 );
	} else {
		materialSecondPass.uniforms.black_flip.value = true;
		myRenderer.getThreeJSRenderer().setClearColor( 0xffffff, 1 );
	}
}


var renderFirstPass = function() {
	return function() {
		//Render first pass and store the world space coords of the back face fragments into the texture.
		myRenderer.getThreeJSRenderer().render( sceneFirstPass, myRenderer.getCurrentScene().camera, rtTexture, true );
	}	
}

function updateDatGui()
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


function volumeRenderInit() {

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
	};
	
	activated = false;
	
	container = document.createElement( 'div' );
	document.getElementById("tissueDisplayPort").appendChild( container );
	container.style.height = "100%"
	container.style.backgroundColor = "white";
	myRenderer = new Zinc.Renderer(container, window);
	myRenderer.initialiseVisualisation();
	myRenderer.playAnimation = false;
	
	volumeScene = myRenderer.getCurrentScene();
	var renderer = myRenderer.getThreeJSRenderer();
	renderer.setClearColor( 0xffffff, 1 );
	var camera = volumeScene.camera;
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
		vertexShader: document.getElementById( 'vertexShaderFirstPass' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderFirstPass' ).textContent,
		side: THREE.BackSide,
		uniforms: {	min_x : {type: "1f" , value: guiControls.min_x },
			max_x : {type: "1f" , value: guiControls.max_x },
			min_y : {type: "1f" , value: guiControls.min_y },
			max_y : {type: "1f" , value: guiControls.max_y },
			min_z : {type: "1f" , value: guiControls.min_z },
			max_z : {type: "1f" , value: guiControls.max_z }}
	} );

	materialSecondPass = new THREE.ShaderMaterial( {
		vertexShader: document.getElementById( 'vertexShaderSecondPass' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderSecondPass' ).textContent,
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
					black_flip : {value: true}}
	 });

	sceneFirstPass = new THREE.Scene();

	var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
	boxGeometry.doubleSided = true;

	meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
	meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );

	sceneFirstPass.add( meshFirstPass );
	volumeScene.addObject( meshSecondPass );
	
	
	var geometry = new THREE.SphereGeometry( 0.02, 16, 16 );
	var material = new THREE.MeshPhongMaterial( { color: 0x3920d9, shading: THREE.SmoothShading,  shininess: 0.5 } );
	
	sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = 0.279;
	sphere.position.y = 0.14;
	sphere.position.z = 0.52;
	sphere.visible = false;
	volumeScene.addObject( sphere );
	
	sphere2 = new THREE.Mesh( geometry, material );
	sphere2.position.x = 0.279;
	sphere2.position.y = -0.2;
	sphere2.position.z = 0.32;
	sphere2.visible = false;
	volumeScene.addObject( sphere2 );

	cellPickerScene = zincRenderer.createScene("cell_picker_scene");
	var zincCameraControl = volumeScene.getZincCameraControls();
	
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
	volumeScene.autoClearFlag = false;
	
	gui = new dat.GUI();
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
	
	myRenderer.addPreRenderCallbackFunction(renderFirstPass());

}


function makeCollagenVisible() {
	changeModels(guiControls.model);
	materialSecondPass.visible = true;
	volumeScene.getZincCameraControls().updateDirectionalLight();
	sphere.visible = true;
	sphere2.visible = true;
	pickerSphere.visible = true;
	pickerSphere2.visible = true;
}

function volumeRenderAnimate() {
	myRenderer.animate();
}


