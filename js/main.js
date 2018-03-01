var toggleSplitDisplay = function(displayStyle) {
	var portArrays = ["bodyDisplayPort", "organsDisplayPort", "tissueDisplayPort", "cellDisplayPort", "modelDisplayPort"];
	for (var i = 0; i < portArrays.length; i++) {
		var portElement = document.getElementById(portArrays[i]);
		if (portElement) {
			portElement.className = portArrays[i] + "Collapse";
			portElement.style.display = displayStyle;
		}
	}
}

PJP.Main = function()  {
	var bodyViewer = undefined;
	var organsViewer = undefined;
	var tissueViewer = undefined;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var modelsLoader = undefined;
	var UIIsReady = true;
	var _this = this;
	this.DOM = [];
	
	var systemMetaReadyCallback = function() {
		return function() {
			bodyViewer.readSystemMeta();
		}
	}
	
	var initialiseMain = function() {
		modelsLoader = new PJP.ModelsLoader();
		bodyViewer = new PJP.BodyViewer(modelsLoader, "bodyDisplayPort");
		organsViewer = new PJP.OrgansViewer(modelsLoader, "organsDisplayPort");
		tissueViewer = new PJP.TissueViewer("tissueDisplayPort");
		cellPanel = new PJP.CellPanel("cellDisplayPort");
		modelPanel = new PJP.ModelPanel("modelDisplayPort");
		modelsLoader.addSystemMetaIsReadyCallback(systemMetaReadyCallback());
		modelsLoader.initialiseLoading();
		bodyViewer.setOrgansViewer(organsViewer);
		organsViewer.setTissueViewer(tissueViewer);
		organsViewer.setCellPanel(cellPanel);
		organsViewer.setModelPanel(modelPanel);
		tissueViewer.setCellPanel(cellPanel);
		tissueViewer.setModelPanel(modelPanel);
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.body;
			var childNodes = null;
			if (link.import.body !== undefined)
				childNodes = link.import.body.childNodes;
			else if (link.childNodes !== undefined)
				childNodes = link.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			initialiseMain();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/main.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}

	initialise();
}

var main = new PJP.Main();
