var PJP = { VERSION: '0.1' };
var currentHoverId = -1;

PJP.ITEM_LOADED = { FALSE: -1, DOWNLOADING: 0, TRUE: 1 };

PJP.setupRenderer = function (elementID) {
	var localContainer = document.createElement( 'div' );
	document.getElementById(elementID).appendChild( localContainer );
	localContainer.style.height = "100%"
	var localRenderer = new Zinc.Renderer(localContainer, window);
	Zinc.defaultMaterialColor = 0xFFFF9C
	localRenderer.initialiseVisualisation();
	localRenderer.playAnimation = false;	
	return localRenderer;
}

var showTooltip = function(x, y) {
	tooltipcontainerElement.style.left = x +"px";
	tooltipcontainerElement.style.top = (y - 20) + "px";
	tipElement.style.visibility = "visible";
	tipElement.style.opacity = 1;
	tiptextElement.style.visibility = "visible";
	tiptextElement.style.opacity = 1;
}

var hideTooltip = function() {
	currentHoverId = -1;
	tipElement.style.visibility = "hidden";
	tipElement.style.opacity = 0;
	tiptextElement.style.visibility = "hidden";
	tiptextElement.style.opacity = 0;
}

var toggleSplitDisplay = function(displayStyle) {
	var portArrays = ["bodyDisplayPort", "organsDisplayPort", "tissueDisplayPort", "cellDisplayPort", "modelDisplayPort"];
	for (var i = 0; i < portArrays.length; i++) {
		var portElement = document.getElementById(portArrays[i]);
		portElement.className = portArrays[i] + "Collapse";
		portElement.style.display = displayStyle;
	}
}

var expandCollapse = function(source, portName) {
	if (source.value=="Expand") {
		source.value = "Collapse";
		toggleSplitDisplay("none");
		var portElement = document.getElementById(portName);
		portElement.className = "fullPortDisplay";
		portElement.style.display = "block";
	}
	else { 
		source.value = "Expand";
		toggleSplitDisplay("block");
	}

}
