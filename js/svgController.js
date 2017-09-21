var svgElemenToggle = function(svgElementId, svgClassName) {
	  var object = document.getElementById(svgElementId);
	  var svgDocument = object.contentDocument;
	  var svgElement = svgDocument.getElementsByClassName(svgClassName);
	  console.log(svgElement[0].style.visibility);
	  if (svgElement[0].style.visibility == "hidden") {
		  svgElement[0].style.visibility = "";
	  } else {
		  svgElement[0].style.visibility = "hidden";
	  }
	  
	  //svgElement[0].setAttribute("fill", "yellow");

}