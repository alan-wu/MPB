require("../styles/my_styles.css");
var THREE = require('zincjs').THREE;
var ITEM_LOADED = require("../utility").ITEM_LOADED;

/**
 * Provides rendering of the 3D-scaffold data created from ScaffikdNjaer,
 * @class
 * 
 * @author Alan Wu
 * @returns {PJP.ScaffoldViewer}
 */
var ScaffoldViewer = function()  {
  (require('./RendererModule').RendererModule).call(this);
  var csg = undefined;
  var _this = this;
  var meshTypesCallbacks = new Array();
  var meshUpdatedCallbacks = new Array();
  var availableMeshTypes = undefined;
  this.alertFunction = undefined;
  this.promptFunction = undefined;
  this.confirmFunction = undefined;
  var currentMeshType = "3d_heart1";
  var currentOptions = undefined;
  var currentLandmarks = undefined;
  var currentWorkspaceURL = undefined;
  var currentFilename = undefined;
  var landmarks = [];
  var meshChanged = false;
  var settingsChanged = false;
  _this.typeName = "Scaffold Viewer";
  
  var registerLandmarks = function(location, label) {
    if (!(label == null || label == "")) {
      var geometry = new THREE.SphereGeometry(0.02, 16, 16);
      var material = new THREE.MeshLambertMaterial({
        color : 0x00ff00,
        emissive :0x008800
      });
      var sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(location);
      _this.scene.addObject(sphere);
      landmarks.push(sphere);
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                      var xi = JSON.parse(xmlhttp.responseText);
                      if (xi && xi.element && xi.xi) {
                        sphere.userData.xi = xi.xi;
                        sphere.userData.element = xi.element;
                        sphere.name = label;
                        meshChanged = true;
                        //getLandmarksJSON();
                      }
              }     
      }
      var requestString = "./registerLandmarks" + "?name=" + label + "&xi1=" + location.x + "&xi2=" + location.y + "&xi3=" + location.z;
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
    }
  }
  
  var annotationCallback = function(location) {
    return function(status, label) {
      if (status == true)
        registerLandmarks(location, label);
    }
  }
  
  var createMarker = function(location, labelIn) {
    var label = labelIn;
    if (label == null || label == "") {
      _this.promptFunction("Please enter the annotation", "Landmark", annotationCallback(location));
    } else {
      registerLandmarks(location, label);
    }

    return true;
  }
  
  var addSphereFromLandmarksData = function(landmarksData) {
    var argumentString = "element=" + landmarksData.element;
    argumentString = argumentString + "&xi1="+landmarksData.xi[0] + "&xi2="+landmarksData.xi[1] +
      "&xi3="+landmarksData.xi[2];
    console.log(argumentString)
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var returnedObject = JSON.parse(xmlhttp.responseText);
        console.log(returnedObject)
        var coords = new THREE.Vector3( returnedObject["coordinates"][0], returnedObject["coordinates"][1],
            returnedObject["coordinates"][2] );
        createMarker(coords, landmarksData.name);
      }
    }
    xmlhttp.open("GET", "./getWorldCoordinates?" + argumentString, true);
    xmlhttp.send();
  }
  
  var addOptionsToURL = function(originalString) {
    var newString = originalString;
    for (var key in currentOptions) {
      var compatibleParamName = encodeURIComponent(key);
      var parametersValue = currentOptions[key];
      if (newString == "")
        newString = compatibleParamName + "=" + parametersValue;
      else
        newString = originalString + "&" + compatibleParamName + "=" + parametersValue;
    }
    return newString;
  }
  
  var _addOrganPartCallback = function() {
    return function(zincGeometry) {
      if (csg)
        csg.addOrganPartCallback(zincGeometry);
      _this.zincRenderer.viewAll();
    }
  }
  
  var importDataDownloadedCompletedCallback = function() {
    return function() {
      if (currentLandmarks) {
        for (var i = 0; i < currentLandmarks.length; i++) {
          addSphereFromLandmarksData(currentLandmarks[i]);
        }
      }
      if (csg)
        csg.updatePlane();
      settingsChanged = false;
    }
  }
  
  var confirmRemesh = function(itemDownloadCallback, allCompletedCallback) {
    _this.scene.clearAll();
    if (csg)
      csg.reset();
    for (i = 0; i < landmarks.length; i++) {
      _this.scene.removeObject(landmarks[i]);
    }
    landmarks = [];
    var argumentString = "meshtype=" + currentMeshType;
    argumentString = addOptionsToURL(argumentString);
    var finalURL = "/generator?" + argumentString;
    console.log(argumentString);
    _this.scene.loadMetadataURL(finalURL, itemDownloadCallback, allCompletedCallback);
    meshChanged = true;
  }
  
  //Data include meshtype, options and landmark
  var importData = function(data) {
    if (data && data.meshtype && data.options) {
      currentMeshType = data.meshtype;
      currentOptions = data.options;
      currentLandmarks = data.landmarks;
      for (var i = 0; i < meshUpdatedCallbacks.length;i++) {
        meshUpdatedCallbacks[i](data.meshtype, data.options);
      }
      confirmRemesh(_addOrganPartCallback(), importDataDownloadedCompletedCallback());
    } 
  }
  
  var verifierEntered = function(verifier) {
    if (verifier) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var options = JSON.parse(xmlhttp.responseText);
          parseWorkspaceResponse(options);
        }
      }
      var requestString = "./verifyAndResponse" + "?v=" + verifier;
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
    }
  }
  
  var verifierEnteredCallback = function() {
    return function(status, verifier) {
      if (status) {
        if (verifier && verifier != "") {
          verifierEntered(verifier);
        }
      } else {
        _this.alertFunction("Loading abort");
      }
    }
  } 
  
  var openVerifierPagePressed = function(url) {
    return function(status, input) {
      if (status == true) {
        console.log(url)
        window.open(url,'_blank');
        _this.promptFunction("Enter your verifier here", "...", verifierEnteredCallback());
      } else {
        _this.alertFunction("Loading abort");
      }
    }
  }

  var verificationCodePrompt = function(url) {
    _this.confirmFunction("Workspace may be private, please press confirm to identify yourself.", openVerifierPagePressed(url));
  } 

  var parseWorkspaceResponse = function(options) {
    if (options.status === 'error')
      modal.alert(options.message);
    else if (options.status === 'success') {
      if (options.VerifyURL)
        verificationCodePrompt(options.VerifyURL);
      else if (options.data)
        importData(options.data);
    }
  }
  
  var readWorkspace = function(url, filename) {
    if (url && filename) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var options = JSON.parse(xmlhttp.responseText);
          parseWorkspaceResponse(options);
        }     
      }
      var requestString = "./getWorkspaceResponse" + "?url=" + url + "&filename="+filename;
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
    }
  }
  
  var finalReadWorkspacePromptCallback = function() {
    return function(status, file) {
      if (status) {
        currentFilename = file;
        if (currentFilename && currentFilename !== "") {
          readWorkspace(currentWorkspaceURL, currentFilename);
        }
      }
    }
  }
  
  
  var readWorkspacePromptCallback = function() {
    return function(status, url) {
      if (status) {
        currentWorkspaceURL = url;
        if (currentWorkspaceURL && currentWorkspaceURL !== "") {
          var file = currentFilename;
          if (currentFilename == null || currentFilename == "")
            file = "Please enter file name...";
          _this.promptFunction("Please enter file name", file, finalReadWorkspacePromptCallback());
        }
      } 
    }
  }
  
  this.readWorkspacePrompt = function() {
    var url = currentWorkspaceURL;
    if (currentWorkspaceURL == null || currentWorkspaceURL == "")
      url = "Enter workspace url...";
    _this.promptFunction("Please enter PMR workspace", url, readWorkspacePromptCallback());

  }
  
  var commitWorkspaceCallback = function() {
    return function(status, msg) {
      if (status == true && msg != "") {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            if (response.status == "success")
              changesCommitted = true;
            if (response.message)
              _this.alertFunction(response.message);
          }     
        }
        var requestString = "./commitWorkspaceChanges" + "?msg=" + msg;
        xmlhttp.open("GET", requestString, true);
        xmlhttp.send();
      }
    }
  }
  
  this.commitWorkspace = function() {
    if (meshChanged === true) {
      meshChanged = false;
      var msg = "Commit Message";
      _this.promptFunction("Please enter commit message", msg, commitWorkspaceCallback());
    }
    else {
      _this.alertFunction("Everything is up-to-date");
    }
  }
    
  var confirmPushCallback = function() {
    return function(status, input) {
      if (status == true) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            if (response.message)
              _this.alertFunction(response.message);
          }     
        }
        var requestString = "./pushWorkspace";
        xmlhttp.open("GET", requestString, true);
        xmlhttp.send();
      }
    }
  }
  
  this.pushWorkspace = function() {
    if (changesCommitted) {
      if (meshChanged)
        _this.confirmFunction("There are uncommitted changes. Are you sure you want to push the changes?", confirmPushCallback());
      else
        _this.confirmFunction("Are you sure you want to push the changes?", confirmPushCallback());
    }
  }
  
  this.setMeshType = function(meshTypeIn) {
    if (meshTypeIn !== currentMeshType) {
      currentMeshType = meshTypeIn;
      currentOptions = undefined;
      currentLandmarks = undefined;
      settingsChanged = true;
    }
  }
  
  this.updateOption = function(key, value) {
    if (currentOptions) {
      if (currentOptions[key] && currentOptions[key] != value) {
        currentOptions[key] = value;
        settingsChanged = true;
      }
    }
  }
  
  this.updateMesh = function() {
    if (settingsChanged) {
      var data = [];
      data.meshtype = currentMeshType;
      data.options = currentOptions;
      data.landmarks = currentLandmarks;
      if (data.options == undefined) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var options = JSON.parse(xmlhttp.responseText);
            currentOptions = options;
            data.options = options;
            importData(data);
          }     
        }
        var requestString = "./getMeshTypeOptions" + "?type=" + data.meshtype;
        xmlhttp.open("GET", requestString, true);
        xmlhttp.send();
      } else {
        importData(data);
      }
    }
  }
  
  var resumeWorkspace = function() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText);
        console.log(response);
        if (response.data) {
          importData(response.data);
          _this.alertFunction(response.message);
        }
        else if (response.message) {
          settingsChanged = true;
          _this.updateMesh();
          _this.alertFunction(response.message);
        }
      }
    }
    var requestString = "./resume";
    xmlhttp.open("GET", requestString, true);
    xmlhttp.send();
  }
  
  var prepareWorkspace = function() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var meshTypes = JSON.parse(xmlhttp.responseText);
        availableMeshTypes = meshTypes;
        for (var i = 0; i < meshTypesCallbacks.length;i++) {
          meshTypesCallbacks[i](meshTypes);
        }
        resumeWorkspace();
      }
    }
    xmlhttp.open("GET", "./getMeshTypes", true);
    xmlhttp.send();
  }
  
  var _pickingCallback = function() {
    return function(intersects, window_x, window_y) {
      for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData && (false == Array.isArray(intersects[i].object.userData))) {
          if (intersects[i].object.userData.groupName === "intersect") {
            console.log(intersects[i])
            return createMarker(intersects[i].point, null);
          }
        }
      }
    }
  };
  
  /**
   * This callback is triggered when a body part is hovered over by the mosue.
   * @callback
   */
  var _hoverCallback = function() {
    return function(intersects, window_x, window_y) {
      for (var i = 0; i < intersects.length; i++) {
        var currentObject = intersects[i].object;
        //if (intersects[i].object.name && intersects[i].object.name.includes("Element")) {
        if (currentObject.name && currentObject.userData.xi && currentObject.userData.element) {
          var displayString = currentObject.name + "<br />{ Element " + 
            currentObject.userData.element + ", xi: " + currentObject.userData.xi[0] + ", " + 
            currentObject.userData.xi[1] + ", " + currentObject.userData.xi[2]+"}";
          _this.toolTip.setText(displayString);
          _this.toolTip.show(window_x, window_y);
          return;
        }
      }
      _this.toolTip.hide();
    }
  };
  
  this.addMeshTypesCallback = function(callback) {
    if (typeof(callback === "function"))
      meshTypesCallbacks.push(callback);
  }
  
  this.addMeshUpdatedCallbacks = function(callback) {
    if (typeof(callback === "function"))
      meshUpdatedCallbacks.push(callback);
  }
  
  this.getAvailableMeshTypes = function() {
    return availableMeshTypes;
  }
  
  this.addCSGGui = function(parent) {
    if (csg)
      csg.addDatGui(parent);
  }
  
  /**
   * Initialise the {@link PJP.BodyViewer}, it will create a detached renderer until
   * a display area is passed in as an argument on intialiseRenderer.
   */
  var initialise = function() {
    _this.initialiseRenderer(undefined);
    _this.scene = _this.zincRenderer.createScene("scaffold");
    _this.zincRenderer.setCurrentScene(_this.scene);
    _this.zincRenderer.getThreeJSRenderer().localClippingEnabled = true;
    _this.scene.loadViewURL("/static/view.json");
    //scene.loadViewURL(modelsLoader.getBodyDirectoryPrefix() + "/body_view.json");
    var directionalLight = _this.scene.directionalLight;
    directionalLight.intensity = 1.4;
    var zincCameraControl = _this.scene.getZincCameraControls();
    zincCameraControl.enableRaycaster(_this.scene, _pickingCallback(), _hoverCallback());
    zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
    zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
    csg = new (require('../utilities/csg').csg)(_this.scene, _this.zincRenderer);
    prepareWorkspace();
  }
  
  initialise();
}

ScaffoldViewer.prototype = Object.create((require('./RendererModule').RendererModule).prototype);
exports.ScaffoldViewer = ScaffoldViewer;
