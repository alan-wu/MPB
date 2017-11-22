var svgRightClickDown = false;

var svgLayoutCallbacksElement = new Array();
svgLayoutCallbacksElement["Sodium_button"] = "Sodium";
svgLayoutCallbacksElement["Potassium_button"] = "Potassium";
svgLayoutCallbacksElement["Chloride_button"] = "Chloride";
svgLayoutCallbacksElement["Hydrogen_button"] = "Hydrogen";
svgLayoutCallbacksElement["Calcium_button"] = "Calcium";
svgLayoutCallbacksElement["Anion_button"] = "Anion";
svgLayoutCallbacksElement["Metabolism_button"] = "Metabolism";

var svgIonChannelCallbackElement = new Array();
svgIonChannelCallbackElement["v1_button"] = "v1_expression";

var svgCannelExpressionCallbackElement = new Array();
svgCannelExpressionCallbackElement["v1_expression"] = " https://models.physiomeproject.org/e/430/sodium_ion_channel.cellml/view";

var svgElementClassToggle = function(svgElementId, svgClassName) {
	  var object = document.getElementById(svgElementId);
	  var svgDocument = object.contentDocument;
	  var svgElement = svgDocument.getElementsByClassName(svgClassName);
	  console.log(svgElement[0].style.visibility);
	  if (svgElement[0].style.visibility == "hidden") {
		  svgElement[0].style.visibility = "";
	  } else {
		  svgElement[0].style.visibility = "hidden";
	  }
}

var svgElementIdToggle = function(svgElementId, id) {
	  var object = document.getElementById(svgElementId);
	  var svgDocument = object.contentDocument;
	  var svgElement = svgDocument.getElementById(id);
	  if (svgElement.style.visibility == "hidden") {
		  svgElement.style.visibility = "visible";
	  } else {
		  svgElement.style.visibility = "hidden";
	  }
}

var currentZoom = 1.0;

var svgZoom = function() {
	 var object = document.getElementById("testsvg");
	 var heightZoom = 90 *currentZoom;
	 var widthZoom = 100 *currentZoom;
	 var heightString = heightZoom + "%";
	 var widthString = widthZoom + "%";
	 object.style.height = heightString;
	 object.style.width = widthString;
}

var svgZoomIn = function(ratio) {
	currentZoom = currentZoom + ratio;
	svgZoom();
}

var svgZoomOut = function(ratio) {
	currentZoom = currentZoom - ratio;
	svgZoom();
}

var resetZoom = function() {
	currentZoom = 1.0;
	var object = document.getElementById("testsvg");
	object.style.height = "90%";
	object.style.width = "100%";
}

var onSVGScrollEvent = function(event) {
		console.log(event)
		if (event.deltaY > 0) {
			svgZoomIn(0.1);
		} else if (event.deltaY < 0) {
			svgZoomOut(0.1);
		}
		event.preventDefault(); 
		event.stopPropagation();
		event.stopImmediatePropagation(); 
}

function onSVGMouseDown( event ) {
   	if (event.button == 2) {
   		svgRightClickDown = true;
   		event.preventDefault();
   		event.stopImmediatePropagation(); 
    } else {
    	svgRightClickDown = false;
    }
}

function onSVGMouseMove( event ) {
	if (svgRightClickDown == true) {
		targetElement = document.getElementById("modelsContainer");
		targetElement.scrollTop += event.movementY;
		targetElement.scrollLeft -= event.movementX;
	}
}

function onSVGMouseUp( event ) {
   	if (event.button == 2) {
   		event.preventDefault();
   		event.stopPropagation();
   		event.stopImmediatePropagation(); 
    }
	svgRightClickDown = false;
}

function onSVGMouseLeave( event ) {
	svgRightClickDown = false;
}

function enableSVGMouseInteraction(targetElement) {
	if (targetElement.addEventListener) {
		targetElement.addEventListener( 'mousedown', onSVGMouseDown, false );
		targetElement.addEventListener( 'mousemove', onSVGMouseMove, false );
		targetElement.addEventListener( 'mouseup', onSVGMouseUp, false );
		targetElement.addEventListener( 'mouseleave', onSVGMouseLeave, false );
		targetElement.oncontextmenu = function() { return false;};
		targetElement.addEventListener( 'wheel', function ( event ) { onSVGScrollEvent(event); }, true);
    }
}

function disableSVGMouseInteraction(targetElement) {
	if (targetElement.removeEventListener) {
		targetElement.removeEventListener( 'mousedown', onSVGMouseDown, false );
		targetElement.removeEventListener( 'mousemove', onSVGMouseMove, false );
		targetElement.removeEventListener( 'mouseup', onSVGMouseUp, false );
		targetElement.removeEventListener( 'mouseleave', onSVGMouseLeave, false );
		targetElement.removeEventListener( 'oncontextmenu', function() { return false;}, false);
		targetElement.oncontextmenu = function() { return true;};
		targetElement.removeEventListener( 'wheel', function ( event ) { onSVGScrollEvent(event); }, true);
    }
}

var expandSVGCollapse = function(source, portName) {
	if (source.value=="Expand") {
		var targetelement = document.getElementById("testsvg").contentDocument;
		enableSVGMouseInteraction(targetelement);
		targetelement = document.getElementById("modelsContainer");
		enableSVGMouseInteraction(targetelement);
	} else {
		var targetelement = document.getElementById("testsvg").contentDocument;
		disableSVGMouseInteraction(targetelement);
		targetelement = document.getElementById("modelsContainer");
		disableSVGMouseInteraction(targetelement);
	}
	expandCollapse(source, portName);
	resetZoom();
	for (var key in svgLayoutCallbacksElement) {
		if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
			svgElementIdToggle("testsvg",key);
		}
	}
}

var svgToggleClicked = function(svgElementId, gName) {
	return function() {
		svgElementIdToggle(svgElementId, gName);
	}
}

var svgLinkClicked = function(link) {
	return function() {
		window.open(link,'_blank');
	}
}

var addRespsonseToSVGElements = function(svgElementId) {
	var object = document.getElementById(svgElementId);
	var svgDocument = object.contentDocument;
	for (var key in svgLayoutCallbacksElement) {
		if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
			var svgElement = svgDocument.getElementById(key);
			if (svgElement) {
				svgElement.style.cursor = "pointer";
				svgElement.addEventListener('click', svgToggleClicked(svgElementId, svgLayoutCallbacksElement[key] + "_layer"));
			}
		}
	}
	for (var key in svgIonChannelCallbackElement) {
		if (svgIonChannelCallbackElement.hasOwnProperty(key)) {
			var svgElement = svgDocument.getElementById(key);
			if (svgElement) {
				svgElement.style.cursor = "pointer";
				svgElement.addEventListener('click', svgToggleClicked(svgElementId, svgIonChannelCallbackElement[key]));
			}
		}
	}
	for (var key in svgCannelExpressionCallbackElement) {
		if (svgCannelExpressionCallbackElement.hasOwnProperty(key)) {
			var svgElement = svgDocument.getElementById(key);
			if (svgElement) {
				svgElement.style.cursor = "pointer";
				svgElement.addEventListener('click', svgLinkClicked(svgCannelExpressionCallbackElement[key]));
			}
		}
	}
}

var svgLoaded = function() {
	for (var key in svgLayoutCallbacksElement) {
		if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
			svgElementIdToggle("testsvg", key);
		}
	}
	for (var key in svgCannelExpressionCallbackElement) {
		if (svgCannelExpressionCallbackElement.hasOwnProperty(key)) {
			svgElementIdToggle("testsvg", key);
		}
	}
	addRespsonseToSVGElements('testsvg');
}
