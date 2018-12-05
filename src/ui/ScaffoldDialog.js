/**
 * A customised dialog for body viewer.
 */
var ScaffoldDialog = function(scaffoldViewerIn) {
  (require('./BaseDialog').BaseDialog).call(this);
  var scaffoldViewer = scaffoldViewerIn;
  var modal = undefined;
  var optionsChanged = false;
  var _this = this;
  var guiControls = new function() {
    this['Mesh Types'] = "3d_heart1";
  };
  var meshParametersGui = undefined;
  var meshParametersGuiControls = undefined;
  var meshPartsGui = undefined;
  var meshPartsGuiControls = undefined;
  this.getModule = function() {
    return scaffoldViewer;
  }
  
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
      scaffoldViewer.changeBackgroundColour(backgroundColourString);
    }
  }
    
  var scaffoldViewerChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        _this.setTitle(module.getName());
      }
    }
  }
  
  var changeMeshTypeCallback = function() {
    scaffoldViewer.setMeshType(guiControls['Mesh Types']);
    scaffoldViewer.updateMesh();
  }
  
  var createMeshTypesChooser = function(meshTypes) {
    _this.datGui.add(guiControls, 'Mesh Types', meshTypes ).onChange(function(value) {
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
        scaffoldViewer.updateOption(key, meshParametersGuiControls[key]);
      }
    }
    scaffoldViewer.updateMesh();
  }

  var updateParametersOptions = function(options) {
    _this.datGui.removeFolder('Parameters');
    meshParametersGuiControls = function() {
    };
    meshParametersGui = _this.datGui.addFolder('Parameters');
    addOptions(options);
    var confirmButton = { 'Confirm':function(){ confirmPressed() }};
    meshParametersGui.add(confirmButton, 'Confirm');
  }
  
  var meshPartNameClickedCallback = function(groupName) {
    return function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      scaffoldViewer.setSelectedByGroupName(groupName, false);
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
          controller.onChange(scaffoldViewer.changePartVisibilityCallback(groupName));
          controller.__li.onmouseover = function() {scaffoldViewer.setHighlightedByGroupName(groupName, true);};
          span.onclick = meshPartNameClickedCallback(groupName);
        }
      }
    }
  }
  
  var updatePartGuiOptions = function() {
    _this.datGui.removeFolder('Regions');
    meshPartsGuiControls = function() {
    };
    meshPartsGui = _this.datGui.addFolder('Regions');
    meshPartsGui.open();
    if (scaffoldViewer.scene) {
      scaffoldViewer.scene.forEachGeometry(addPartGuiOptionsCallback()); 
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
    _this.addDatGui();
    _this.container.find("#meshGui")[0].appendChild(_this.datGui.domElement);
    var viewAllButton = { 'View All':function(){ scaffoldViewer.viewAll() }};
    var resetButton = { 'Reset':function(){ scaffoldViewer.resetView() }};
    var readButton = { 'Read':function(){ scaffoldViewer.readWorkspacePrompt() }};
    var commitButton = {'Commit':function() { scaffoldViewer.commitWorkspace() }};
    var pushButton = {'Push':function() { scaffoldViewer.pushWorkspace() }};
    _this.datGui.add(viewAllButton, 'View All');
    _this.datGui.add(resetButton, 'Reset');
    _this.datGui.add(readButton, 'Read');
    _this.datGui.add(commitButton, 'Commit');
    _this.datGui.add(pushButton, 'Push');
  }
  
  var _scaffoldViewerDialogClose = function() {
    return function(myDialog) {
      if (_this.destroyModuleOnClose) {
        scaffoldViewer.destroy();
        scaffoldViewer = undefined;
      }
    }
  }
    
  var initialise = function() {
    if (scaffoldViewer) {
      _this.create(require("../snippets/ScaffoldDialog.html"));
      modal = new (require('./Modal').PortalModal)(
      _this.container.find(".portalmodal")[0]);
      var name = scaffoldViewer.getName();
      _this.setTitle(name);
      var displayArea = _this.container.find("#scaffoldDisplayArea")[0];
      scaffoldViewer.initialiseRenderer(displayArea);
      initialiseScaffoldControlUI();
      scaffoldViewer.alertFunction = modal.alert;
      scaffoldViewer.promptFunction = modal.prompt;
      scaffoldViewer.confirmFunction = modal.confirm;
      var meshTypes = scaffoldViewer.getAvailableMeshTypes();
      if (meshTypes)
        createMeshTypesChooser(meshTypes);
      else
        scaffoldViewer.addMeshTypesCallback(meshTypesResponseCallback());
      scaffoldViewer.addCSGGui(_this.container.find("#csgGui")[0]);
      scaffoldViewer.addMeshUpdatedCallbacks(meshUpdatedCallback());
      scaffoldViewer.addChangedCallback(scaffoldViewerChangedCallback());
      scaffoldViewer.addMeshAllPartsDownloadedCallbacks(allPartsDownloadedCallbacks());
      _this.onCloseCallbacks.push(_scaffoldViewerDialogClose());
    }
  }
  
  initialise();
}

ScaffoldDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.ScaffoldDialog = ScaffoldDialog;

