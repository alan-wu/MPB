/**
 * Viewer of the SVG diagram. It will also add callbacks to the svg elements and other controls if
 * they are present on the SVG.
 * 
 * @class
 * @param {String} SVGPanelName - Id of the target element for this {@link PJP.SVGController} to control.
 * @author Alan Wu
 * @returns {PJP.SVGController}
 */
PJP.SVGController = function(SVGPanelName)  {
	var svgObject = document.getElementById(SVGPanelName);
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
	
	var _this = this;
	
	var svgElementClassToggle = function(svgClassName) {
		  var svgDocument = svgObject.contentDocument;
		  var svgElement = svgDocument.getElementsByClassName(svgClassName);
		  console.log(svgElement[0].style.visibility);
		  if (svgElement[0].style.visibility == "hidden") {
			  svgElement[0].style.visibility = "";
		  } else {
			  svgElement[0].style.visibility = "hidden";
		  }
	}
	
	var svgElementIdToggle = function(id) {
		  var svgDocument = svgObject.contentDocument;
		  var svgElement = svgDocument.getElementById(id);
		  if (svgElement.style.visibility == "hidden") {
			  svgElement.style.visibility = "visible";
		  } else {
			  svgElement.style.visibility = "hidden";
		  }
	}
	
	var currentZoom = 1.0;
	
	var svgZoom = function() {
		 var heightZoom = 90 *currentZoom;
		 var widthZoom = 100 *currentZoom;
		 var heightString = heightZoom + "%";
		 var widthString = widthZoom + "%";
		 svgObject.style.height = heightString;
		 svgObject.style.width = widthString;
	}
	
	this.zoomIn = function(ratio) {
		currentZoom = currentZoom + ratio;
		svgZoom();
	}
	
	this.zoomOut = function(ratio) {
		currentZoom = currentZoom - ratio;
		svgZoom();
	}
	
	this.zoomReset = function() {
		currentZoom = 1.0;
		svgObject.style.height = "90%";
		svgObject.style.width = "100%";
	}
	
	var onSVGScrollEvent = function(event) {
			if (event.deltaY > 0) {
				_this.zoomIn(0.1);
			} else if (event.deltaY < 0) {
				_this.zoomOut(0.1);
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
	
	this.expandCollapse = function(source) {
		if (source.value=="Expand") {
			var targetelement = svgObject.contentDocument;
			enableSVGMouseInteraction(targetelement);
			targetelement = document.getElementById("modelsContainer");
			enableSVGMouseInteraction(targetelement);
		} else {
			var targetelement = svgObject.contentDocument;
			disableSVGMouseInteraction(targetelement);
			targetelement = document.getElementById("modelsContainer");
			disableSVGMouseInteraction(targetelement);
		}
		_this.zoomReset();
		for (var key in svgLayoutCallbacksElement) {
			if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
				svgElementIdToggle(key);
			}
		}
	}
	
	var svgToggleClicked = function(gName) {
		return function() {
			svgElementIdToggle(gName);
		}
	}
	
	var svgLinkClicked = function(link) {
		return function() {
			window.open(link,'_blank');
		}
	}
	
	var addRespsonseToSVGElements = function() {
		var svgDocument = svgObject.contentDocument;
		for (var key in svgLayoutCallbacksElement) {
			if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
				var svgElement = svgDocument.getElementById(key);
				if (svgElement) {
					svgElement.style.cursor = "pointer";
					svgElement.addEventListener('click', svgToggleClicked(svgLayoutCallbacksElement[key] + "_layer"));
				}
			}
		}
		for (var key in svgIonChannelCallbackElement) {
			if (svgIonChannelCallbackElement.hasOwnProperty(key)) {
				var svgElement = svgDocument.getElementById(key);
				if (svgElement) {
					svgElement.style.cursor = "pointer";
					svgElement.addEventListener('click', svgToggleClicked(svgIonChannelCallbackElement[key]));
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
	
	/**
	 * SVG diagram has been loaded, add svg callbacks and actions.
	 * @async
	 */
	var svgLoaded = function() {
		for (var key in svgLayoutCallbacksElement) {
			if (svgLayoutCallbacksElement.hasOwnProperty(key)) {
				svgElementIdToggle(key);
			}
		}
		for (var key in svgCannelExpressionCallbackElement) {
			if (svgCannelExpressionCallbackElement.hasOwnProperty(key)) {
				svgElementIdToggle(key);
			}
		}
		addRespsonseToSVGElements();
	}
	
	/**
	 * Display svg diagram with the matching svgName name.
	 *  
	 * @param {String} svgName - name of the svg.
	 */
	this.loadSVG = function(svgName) {
		var svgFullName = "svg/" + svgName;
		if (svgName == "Myocyte_v6_Grouped.svg") {
			svgObject.onload = function() {
				svgLoaded();
				runModelURL = 'https://models.cellml.org/workspace/noble_1962/rawfile/c70f8962407db00673f1fdcac9f35a2593781c17/noble_1962.sedml';
			}
		} else {
			svgObject.onload = undefined;
			runModelURL = 'https://models.physiomeproject.org/workspace/4ac/rawfile/99f626ad282c900cf3665f2119ab70f61ec2ba3c/Circulation_Model.sedml';
		}
		
		svgObject.setAttribute('data', svgFullName );
	}
}
