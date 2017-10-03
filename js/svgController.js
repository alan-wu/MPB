var svgLayoutCallbacksElement = new Array();
svgLayoutCallbacksElement["Sodium_button"] = "Sodium";
svgLayoutCallbacksElement["Potassium_button"] = "Potassium";
svgLayoutCallbacksElement["Chloride_button"] = "Chloride";
svgLayoutCallbacksElement["Hydrogen_button"] = "Hydrogen";
svgLayoutCallbacksElement["Calcium_button"] = "Calcium";
svgLayoutCallbacksElement["Anion_button"] = "Anion";

var svgIonChannelCallbackElement = new Array();
svgIonChannelCallbackElement["v1_button"] = "v1_expression";

var svgCannelExpressionCallbackElement = new Array();
svgCannelExpressionCallbackElement["v1_expression"] = " https://models.physiomeproject.org/e/430/sodium_ion_channel.cellml/view";

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
		  svgElement.style.visibility = "visible";
	  } else {
		  svgElement.style.visibility = "hidden";
	  }
}

var expandSVGCollapse = function(source, portName) {
	expandCollapse(source, portName);
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
