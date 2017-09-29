var svgCallbacksElement = new Array();
svgCallbacksElement["Sodium_button"] = "Sodium";
svgCallbacksElement["Potassium_button"] = "Potassium";
svgCallbacksElement["Chloride_button"] = "Chloride";
svgCallbacksElement["Hydrogen_button"] = "Hydrogen";
svgCallbacksElement["Calcium_button"] = "Calcium";
svgCallbacksElement["Anion_button"] = "Anion";

var svgElemenClassToggle = function(svgElementId, svgClassName) {
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
		  svgElement.style.visibility = "";
	  } else {
		  svgElement.style.visibility = "hidden";
	  }
}

var expandSVGCollapse = function(source, portName) {
	expandCollapse(source, portName);
	for (var key in svgCallbacksElement) {
		if (svgCallbacksElement.hasOwnProperty(key)) {
			svgElementIdToggle("testsvg",key);
		}
	}
}

var svgClicked = function (svgElementId, gPrefix) {
	return function() {
		var id = gPrefix + "_layer";
		console.log(id);
		svgElementIdToggle(svgElementId, id);
	}
}

var addRespsonseToSVGElements = function(svgElementId) {
	var object = document.getElementById(svgElementId);
	var svgDocument = object.contentDocument;
	var buttonLayer = svgDocument.getElementById("Button_layer");
	for (var key in svgCallbacksElement) {
		if (svgCallbacksElement.hasOwnProperty(key)) {
			var svgElement = svgDocument.getElementById(key);
			if (svgElement) {
				svgElement.style.cursor = "pointer";
				svgElement.addEventListener('click', svgClicked(svgElementId, svgCallbacksElement[key]));
			}
		}
	}
}

var svgLoaded = function() {
	for (var key in svgCallbacksElement) {
		if (svgCallbacksElement.hasOwnProperty(key)) {
			svgElementIdToggle("testsvg",key);
		}
	}

	addRespsonseToSVGElements('testsvg');
}

var initialiseSVG = function() {
	 var object = document.getElementById('testsvg');
	 console.log(object.contentDocument)
	 if (object.contentDocument !== undefined) {
		 object.addEventListener('load', svgLoaded, true);
	 }
	 else {
		 svgLoaded();
	 }
}
