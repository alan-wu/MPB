var modelGui = undefined;

var openModel = function() {
	svgLoaded();
	document.getElementById("modelsContainer").style.visibility = "visible";
}

var runModel = function(source, url) {
	window.open(url);
}

var initialiseModelPanel = function() {
	modelGui = new dat.GUI({autoPlace: false});
	modelGui.domElement.id = 'gui';
	modelGui.close();
	var customContainer = document.getElementById("modelGui").append(modelGui.domElement);
}
