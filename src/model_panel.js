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
exports.ModelPanel = function(DialogName)  {
	var modelGui = undefined;
	var otherModelControls = undefined;
	var runModelURL = undefined;
	var _this = this;
	var svgController= undefined;
	var targetSVGPanelName = undefined;
	var modelControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	var dialogObject = undefined;
	var localDialogName = DialogName;
	
	/**
	 * Create and enable SVGController on the provided panelName, if no element with the id is found,
	 * try after loadHTMLComplete is completed.
	 *  
	 * @param {String} panelName - Id of the target element to create the  {@link PJP.SVGController} on.
	 */
	this.enableSVGController = function(svgPanelName) {
		if (svgController === undefined) {
			targetSVGPanelName = svgPanelName;
			if (document.getElementById(targetSVGPanelName) != null)
				svgController = new (require('./svgController').SVGController)(targetSVGPanelName);
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
			dialogObject.find("#modelsController")[0].style.visibility = "visible";
			dialogObject.find("#modelsContainer")[0].style.visibility = "visible";
			if (svgName == "Myocyte_v6_Grouped.svg") {
				runModelURL = 'https://models.cellml.org/workspace/noble_1962/rawfile/c70f8962407db00673f1fdcac9f35a2593781c17/noble_1962.sedml';
			} else {
				runModelURL = 'https://models.physiomeproject.org/workspace/4ac/rawfile/99f626ad282c900cf3665f2119ab70f61ec2ba3c/Circulation_Model.sedml';
			}
		}
	}
	
	//Callback function for onclick event of "Run Simulation", it attempts to run the  cell models using OpenCOR
	var runModel = function() {
		var opencorURL = 'opencor://openFile/' + runModelURL;
		
		window.open(opencorURL, '_self');
	}

	var modelBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			dialogObject[0].style.backgroundColor = backgroundColourString;
		}
	}
	
	var expandCollapseModels = function(source, portName) {
		if (svgController !== undefined)
			svgController.expandCollapse(source);
		expandCollapse(source, portName);
	}
	
	var zoomIn = function(value) {
		if (svgController !== undefined)
			svgController.zoomIn(value);
	}
	
	var zoomOut = function(value) {
		if (svgController !== undefined)
			svgController.zoomOut(value);
	}
	
	var zoomReset = function() {
		if (svgController !== undefined)
			svgController.zoomReset();
	}
	
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
		var customContainer = dialogObject.find("#modelGui")[0].append(modelGui.domElement);
		if (targetSVGPanelName !== undefined && svgController === undefined)
			_this.enableSVGController(targetSVGPanelName);
	}
	
  var createNewDialog = function(data) {
    dialogObject = require("./utility").createDialogContainer(localDialogName, data);
    initialiseModelPanel();
    addUICallback();
    UIIsReady = true;
  }
    
  /**
   * Initialise loading of the page, this is called when 
   * the {@link PJP.ModelPanel} is created.
   * @async
   */
  var initialise = function() {
    createNewDialog(require("./snippets/modelPanel.html"));
  }
	
	initialise();
}