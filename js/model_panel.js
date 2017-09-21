var modelGui = undefined;


var openModel = function() {
	var text_display = document.getElementById('model_text_display');
	text_display.innerHTML = "<strong>Click on the following <span style='color:#FF4444'>images</span> to view models on PMR.<br />Click on <span style='color:#FF4444'>Run Simulation</span> to run the model using OpenCOR.</strong>" 
	document.getElementById("imageContainer").style.visibility = "visible";
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