/**
 * Provides a global namespace for the physiome journey portal and some utilties functions for it.
 * 
 * @namespace
 * @author Alan Wu
 * @returns {PJP.ModelsLoader}
 */
var PJP = { VERSION: '0.1' };
var currentHoverId = -1;
var tooltipcontainerElement = undefined;
var tipElement = undefined;
var tiptextElement = undefined;

PJP.ITEM_LOADED = { FALSE: -1, DOWNLOADING: 0, TRUE: 1 };


/**
 * Create a {@link Zinc.Renderer} on the dom element with corresponding elementID.
 * @param {String} elementID - id of the target dom element.
 * @returns {Zinc.Renderer}
 */
PJP.setupRenderer = function (elementID) {
	var localContainer = document.createElement( 'div' );
	document.getElementById(elementID).appendChild( localContainer );
	localContainer.style.height = "100%"
	var localRenderer = new Zinc.Renderer(localContainer, window);
	Zinc.defaultMaterialColor = 0xFFFF9C;
	localRenderer.initialiseVisualisation();
	localRenderer.playAnimation = false;	
	return localRenderer;
}

/**
 * Find the {@link CSSStyleRule} with the provided css sheet title and selector name.
 * @param {String} sheetTitle - Style sheet with the same title.
 * @param {String} selectorText - selector string to match.
 * @returns {CSSStyleRule}
 */
var findCSSRule = function(sheetTitle, selectorText) {
	for (var i = 0; i < document.styleSheets.length; i++ ) {
		if (document.styleSheets[i].title === sheetTitle) {
			var cssRules = document.styleSheets[i].cssRules || document.styleSheets[n].rules;
			for (var n = 0; n < cssRules.length; n++ ) {
				if (cssRules[n].selectorText === selectorText)
					return cssRules[n];
			}
		}
	}
}

/**
 * Show tool tip on the specified windows coordinates.
 * @param {Number} x - Style sheet with the same title.
 * @param {Number} y - selector string to match.
 */
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

/**
 * Change the tooltip text.
 * @param {String} text - Text to update the tooltip to.
 */
var setToolTipText = function(text) {
	tiptextElement.innerHTML = text;
}

var previousSource = undefined;

var resetExpandButton = function() {
	if (previousSource !== undefined)
		previousSource.value = "Expand";
	previousSource = undefined;
}

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

/**
 * This will expand/collapse according to the current state of the target panel.
 * 
 * @param {String} source - source Expand/Collapse button, used to check current state.
 * @param {String} portid - id of the div element to expand/collapse.
 */
var expandCollapse = function(source, portid) {
	if (source.value=="Expand") {
		toggleSplitDisplay("none");
		var portElement = document.getElementById(portid);
		portElement.className = "fullPortDisplay";
		portElement.style.display = "block";
		source.value = "Collapse";
		previousSource = source;
	}
	else {
		toggleSplitDisplay("block");
		source.value = "Expand";
	}
}

loadToolTipHTMLComplete = function(link) {
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
		tooltipcontainerElement = document.getElementById('tooltipcontainer');
		tipElement = document.getElementById('tip');
		tiptextElement = document.getElementById('tiptext');
		document.head.removeChild(link);
	}
}

PJP.setupToolTipContainer = function() {
	var link = document.createElement('link');
	link.rel = 'import';
	link.href = 'snippets/toolTip.html';
	link.onload = loadToolTipHTMLComplete(link);
	link.onerror = loadToolTipHTMLComplete(link);
	document.head.appendChild(link);	
}

PJP.setupToolTipContainer();
