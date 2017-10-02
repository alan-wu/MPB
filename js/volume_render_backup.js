var textureScene;
var camera, sceneFirstPass, sceneSecondPass, renderer;

var rtTexture, transferTexture;
var cubeTextures = ['collagen', 'crop', 'collagen_large', 'crop'];
var materialSecondPass;


function changeModels(value) {
	materialSecondPass.uniforms.cubeTex.value =  cubeTextures[value];
	if (value.includes('crop')) {
		console.log(value);
		materialSecondPass.uniforms.black_flip.value = false;
		renderer.setClearColor( 0x000000, 1 );
	} else {
		materialSecondPass.uniforms.black_flip.value = true;
		renderer.setClearColor( 0xffffff, 1 );
	}
}

function volumeRenderInit() {

	guiControls = new function() {
		this.model = 'collagen';
		this.steps = 256.0;
		this.alphaCorrection = 5.0;
		this.color1 = "#00FA58";
		this.stepPos1 = 0.1;
		this.color2 = "#CC6600";
		this.stepPos2 = 0.7;
		this.color3 = "#F2F200";
		this.stepPos3 = 1.0;
	};
	
	activated = false;
	
	container = document.createElement( 'div' );
	container.style.height = "100%"
	document.getElementById("tissueDisplayArea").appendChild( container );
	
	camera = new THREE.PerspectiveCamera( 40, container.clientWidth / container.clientHeight, 0.01, 3000.0 );
	camera.position.z = 3.0;

	controls = new THREE.OrbitControls( camera, container );
	controls.center.set( 0.0, 0.0, 0.0 );


	//Load the 2D texture containing the Z slices.
	cubeTextures['collagen'] = THREE.ImageUtils.loadTexture('textures/collagen.png');
	cubeTextures['crop'] = THREE.ImageUtils.loadTexture('textures/crop.png');
	cubeTextures['collagen_large'] = THREE.ImageUtils.loadTexture('textures/collagen_large.png');
	cubeTextures['crop_large'] = THREE.ImageUtils.loadTexture('textures/crop_large.png');

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

	var transferTexture = updateTransferFunction();

	var screenSize = new THREE.Vector2( container.clientWidth, container.clientHeight );
	rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
											{ 	minFilter: THREE.LinearFilter,
												magFilter: THREE.LinearFilter,
												wrapS:  THREE.ClampToEdgeWrapping,
												wrapT:  THREE.ClampToEdgeWrapping,
												format: THREE.RGBFormat,
												generateMipmaps: false} );


	var materialFirstPass = new THREE.ShaderMaterial( {
		vertexShader: document.getElementById( 'vertexShaderFirstPass' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderFirstPass' ).textContent,
		side: THREE.BackSide
	} );

	materialSecondPass = new THREE.ShaderMaterial( {
		vertexShader: document.getElementById( 'vertexShaderSecondPass' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderSecondPass' ).textContent,
		side: THREE.FrontSide,
		uniforms: {	tex:  { type: "t", value: rtTexture.texture },
					cubeTex:  { type: "t", value: cubeTextures['collagen'] },
					transferTex:  { type: "t", value: transferTexture },
					steps : {type: "1f" , value: guiControls.steps },
					alphaCorrection : {type: "1f" , value: guiControls.alphaCorrection },
					black_flip : {value: true}}
	 });

	sceneFirstPass = new THREE.Scene();
	sceneSecondPass = new THREE.Scene();

	var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
	boxGeometry.doubleSided = true;

	var meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
	var meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );

	sceneFirstPass.add( meshFirstPass );
	sceneSecondPass.add( meshSecondPass );
	
	renderer = new THREE.WebGLRenderer();
	container.style.backgroundColor = "white";
	container.appendChild( renderer.domElement );
	renderer.setClearColor( 0xffffff, 1 );
	
	var gui = new dat.GUI();
	var modelSelected = gui.add(guiControls, 'model', [ 'collagen', 'crop', 'collagen_large', 'crop_large'] );

	modelSelected.onChange(function(value) {
		changeModels(value);
	} );

	onWindowResize();

	window.addEventListener( 'resize', onWindowResize, false );
	
	materialSecondPass.visible = false;

}

function updateTextures(value)
{
	materialSecondPass.uniforms.transferTex.value = updateTransferFunction();
}

function updateTransferFunction()
{
	var canvas = document.createElement('canvas');
	canvas.height = 20;
	canvas.width = 256;

	var ctx = canvas.getContext('2d');

	var grd = ctx.createLinearGradient(0, 0, canvas.width -1 , canvas.height - 1);
	grd.addColorStop(guiControls.stepPos1, guiControls.color1);
	grd.addColorStop(guiControls.stepPos2, guiControls.color2);
	grd.addColorStop(guiControls.stepPos3, guiControls.color3);

	ctx.fillStyle = grd;
	ctx.fillRect(0,0,canvas.width -1 ,canvas.height -1 );

	transferTexture =  new THREE.Texture(canvas);
	transferTexture.wrapS = transferTexture.wrapT =  THREE.ClampToEdgeWrapping;
	transferTexture.needsUpdate = true;

	return transferTexture;
}

function onWindowResize( event ) {

	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( container.clientWidth, container.clientHeight );
}

function volumeRenderAnimate() {

		requestAnimationFrame( volumeRenderAnimate );

		volumeRenderRender();
}

function makeCollagenVisible() {
	changeModels(guiControls.model);
	materialSecondPass.visible = true;
}

function volumeRenderRender() {

	//Render first pass and store the world space coords of the back face fragments into the texture.
	renderer.render( sceneFirstPass, camera, rtTexture, true );

	//Render the second pass and perform the volume rendering.
	renderer.render( sceneSecondPass, camera );

	materialSecondPass.uniforms.steps.value = guiControls.steps;
	materialSecondPass.uniforms.alphaCorrection.value = guiControls.alphaCorrection;
}
