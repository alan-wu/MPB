/**
 * Used for viewing cell model. This currently contains an image.
 * 
 * @param {String} PanelName - Id of the target element to create the  {@link PJP.CellPanel} on.
 * @class
 * 
 * @author Alan Wu
 * @returns {PJP.CellPanel}
 */
PJP.CellPanel = function(DialogName)  {

	//dat.gui container for cellGui
	var cellGui = undefined;
	var otherCellControls = undefined;
	var dialogObject = undefined;
	var localDialogName = DialogName;
	
	var _this = this;
	
	var cellControl = function() {
		  this.Background = [ 255, 255, 255 ]; // RGB array
	};
	
	/**
	 * Display cell model image in the {@link PJP.CellPanel}.
	 */
	this.openCell = function() {
		dialogObject.find("#imageContainer")[0].style.visibility = "visible";
	}
	
	/**
	 * Hide cell model image in the {@link PJP.CellPanel}.
	 */
	var hideCell = function() {
		dialogObject.find("#imageContainer")[0].style.visibility = "hidden";
	}
	
	/**
	 * Set the title string for {@link PJP.CellPanel}.
	 * @param {String} text - Cell panel title to be set.
	 */
	this.setCellPanelTitle = function(text) {
	  console.log("Fix setCellPanelTitle");
		//var titleDisplay = document.getElementById('CellTitle');
		//titleDisplay.innerHTML = text;
	}
	
	var resetCellTitle = function() {
	  console.log("Fix resetCellTitle");
		//var titleDisplay = document.getElementById('CellTitle');
		//titleDisplay.innerHTML = "<strong>Cell<span style='color:#FF4444'>";
	}
	
	/**
	 * Reset the title of cell panel. 
	 */
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
			dialogObject[0].style.backgroundColor = backgroundColourString;
		}
	}
	
	/**
	 * Initialise loading of the page, this is called when 
	 * the {@link PJP.CellPanel} is created.
	 * @async
	 */
	var initialiseCellPanel = function() {
		cellGui = new dat.GUI({autoPlace: false});
		cellGui.domElement.id = 'gui';
		cellGui.close();
		var control = new cellControl();
		var controller = cellGui.addColor(control, 'Background');
		controller.onChange(cellBackGroundChanged());
		otherCellControls = cellGui.addFolder('Others');
		var customContainer = dialogObject.find("#cellGui")[0].append(cellGui.domElement);
	}
	
  var createNewDialog = function(link) {
    dialogObject = PJP.createDialogContainer(localDialogName, link);
    initialiseCellPanel();
    UIIsReady = true;
  }
  
  var loadHTMLComplete = function(link) {
    return function(event) {
      link.isReady = true;
      createNewDialog(link);
    }
  }
	
	
	 var initialise = function() {
     var link = document.getElementById("cellSnippet");
      if (link == undefined) {
        link = document.createElement('link');
        link.id = "cellSnippet";
        link.rel = 'import';
        link.href = 'snippets/cellPanel.html';
        link.onload = loadHTMLComplete(link);
        link.onerror = loadHTMLComplete(link);
        document.head.appendChild(link);
      } else if (link.isReady !== true) {
        setTimeout(function(){initialise()}, 500);
      } else {
        createNewDialog(link);
      }
  }
	
	initialise();
	
}