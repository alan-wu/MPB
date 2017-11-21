PJP.CellPanel = function(PanelName)  {

	var cellGui = undefined;
	var otherCellControls = undefined;
	
	var _this = this;
	
	var cellControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	
	this.openCell = function() {
		document.getElementById("imageContainer").style.visibility = "visible";
	}
	
	var hideCell = function() {
		document.getElementById("imageContainer").style.visibility = "hidden";
	}
	
	this.setCellPanelTitle = function(text) {
		var titleDisplay = document.getElementById('CellTitle');
		titleDisplay.innerHTML = text;
	}
	
	var resetCellTitle = function() {
		var titleDisplay = document.getElementById('CellTitle');
		titleDisplay.innerHTML = "<strong>Cell<span style='color:#FF4444'>";
	}
	
	this.resetCellPanel = function() {
		hideCell();
		resetCellTitle();
	}
	
	var cellBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			document.getElementById("cellDisplayPort").style.backgroundColor = backgroundColourString;
		}
	}
	
	var initialiseCellPanel = function() {
		cellGui = new dat.GUI({autoPlace: false});
		cellGui.domElement.id = 'gui';
		cellGui.close();
		var control = new cellControl();
		var controller = cellGui.addColor(control, 'Background');
		controller.onChange(cellBackGroundChanged());
		otherCellControls = cellGui.addFolder('Others');
		var customContainer = document.getElementById("cellGui").append(cellGui.domElement);
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
			initialiseCellPanel();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/cellPanel.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}
	
	initialise();
	
}