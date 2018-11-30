/**
 * A customised dialog for body viewer.
 */
var BodyViewerDialog = function(bodyViewerIn) {
  (require('./BaseDialog').BaseDialog).call(this);
  var bodyViewer = bodyViewerIn;
  var systemGuiFolder = new Array();
  var systemPartsGuiControls = new Array();
  var _myInstance = this;
    
  this.getModule = function() {
    return bodyViewer;
  }
  
  //Array of settings of the body viewer gui controls.
  var bodyControl = function() {
      this.Background = [ 255, 255, 255 ]; // RGB array
  }
  

  var bodyBackGroundChanged = function() {
    return function(value) {
      var redValue = parseInt(value[0]);
      var greenValue = parseInt(value[1]);
      var blueValue = parseInt(value[2]);
      var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
      bodyViewer.changeBackgroundColour(backgroundColourString);
    }
  }
  
  /**
   * Update the style of the system buttons
   */
  var updateSystemButtons = function(systemName, value, isPartial) {
    var name = "[id='" + systemName + "']";
    var element = _myInstance.container.find(name)[0];
    
    if (value == true)
      element.className = "w3-circle systemToggleButton systemToggleButtonOn";
    else {
      if (isPartial)
        element.className = "w3-circle systemToggleButton systemToggleButtonPartial";
      else
        element.className = "w3-circle systemToggleButton systemToggleButtonOff";
    }
  }
  
  /**
   * Toggle visibility for the specified system
   */
  var toggleSystem = function(systemName, value) {
    systemPartsGuiControls[systemName]["All"] = value;
    for (var partName in systemPartsGuiControls[systemName]) {
      if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
        if (systemPartsGuiControls[systemName][partName] != value) {
          systemPartsGuiControls[systemName][partName] = value;
          bodyViewer.changeBodyPartsVisibility(partName, systemName, value);
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

  /**
   * Callback function when system buttons are pressed.
   */
  var systemButtonPressCallback = function(element) {
    return function() {
      var systemName = element.id;
      toggleSystem(systemName, !(systemPartsGuiControls[systemName]["All"]));
    }
  }
  
  var toggleSystemCallback = function(systemName) {
    return function(value) { 
      toggleSystem(systemName, value);
    }
  }
  
  var bodyPartsVisibilityChanged = function(name, systemName) {
    return function(value) {
      bodyViewer.changeBodyPartsVisibility(name, systemName, value);
      var isPartial = false;
      if (value == false) {
        systemPartsGuiControls[systemName].All = false;
        for (var partName in systemPartsGuiControls[systemName]) {
          if (partName != "All" && systemPartsGuiControls[systemName].hasOwnProperty(partName)) {
            if (systemPartsGuiControls[systemName][partName] == true) {
              isPartial = true;
              break;
            }
          }
        }
        //updateSystemButtons(systemName, false, isPartial);
      } else {
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
      updateSystemPartController(systemName, "All");
    }
  }
  
  var updateSystemPartController = function(systemName, partName) {
    for (var i = 0; i < systemGuiFolder[systemName].__controllers.length; i++) {
      if (systemGuiFolder[systemName].__controllers[i].property == partName) {
        systemGuiFolder[systemName].__controllers[i].updateDisplay();
        systemGuiFolder[systemName].__controllers[i].__prev = 
          systemGuiFolder[systemName].__controllers[i].__checkbox.checked;
        return;
      }
    }
  }
  
  var systemGuiFolderHasPartControls = function(systemName, partName) {
    for (var i = 0; i < systemGuiFolder[systemName].__controllers.length; i++) {
      if (systemGuiFolder[systemName].__controllers[i].property == partName) {
        return true;
      }
    }
    return false;
  }
  
  var bodyPartNameClickedCallback = function(partName) {
    return function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      bodyViewer.setSelectedByGroupName(partName, true);
    } 
  }
  
  var addPartToSystemControl = function(systemName, partName) {
    var controller = systemGuiFolder[systemName].add(systemPartsGuiControls[systemName], partName);
    var span = controller.__li.getElementsByTagName("span")[0];
    controller.onChange(bodyPartsVisibilityChanged(partName, systemName));
    controller.__li.onmouseover = function() {bodyViewer.setHighlightedByGroupName(partName, true);};
    span.onclick = bodyPartNameClickedCallback(partName);
  }
  
  var addSystemPartGui = function(systemName, partName, visible) {
    if (systemName) {
      if (systemGuiFolder[systemName] !== undefined &&
        systemPartsGuiControls.hasOwnProperty(systemName)) {
        systemPartsGuiControls[systemName][partName] = visible;
        if (!systemGuiFolderHasPartControls(systemName, partName)) {
          addPartToSystemControl(systemName, partName);
        } else {
          updateSystemPartController(systemName, partName);
        }
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
          updateSystemPartController(systemName, "All");
        }
      }
    }
  }

  var systemPartAddedCallback = function() {
    return function(systemName, partName, visible) {
      addSystemPartGui(systemName, partName, visible);
    }
  }
  
  /** 
   * This method add all system folders to the dat.gui user interface.
   */
  var addSystemFolders = function() {
    var systemList = bodyViewer.getSystemList();
    for (var i = 0; i < systemList.length; i++) {
      var currentSystem = systemList[i];
      systemGuiFolder[currentSystem] = _myInstance.datGui.addFolder(currentSystem);
      systemGuiFolder[currentSystem].close();
      systemPartsGuiControls[currentSystem] = function() {};
      systemPartsGuiControls[currentSystem]["All"] = false;
      systemGuiFolder[currentSystem].add(
        systemPartsGuiControls[currentSystem], "All").onChange(toggleSystemCallback(currentSystem));
    }
  }
  
  
  /**
   * Add UI callbacks after html page has been loaded.
   */
  var addUICallback = function() {
    var callbackContainer = _myInstance.container.find("#systemToggle")[0];
    var inputs, index;
    inputs = callbackContainer.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; ++i) {
      inputs[i].onclick = systemButtonPressCallback(inputs[i]); 
    }
    var speciesSelected = _myInstance.container.find("#bodySpeciesSelect")[0];
    speciesSelected.onchange = function() { bodyViewer.changeSpecies(speciesSelected.value) };
  }
  
  var initialiseBodyControlUI = function() {
    addUICallback();
    _myInstance.addDatGui();
    var control = new bodyControl();
    var controller = _myInstance.datGui.addColor(control, 'Background');
    controller.onChange(bodyBackGroundChanged());
    _myInstance.container.find("#bodyGui")[0].appendChild(_myInstance.datGui.domElement);
    var resetViewButton = { 'Reset View':function(){ bodyViewer.resetView() }};
    var viewAllButton = { 'View All':function(){ bodyViewer.viewAll() }};
    _myInstance.datGui.add(resetViewButton, 'Reset View');
    _myInstance.datGui.add(viewAllButton, 'View All');
    addSystemFolders();
    bodyViewer.forEachPartInBody(systemPartAddedCallback());
    bodyViewer.addSystemPartAddedCallback(systemPartAddedCallback());
  }
  
  var _bodyViewerDialogClose = function() {
    return function(myDialog) {
      if (_myInstance.destroyModuleOnClose) {
        bodyViewer.destroy();
        bodyViewer = undefined;
      }
    }
  }
  
  var bodyViewerChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        _myInstance.setTitle(module.getName());
      }
    }
  }
    
  var initialise = function() {
    if (bodyViewer) {
      _myInstance.create(require("../snippets/bodyViewer.html"));
      var name = bodyViewer.getName();
      _myInstance.setTitle(name);
      initialiseBodyControlUI();
      var displayArea = _myInstance.container.find("#bodyDisplayArea")[0];
      bodyViewer.initialiseRenderer(displayArea);
      bodyViewer.addChangedCallback(bodyViewerChangedCallback());
      _myInstance.onCloseCallbacks.push(_bodyViewerDialogClose());
    }
  }
  
  initialise();
}

BodyViewerDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.BodyViewerDialog = BodyViewerDialog;
