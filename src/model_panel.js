var dat = require("./dat.gui.js");
require("./styles/dat-gui-swec.css");
require("./styles/my_styles.css");

/**
 * Provide a panel for viewing system models. Currently, this panel displays
 * bond graph of different system model in the form of interactive SVG diagram. Interactions with
 * the SVG is implemented in {@link SVGController}.
 * 
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.ModelPanel} on.
 * @class
 * 
 * @author Alan Wu
 * @returns {PJP.ModelPanel}
 */
var ModelPanel = function()  {
  (require('./BaseModule').BaseModule).call(this);
 	var runModelURL = undefined;
	var _this = this;
	var svgController= undefined;
	var targetSVGPanelElement = undefined;
	 _this.typeName = "Model Panel";
	/**
	 * Create and enable SVGController on the provided panelName, if no element with the id is found,
	 * try after loadHTMLComplete is completed.
	 *  
	 * @param {String} panelName - Id of the target element to create the  {@link PJP.SVGController} on.
	 */
	this.enableSVGController = function(SVGPanelElement) {
		if (svgController === undefined) {
		  targetSVGPanelElement = SVGPanelElement;
			if (targetSVGPanelElement != null)
				svgController = new (require('./svgController').SVGController)(targetSVGPanelElement);
		}
	}
	
	/**
	 * Display model with the provided name, this function also updates the "run simulation" link.
	 *  
	 * @param {String} svgName - name of the svg.
	 */
	this.openModel = function(svgName) {
		if (svgController) {
			svgController.loadSVG(svgName);
			if (svgName == "Myocyte_v6_Grouped.svg") {
				runModelURL = 'https://models.cellml.org/workspace/noble_1962/rawfile/c70f8962407db00673f1fdcac9f35a2593781c17/noble_1962.sedml';
			} else {
				runModelURL = 'https://models.physiomeproject.org/workspace/4ac/rawfile/99f626ad282c900cf3665f2119ab70f61ec2ba3c/Circulation_Model.sedml';
			}
		}
	}
	
	//Callback function for onclick event of "Run Simulation", it attempts to run the  cell models using OpenCOR
	this.runModel = function() {
		var opencorURL = 'opencor://openFile/' + runModelURL;
		window.open(opencorURL, '_self');
	}

	
	this.expandCollapseModels = function(source, portName) {
		if (svgController !== undefined)
			svgController.expandCollapse(source);
		expandCollapse(source, portName);
	}
	
	this.zoomIn = function(value) {
		if (svgController !== undefined)
			svgController.zoomIn(value);
	}
	
	this.zoomOut = function(value) {
		if (svgController !== undefined)
			svgController.zoomOut(value);
	}
	
	this.zoomReset = function() {
		if (svgController !== undefined)
			svgController.zoomReset();
	}
	
	/*
	var addUICallback = function() {
		var callbackElement = dialogObject.find("#modelsControllerButton")[0];
		callbackElement.onclick = function() { runModel() };
		callbackElement = dialogObject.find("#svgZoomOut")[0];
		callbackElement.onclick = function() { zoomOut(0.2); };
		callbackElement = dialogObject.find("#svgZoomReset")[0];
		callbackElement.onclick = function() { zoomReset(); };
		callbackElement = dialogObject.find("#svgZoomIn")[0];
		callbackElement.onclick = function() { zoomIn(0.2) };	
	}
	
	var initialiseModelPanel = function() {
		modelGui = new dat.GUI({autoPlace: false});
		modelGui.domElement.id = 'gui';
		modelGui.close();
		var control = new modelControl();
		var controller = modelGui.addColor(control, 'Background');
		controller.onChange(modelBackGroundChanged());
		otherModelControls = modelGui.addFolder('Others');

		if (targetSVGPanelName !== undefined && svgController === undefined)
			_this.enableSVGController(targetSVGPanelName);
	}
	
  var createNewDialog = function(data) {
    dialogObject = require("./utility").createDialogContainer(localDialogName, data);
    initialiseModelPanel();
    addUICallback();
    UIIsReady = true;
  }
    */
	
	
	
	
  /**
   * Initialise loading of the page, this is called when 
   * the {@link PJP.ModelPanel} is created.
   * @async
   */
  var initialise = function() {
  }
  
	initialise();
}

ModelPanel.prototype = Object.create((require('./BaseModule').BaseModule).prototype);
exports.ModelPanel = ModelPanel;
