/**
 * Used for displaying bond graph model.
 * 
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.ModelPanel} on.
 * @class
 * 
 * @author Alan Wu
 * @returns {PJP.ModelPanel}
 */
PJP.ModelPanel = function(PanelName)  {
	var modelGui = undefined;
	var otherModelControls = undefined;
	var runModelURL = undefined;
	var _this = this;
	var svgController= undefined;
	var targetSVGPanelName = undefined;
	var modelControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	
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
				svgController = new PJP.SVGController(targetSVGPanelName);
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
			document.getElementById("modelsController").style.visibility = "visible";
			document.getElementById("modelsContainer").style.visibility = "visible";
			if (svgName == "Myocyte_v6_Grouped.svg") {
				runModelURL = 'https://models.cellml.org/workspace/noble_1962/rawfile/c70f8962407db00673f1fdcac9f35a2593781c17/noble_1962.sedml';
			} else {
				runModelURL = 'https://models.physiomeproject.org/workspace/4ac/rawfile/99f626ad282c900cf3665f2119ab70f61ec2ba3c/Circulation_Model.sedml';
			}
		}
	}
	
	//open run simulation link and run attempt to run it with OpenCOR
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
			document.getElementById("modelDisplayPort").style.backgroundColor = backgroundColourString;
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
		var callbackElement = document.getElementById("modelsControllerButton");
		callbackElement.onclick = function() { runModel() };
		var modelsScreenButton = document.getElementById("modelsScreenButton");
		modelsScreenButton.onclick = function() { expandCollapseModels(modelsScreenButton,
			'modelDisplayPort') };
		callbackElement = document.getElementById("svgZoomOut");
		callbackElement.onclick = function() { zoomOut(0.2); };
		callbackElement = document.getElementById("svgZoomReset");
		callbackElement.onclick = function() { zoomReset(); };
		callbackElement = document.getElementById("svgZoomIn");
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
		var customContainer = document.getElementById("modelGui").append(modelGui.domElement);
		if (targetSVGPanelName !== undefined && svgController === undefined)
			_this.enableSVGController(targetSVGPanelName);
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.getElementById(PanelName);
			var childNodes = null;
			if (link.import.body !== undefined)
				childNodes = link.import.body.childNodes;
			else if (link.childNodes !== undefined)
				childNodes = link.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			initialiseModelPanel();
			addUICallback();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	/**
	 * Initialise loading of the page, this is called when 
	 * the {@link PJP.ModelPanel} is created.
	 * @async
	 */
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/modelPanel.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}
	
	initialise();

}