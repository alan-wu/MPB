/**
 * A customised dialog for model panel.
 */
var ModelViewerDialog = function(modelPanelIn) {
  (require('./BaseDialog').BaseDialog).call(this);
  var modelPanel = modelPanelIn;
  var otherModelControls = undefined;
  var modelControl = function() {
    this.Background = [ 255, 255, 255 ]; // RGB array
  };

  var _myInstance = this;
  
  var modelBackGroundChanged = function() {
    return function(value) {
      var redValue = parseInt(value[0]);
      var greenValue = parseInt(value[1]);
      var blueValue = parseInt(value[2]);
      var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
      _myInstance.container[0].style.backgroundColor = backgroundColourString;
    }
  }
  
  this.getModule = function() {
    return modelPanel;
  }

  var addUICallback = function() {
    var callbackElement = _myInstance.container.find("#modelsControllerButton")[0];
    callbackElement.onclick = function() { modelPanel.runModel() };
    callbackElement = _myInstance.container.find("#svgZoomOut")[0];
    callbackElement.onclick = function() { modelPanel.zoomOut(0.2); };
    callbackElement = _myInstance.container.find("#svgZoomReset")[0];
    callbackElement.onclick = function() { modelPanel.zoomReset(); };
    callbackElement = _myInstance.container.find("#svgZoomIn")[0];
    callbackElement.onclick = function() { modelPanel.zoomIn(0.2) }; 
  }
  
  var initialiseModelControlUI = function() {
    addUICallback();
    _myInstance.addDatGui();
    var control = new modelControl();
    var controller = _myInstance.datGui.addColor(control, 'Background');
    controller.onChange(modelBackGroundChanged());
    _myInstance.container.find("#modelGui")[0].appendChild(_myInstance.datGui.domElement);
    otherModelControls = _myInstance.datGui.addFolder('Others');
  }
  
  var _modelViewerDialogClose = function() {
    return function(myDialog) {
      if (_myInstance.destroyModuleOnClose) {
        modelPanel.destroy();
        modelPanel = undefined;
      }
    }
  }
  
  var modelPanelChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        _myInstance.setTitle(module.getName());
      }
    }
  }

  var initialise = function() {
    if (modelPanel) {
      _myInstance.create(require("../snippets/modelPanel.html"));
      var name = modelPanel.getName();
      _myInstance.setTitle(name);
      initialiseModelControlUI();
      var svgElement = _myInstance.container.find("#testsvg")[0];
      modelPanel.enableSVGController(svgElement);
      modelPanel.addChangedCallback(modelPanelChangedCallback());
      _myInstance.onCloseCallbacks.push(_modelViewerDialogClose());
    }
  }
  
  initialise();
}

ModelViewerDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.ModelViewerDialog = ModelViewerDialog;
