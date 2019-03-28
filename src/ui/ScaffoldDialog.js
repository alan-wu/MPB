/**
 * A customised dialog for body viewer.
 */
var ScaffoldDialog = function(scaffoldViewerIn, parentIn) {
  (require('./BaseDialog').BaseDialog).call(this);
  this.parent = parentIn;
  this.module = scaffoldViewerIn;
  var modal = undefined;
  var optionsChanged = false;
  var _myInstance = this;
  var guiControls = new function() {
    this['Mesh Types'] = "3d_heart1";
  };
  var meshParametersGui = undefined;
  var meshParametersGuiControls = undefined;
  var meshPartsGui = undefined;
  var meshPartsGuiControls = undefined;
  
  //Array of settings of the body viewer gui controls.
  var scaffoldControl = function() {
      this.Background = [ 255, 255, 255 ]; // RGB array
  }

  var scaffoldBackGroundChanged = function() {
    return function(value) {
      var redValue = parseInt(value[0]);
      var greenValue = parseInt(value[1]);
      var blueValue = parseInt(value[2]);
      var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
      _myInstance.module.changeBackgroundColour(backgroundColourString);
    }
  }
    
  var scaffoldViewerChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        _myInstance.setTitle(module.getName());
      }
    }
  }
  
  var changeMeshTypeCallback = function() {
    _myInstance.module.setMeshType(guiControls['Mesh Types']);
    _myInstance.module.updateMesh();
  }
  
  var createMeshTypesChooser = function(meshTypes) {
    _myInstance.datGui.add(guiControls, 'Mesh Types', meshTypes ).onChange(function(value) {
      changeMeshTypeCallback();
    }).listen();
  }

  var addOption = function(key, value) {
    meshParametersGui.add(meshParametersGuiControls, key);
  }

  var addOptions = function(options) {
    for (var key in options) {
        // check if the property/key is defined in the object itself, not in parent
        if (options.hasOwnProperty(key)) {
           meshParametersGuiControls[key] = options[key];
           addOption(key, options[key]);
        }
    }
  }
  
  var confirmPressed = function() {
    for (var key in meshParametersGuiControls) {
      if (meshParametersGuiControls.hasOwnProperty(key)) {
        _myInstance.module.updateOption(key, meshParametersGuiControls[key]);
      }
    }
    _myInstance.module.updateMesh();
  }

  var updateParametersOptions = function(options) {
    _myInstance.datGui.removeFolder('Parameters');
    meshParametersGuiControls = function() {
    };
    meshParametersGui = _myInstance.datGui.addFolder('Parameters');
    addOptions(options);
    var confirmButton = { 'Confirm':function(){ confirmPressed() }};
    meshParametersGui.add(confirmButton, 'Confirm');
  }
  
  var meshPartNameClickedCallback = function(groupName) {
    return function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      _myInstance.module.setSelectedByGroupName(groupName, false);
    } 
  }
  
  var addPartGuiOptionsCallback = function() {
    return function(zincGeometry) {
      if (zincGeometry.groupName) {
        var groupName = zincGeometry.groupName;
        if (!meshPartsGuiControls.hasOwnProperty(groupName)) {
          meshPartsGuiControls[groupName] = true;
          var controller = meshPartsGui.add(meshPartsGuiControls, groupName);
          var span = controller.__li.getElementsByTagName("span")[0];
          controller.onChange(_myInstance.module.changePartVisibilityCallback(groupName));
          controller.__li.onmouseover = function() {_myInstance.module.setHighlightedByGroupName(groupName, true);};
          span.onclick = meshPartNameClickedCallback(groupName);
        }
      }
    }
  }
  
  var updatePartGuiOptions = function() {
    _myInstance.datGui.removeFolder('Regions');
    meshPartsGuiControls = function() {
    };
    meshPartsGui = _myInstance.datGui.addFolder('Regions');
    meshPartsGui.open();
    if (_myInstance.module.scene) {
      _myInstance.module.scene.forEachGeometry(addPartGuiOptionsCallback()); 
    }
  }

  var allPartsDownloadedCallbacks = function() {
    return function() {
      updatePartGuiOptions();
    }
  }
  
  var meshUpdatedCallback = function() {
    return function(meshType, options) {
      guiControls['Mesh Types'] = meshType;
      updateParametersOptions(options);
    }
  }
  
  var meshTypesResponseCallback = function() {
    return function(meshTypes) {
      createMeshTypesChooser(meshTypes);
    }
  }
  
  var initialiseScaffoldControlUI = function() {
    _myInstance.addDatGui();
    _myInstance.container.find("#meshGui")[0].appendChild(_myInstance.datGui.domElement);
    var viewAllButton = { 'View All':function(){ _myInstance.module.viewAll() }};
    var readButton = { 'Read':function(){ _myInstance.module.readWorkspacePrompt() }};
    var commitButton = {'Commit':function() { _myInstance.module.commitWorkspace() }};
    var pushButton = {'Push':function() { _myInstance.module.pushWorkspace() }};
    _myInstance.datGui.add(viewAllButton, 'View All');
    _myInstance.datGui.add(readButton, 'Read');
    _myInstance.datGui.add(commitButton, 'Commit');
    _myInstance.datGui.add(pushButton, 'Push');
  }

  var initialise = function() {
    if (_myInstance.module) {
      _myInstance.create(require("../snippets/ScaffoldDialog.html"));
      modal = new (require('./Modal').PortalModal)(
      _myInstance.container.find(".portalmodal")[0]);
      var name = _myInstance.module.getName();
      _myInstance.setTitle(name);
      var displayArea = _myInstance.container.find("#scaffoldDisplayArea")[0];
      _myInstance.module.initialiseRenderer(displayArea);
      initialiseScaffoldControlUI();
      _myInstance.module.alertFunction = modal.alert;
      _myInstance.module.promptFunction = modal.prompt;
      _myInstance.module.confirmFunction = modal.confirm;
      var meshTypes = _myInstance.module.getAvailableMeshTypes();
      if (meshTypes)
        createMeshTypesChooser(meshTypes);
      else
        _myInstance.module.addMeshTypesCallback(meshTypesResponseCallback());
      _myInstance.module.addCSGGui(_myInstance.container.find("#csgGui")[0]);
      _myInstance.module.addMeshUpdatedCallbacks(meshUpdatedCallback());
      _myInstance.module.addChangedCallback(scaffoldViewerChangedCallback());
      _myInstance.module.addMeshAllPartsDownloadedCallbacks(allPartsDownloadedCallbacks());
    }
  }
  
  initialise();
}

ScaffoldDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.ScaffoldDialog = ScaffoldDialog;

