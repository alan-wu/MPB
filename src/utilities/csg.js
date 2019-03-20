var Zinc = require('zincjs');
var dat = require('../ui/dat.gui');
var THREE = Zinc.THREE;
var cuttingVS = require('../shaders/uvCutting.vs');
var cuttingFS = require('../shaders/uvCutting.fs');

/**
 * This module provides quick access to constructive solid geometries (CSG) and surfaces cutting on said
 * geometries. 
 * 
 * @class
 * @param {Zinc.Scene} sceneIn - scene containing geometries for conversion, once intersected
 * surfaces are created they are drawn on this scene.
 * @param {Zinc.Renderer} zincRendererIn - renderer.
 * @author Alan Wu
 * @returns {exports.csg}
 */
exports.csg = function(sceneIn, zincRendererIn) {
  var ClippingModes = Object.freeze({"STANDARD":1, "PATH":2});
  var datGui = undefined;
  var currentClippingMode = ClippingModes.STANDARD;
  var scene = sceneIn;
  var csgScene = zincRendererIn.createScene("csg");
  var csgSceneCamera = csgScene.getZincCameraControls();
  var controls = {};
  var currentBoundingBox = undefined;
  var currentMaterial = undefined;
  var boxGeometry = undefined;
  var zincCSG = undefined;
  var glyphsetCSG = undefined;
  var intersect = undefined;
  var currentScene = undefined;
  var currentGeometry = undefined;
  var currentGlyphs = undefined;
  var distanceSlider = undefined;
  var xRotationSlider = undefined;
  var yRotationSlider = undefined;
  var reverseController = undefined;
  var plane = undefined;
  var planeHelper = undefined;
  var guiControls = new function() {
    this.distance = 1.0;
    this.continuous = false;
    this.xRotation = 0.0;
    this.yRotation = 0.0;
    this.reverse = false;
    this.transparentMesh = false;
  };
  var mergedGlyphGeometry = undefined;
  var meshCenter = new THREE.Vector3(0, 0, 0);
  var meshRadius = 0;
  var meshDistance = 0.0;
  if (zincRendererIn)
	  zincRendererIn.getThreeJSRenderer().localClippingEnabled = true;
  var originalGlyphs = undefined;

  var getCentroid = function() {
    if (currentGeometry) {
      currentGeometry.computeBoundingSphere();
      meshCenter = currentGeometry.boundingSphere.center;
      meshRadius = currentGeometry.boundingSphere.radius;
      var origin = new THREE.Vector3(0, 0, 0);
      meshDistance = origin.distanceTo(meshCenter);
      if (meshCenter.z < 0.0)
        meshDistance = -meshDistance;
    }
  }
  
  var mergeGlyphsCallback = function() {
	  return function(glyph) {
	      if (currentGlyphs === undefined)
	    	  currentGlyphs = new THREE.Geometry();
	      var mesh = glyph.getMesh();
	      if (mesh) {	    	  
	    	  currentGlyphs.mergeMesh(mesh);
	    	  currentGlyphs.mergeVertices();
	      }
	  }
  }
  
  var mergeGlyphset = function(zincGeometry) {
    if (zincGeometry.isGlyphset) {
    	zincGeometry.forEachGlyph(mergeGlyphsCallback());
    }
  }
  
  var mergeGeometry = function(zincGeometry) {
    if (zincGeometry.isGeometry && zincGeometry.groupName && zincGeometry.groupName !== "") {
      if (currentGeometry === undefined) {
        currentGeometry = zincGeometry.geometry.clone();
      } else {
        currentGeometry.mergeMesh(zincGeometry.morph);
        currentGeometry.mergeVertices();
      }
      getCentroid();
    } else {
      console.log("rejected")
    }
  }

  var distanceSliderChanged = function() {
    return function(value) {
      updatePlane();
    }
  }

  var xRotationSliderChanged = function() {
    return function(value) {
      updatePlane();
    }
  }

  var yRotationSliderChanged = function() {
    return function(value) {
      updatePlane();
    }
  }
  
  var updateUniforms = function() {
    return function(zincObject) {
  	  if (zincObject.isGeometry) {
  		if (zincObject.morph.material.uniforms) {
  		  zincObject.morph.material.uniforms["progress"].value = guiControls.distance;
  		  if (guiControls.reverse)
  		    zincObject.morph.material.uniforms["reverse"] = 1;
  		  else
  		    zincObject.morph.material.uniforms["reverse"] = 0;
  	    }
  	  }
  	}
  }

  var boxTransformedWithPath = function() {
	if (currentClippingMode == ClippingModes.PATH) {
		csgSceneCamera.playPath();
		csgSceneCamera.setTime(guiControls.distance*3000.0);
		csgSceneCamera.calculatePathNow();
		csgSceneCamera.stopPath();
		csgScene.camera.updateProjectionMatrix();
		var normal = csgScene.camera.target.clone().sub(csgScene.camera.position).normalize();
		plane.normal.set(normal.x, normal.y, normal.z);
		planeHelper.updateMatrix();
		boxGeometry.morph.setRotationFromEuler(planeHelper.rotation);
		boxGeometry.morph.updateMatrix();
		var centre = csgScene.camera.position.clone();
		boxGeometry.morph.position.copy(centre);
		boxGeometry.morph.updateMatrix();
	}
  }
  
  var updatePlane = function() {
	  if (currentClippingMode == ClippingModes.STANDARD) {
		  var radX = THREE.Math.degToRad(guiControls.xRotation);
		  var radY = THREE.Math.degToRad(guiControls.yRotation);
		  var radZ = THREE.Math.degToRad(guiControls.zRotation);
		  boxGeometry.morph.rotation.x = radX;
		  boxGeometry.morph.rotation.y = radY;
		  var euler = new THREE.Euler(radX, radY, radZ);
		  boxGeometry.morph.position.set(0, 0, 0);
		  plane.constant = meshDistance + guiControls.distance;
		  if (guiControls.reverse == false) {
			  plane.normal.set(0, 0, -1);
			  boxGeometry.morph.translateZ(plane.constant);
		  } else {
			  plane.constant = -plane.constant;
			  plane.normal.set(0, 0, 1);
			  boxGeometry.morph.translateZ(-plane.constant);
		  }
		  plane.normal.applyEuler(euler).normalize();
		  boxGeometry.morph.updateMatrix();
	  } else if (currentClippingMode == ClippingModes.PATH) {
		  boxTransformedWithPath();
		  scene.forEachGeometry(updateUniforms(scene));
	  }
  }

  var updateUniforms = function() {
	myUniforms["progress"].value = pathSceneCamera.getTime() / 3000.0;
	var directionalLight = scene.directionalLight;
	myUniforms["directionalLightDirection"].value.set(directionalLight.position.x,
	  directionalLight.position.y,
	  directionalLight.position.z);
  }

  var createCSG = function() {
	if (!zincCSG && currentGeometry) {
	    var zincGeometry = csgScene.addZincGeometry(currentGeometry, 23499, 0xffffff, 1.0);
	    zincCSG = new Zinc.GeometryCSG(zincGeometry);
	    zincGeometry.setVisibility(false);
	  }
	  if (!glyphsetCSG && originalGlyphs) {
	  	glyphsetCSG = new Zinc.GlyphsetCSG(originalGlyphs);
	  }
	  
	  if (currentGeometry) {
	    if (mergedGlyphGeometry === undefined && currentGlyphs) {
	  	  mergedGlyphGeometry = csgScene.addZincGeometry(currentGlyphs, 45121, 0xffffff, 1.0);
	    }
	    var intersect = undefined;
	    var csg1 = zincCSG.intersect(boxGeometry);
	    if (glyphsetCSG) {
	  	  var newGeometry = csg1.getGeometry();
	  	  intersect = glyphsetCSG.intersect(newGeometry).getGlyphset();
	    } else {
	  	  intersect = csg1.getGeometry();
	    }
	    if (intersect) {
	      if (intersect.isGeometry) {
	    	  intersect.morph.material.color.set(0xff00ff);
	    	  intersect.groupName = "intersect";
	    	  scene.addGeometry(intersect);
	      } else if (intersect.isGlyphset) {
	    	  console.log(intersect.getGroup());
	    	  intersect.groupName = "intersect";
	    	  scene.addGlyphset(intersect); 
	      }
	    }
	    if (glyphsetCSG && mergedGlyphGeometry) {
	      var intersect2 = csg1.subtract(mergedGlyphGeometry).getGeometry();
	      intersect2.morph.material.color.set(0xffffff);
	      intersect2.groupName = "intersect";
	      scene.addGeometry(intersect2);
	    }
	  }
	}

  var removeCutFace = function(scene) {
    return function(zincObject) {
      if (zincObject.groupName && zincObject.groupName === "intersect") {
		  if (zincObject.isGeometry)
			  scene.removeZincGeometry(zincObject);
		  else if (zincObject.isGlyphset)
			  scene.removeZincGlyphset(zincObject);
      }
    }
  }

  var createCube = function(width, height, depth) {
    var tempGeometry = new THREE.BoxGeometry(width, height, depth);
    boxGeometry = scene.addZincGeometry(tempGeometry, 40001, 0xdddddd, 1.0, false, false, true);
    boxGeometry.morph.matrixAutoUpdate = false;
    boxGeometry.morph.visible = false;
    if (plane === undefined) {
      plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
      planeHelper = new THREE.PlaneHelper(plane, 1, 0xff0000);
      scene.addObject(planeHelper);
    }
  }
  
  var setClippingForGlyphs = function() {
	  return function(glyph) {
		  var mesh = glyph.getMesh();
		  if (mesh.material) {
			  mesh.material.clippingPlanes = [ plane ];
		  }
	  }
  }

  this.addOrganPartCallback = function(zincGeometry) {
	    if (zincGeometry.isGlyphset) {
	    	originalGlyphs = zincGeometry;
	        mergeGlyphset(zincGeometry);
	    	zincGeometry.forEachGlyph(setClippingForGlyphs());
	    } else if (zincGeometry.isGeometry && zincGeometry.morph && 
	    	zincGeometry.morph.material) {
	        mergeGeometry(zincGeometry);
	    	zincGeometry.morph.material.clippingPlanes = [ plane ];
	    	zincGeometry.morph.visible = true;
	    	zincGeometry.morph.transparent = false;
	    }
  }
  
  var setShaderMaterial = function(scene) {
    return function(zincObject) {
	  if (zincObject.isGeometry) {
		  var originalMaterial = zincObject.morph.material;
		  var dirLight = scene.directionalLight;
		  var myUniforms= THREE.UniformsUtils.merge( [
			  {
				  "ambient"  : { type: "c", value: new THREE.Color( 0xffffff  ) },
				  "emissive" : { type: "c", value: new THREE.Color( originalMaterial.emissive ) },
				  "specular" : { type: "c", value: new THREE.Color( originalMaterial.specular ) },
				  "diffuse" : { type: "c", value: new THREE.Color( originalMaterial.color ) },
				  "shininess": { type: "f", value: originalMaterial.shininess },
				  "ambientLightColor": { type: "c", value: new THREE.Color( 0x444444 ) },
				  "directionalLightColor": { type: "c", value: new THREE.Color( 0x888888 ) },
				  "directionalLightDirection": { type: "v3", value: new THREE.Vector3(
					 dirLight.position.x, dirLight.position.y, dirLight.position.z )  },
				  "progress": { type: "f", value: 0.0 },
				  "reverse": { type: "i", value: 0 },
			  }
		  ] ); 
		  var shaderMaterial = new THREE.ShaderMaterial( {
			vertexShader: cuttingVS,
			fragmentShader: cuttingFS,
			uniforms: myUniforms
		  } );
		  shaderMaterial.side = THREE.DoubleSide;
		  shaderMaterial.depthTest = true;
		  shaderMaterial.vertexColors = THREE.VertexColors;
		  zincObject.morph.material = shaderMaterial;
	  }
    }
  }
  
  this.allDownloadsCompletedCallback = function() {
	  if (currentClippingMode == ClippingModes.STANDARD) {
		  getCentroid();
		  if (meshRadius > 0) {
			  var dimension = meshRadius * 2.0 *1.1 + meshCenter.length();
			  if (boxGeometry && boxGeometry.geometry) {
				  boxGeometry.geometry.scale(dimension, dimension, 1.0);
			  }
			  if (planeHelper) {
				  planeHelper.geometry.scale(dimension, dimension, 1.0);
			  }
			  if (distanceSlider) {
				  distanceSlider.__min = -Math.ceil(meshRadius);
				  distanceSlider.__max = Math.ceil(meshRadius);
				  guiControls.distance =  Math.ceil(meshRadius);;
				  distanceSlider.updateDisplay();
			  }
			  if (xRotationSlider) {
				  xRotationSlider.__li.style.display = "";
			  }
			  if (yRotationSlider) {
				  yRotationSlider.__li.style.display = "";
			  }
		  }
	  } else if (currentClippingMode == ClippingModes.PATH) {
		  scene.forEachGeometry(setShaderMaterial(scene));
		  if (distanceSlider) {
			  distanceSlider.__min = 0.0;
			  distanceSlider.__max = 1.0;
			  guiControls.distance = Math.ceil(0.0);
			  csgSceneCamera.setTime(0.0);
			  distanceSlider.updateDisplay();
		  }
		  if (xRotationSlider) {
			  xRotationSlider.__li.style.display = "none";
		  }
		  if (yRotationSlider) {
			  yRotationSlider.__li.style.display = "none";
		  }
	  }
	  if (reverseController) {
		  guiControls.reverse = false;
		  reverseController.updateDisplay();
	  }
  }
  
  this.enableStandardCutting = function() {
	  if (currentClippingMode != ClippingModes.STANDARD) {
		  currentClippingMode = ClippingModes.STANDARD;
	  }
  }
  
  this.enablePathCutting = function(path) {
	  if (path && path.CameraPath && path.NumberOfPoints) {
		  if (currentClippingMode != ClippingModes.PATH) {
			  currentClippingMode = ClippingModes.PATH;
			  csgSceneCamera.loadPath(path);
		  }
	  }
  }
  
  this.reset = function() {
	    csgScene.clearAll();
	    zincCSG = undefined;
	    boxGeometry = undefined;
	    currentGeometry = undefined;
	    createCube(1, 1, 0.0005);
  }
  
  this.updatePlane = function() {
    updatePlane();
  }

  this.addDatGui = function(parent) {
    datGui = new dat.GUI({autoPlace: false});
    datGui.domElement.id = 'csgGui';
    parent.appendChild(datGui.domElement);
    controls["intersect"] = function() {
      createCSG();
    };
    controls["remove cuts"] = function() {
      scene.forEachGeometry(removeCutFace(scene));
      scene.forEachGlyphset(removeCutFace(scene));
    };
    datGui.add(controls, "remove cuts");
    distanceSlider = datGui.add(guiControls, 'distance', -1.0, 1.0).step(0.01).onChange(distanceSliderChanged());
    xRotationSlider = datGui.add(guiControls, 'xRotation', -90, 90).step(1).onChange(xRotationSliderChanged());
    yRotationSlider = datGui.add(guiControls, 'yRotation', -90, 90).step(1).onChange(yRotationSliderChanged());
    //datGui.add(guiControls, 'continuous');
    reverseController = datGui.add(guiControls, 'reverse');
    reverseController.onChange(function(value) {
      updatePlane();
    });
    datGui.add(controls, "intersect");
  };
  
  
}
