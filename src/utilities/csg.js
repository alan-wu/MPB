var Zinc = require('zincjs');
var dat = require('../ui/dat.gui');
var THREE = Zinc.THREE;

exports.csg = function(sceneIn, zincRendererIn) {

  var datGui = undefined;
  var scene = sceneIn;
  var csgScene  = zincRendererIn.createScene("csg");
  var controls = {};
  var currentBoundingBox = undefined;
  var currentMaterial = undefined;
  var boxGeometry = undefined;
  var boxGeometry2 = undefined;
  var donut = undefined;
  var zincCSG = undefined;
  var intersect = undefined;
  var currentScene = undefined;
  var currentGeometry = undefined;
  var distanceSlider = undefined;
  var xRotationSlider = undefined;
  var yRotationSlider = undefined;
  var plane = undefined;
  var planeHelper = undefined;
  var guiControls = new function() {
    this.distance = 0.0;
    this.continuous = false;
    this.xRotation = 0.0;
    this.yRotation = 0.0;
    this.reverse = false;
    this.transparentMesh = false;
  };
  var meshCenter = undefined;
  var meshRadius = undefined;
  var meshDistance = undefined;

  var getCentroid = function() {
    if (currentGeometry) {
      currentGeometry.computeBoundingSphere();
      meshCenter = currentGeometry.boundingSphere.center;
      meshRadius = currentGeometry.boundingSphere.radius;
      var origin = new THREE.Vector3(0, 0, 0);
      meshDistance = origin.distanceTo(meshCenter);;
      if (meshCenter.z < 0.0)
        meshDistance = -meshDistance;
    }
  }
  
  var mergeGeometry = function(zincGeometry) {
    if (zincGeometry.groupName && zincGeometry.groupName !== "") {
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

  var updatePlane = function() {
    var radX = THREE.Math.degToRad(guiControls.xRotation);
    var radY = THREE.Math.degToRad(guiControls.yRotation);
    var radZ = THREE.Math.degToRad(guiControls.zRotation);
    boxGeometry.morph.rotation.x = radX;
    boxGeometry2.morph.rotation.x = radX;
    boxGeometry.morph.rotation.y = radY;
    boxGeometry2.morph.rotation.y = radY;
    var euler = new THREE.Euler(radX, radY, radZ);
    boxGeometry.morph.position.set(0, 0, 0);
    console.log(plane.constant);
    plane.constant = meshDistance + guiControls.distance;
    if (guiControls.reverse == false) {
      plane.normal.set(0, 0, -1);
      boxGeometry.morph.translateZ(plane.constant);
    }
    else {
      plane.constant = -plane.constant;
      plane.normal.set(0, 0, 1);
      boxGeometry.morph.translateZ(-plane.constant);
    }
    plane.normal.applyEuler(euler).normalize();
    boxGeometry.morph.updateMatrix();
  }

  var createCSG = function() {
    if (!zincCSG) {
      var zincGeometry = csgScene.addZincGeometry(currentGeometry, 23499, 0xffffff, 1.0);
      zincCSG = new Zinc.GeometryCSG(zincGeometry);
      zincGeometry.setVisibility(false);
    }
    if (currentGeometry) {
      intersect = zincCSG.intersect(boxGeometry);
      intersect.morph.material.color.set(0x00ffff);
      intersect.groupName = "intersect";
      scene.addGeometry(intersect);
    }
  }

  var removeCutFace = function(scene) {
    return function(zincGeometry) {
      if (zincGeometry.groupName && zincGeometry.groupName === "intersect")
        scene.removeZincGeometry(zincGeometry);
    }
  }


  var createCube = function(width, height, depth) {
    var tempGeometry = new THREE.BoxGeometry(width, height, depth);
    boxGeometry = scene.addZincGeometry(tempGeometry, 40001, 0xdddddd, 0.5, false, false, true);
    if (boxGeometry2 === undefined)
      boxGeometry2 = csgScene.addZincGeometry(tempGeometry, 40001, 0xdddddd, 0.5, false, false, true);
    boxGeometry.morph.matrixAutoUpdate = false;
    boxGeometry.morph.visible = false;
    if (plane === undefined) {
      plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
      planeHelper = new THREE.PlaneHelper(plane, 2, 0xff0000);
      scene.addObject(planeHelper);
    }
  }

  this.addOrganPartCallback = function(zincGeometry) {
    mergeGeometry(zincGeometry);
    zincGeometry.morph.material.clippingPlanes = [ plane ];
    zincGeometry.morph.material.transparent = false;
  }
  
  this.reset = function() {
    csgScene.clearAll();
    zincCSG = undefined;
    boxGeometry = undefined;
    boxGeometry2 = undefined;
    currentGeometry = undefined;
    createCube(5, 5, 0.001);
  }
  
  this.updatePlane = function() {
    updatePlane();
  }

  this.addDatGui = function(parent) {
    datGui = new dat.GUI({autoPlace: false});
    datGui.domElement.id = 'csgGui';
    parent.appendChild(datGui.domElement);
    controls["viewport"] = function() {
      console.log(scene.getZincCameraControls().getCurrentViewport())
    };
    controls["Intersect"] = function() {
      createCSG();
    };
    controls["remove intersections"] = function() {
      scene.forEachGeometry(removeCutFace(scene));
    };
    datGui.add(controls, "viewport");
    datGui.add(controls, "remove intersections");
    distanceSlider = datGui.add(guiControls, 'distance', -1.0, 1.0).step(0.01).onChange(distanceSliderChanged());
    xRotationSlider = datGui.add(guiControls, 'xRotation', -90, 90).step(1).onChange(xRotationSliderChanged());
    yRotationSlider = datGui.add(guiControls, 'yRotation', -90, 90).step(1).onChange(yRotationSliderChanged());
    datGui.add(guiControls, 'continuous');
    var reverseController = datGui.add(guiControls, 'reverse');
    reverseController.onChange(function(value) {
      updatePlane();
    });
    datGui.add(controls, "Intersect");
  };
  
  
}
