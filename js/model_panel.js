var modelGui = undefined;
var otherModelControls = undefined;

var modelControl = function() {
	  this.Background = [ 255, 255, 255 ]; // RGB array
};

var openModel = function() {
	svgLoaded();
	document.getElementById("modelsContainer").style.visibility = "visible";
}

var runModel = function(source, url) {
	window.open(url);
}

var modelBackGroundChanged = function() {
	return function(value) {
		var redValue = parseInt(value[0]);
		var greenValue = parseInt(value[1]);
		var blueValue = parseInt(value[2]);
		
		var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
		document.getElementById("modelDisplayPort").style.backgroundColor = backgroundColourString;
	}
}

var initialiseModelPanel = function() {
	modelGui = new dat.GUI({autoPlace: false});
	modelGui.domElement.id = 'gui';
	modelGui.close();
	var control = new modelControl();
	var controller = modelGui.addColor(control, 'Background');
	controller.onChange(modelBackGroundChanged());
	otherModelControls = modelGui.addFolder('Others');
	var customContainer = document.getElementById("modelGui").append(modelGui.domElement);
}
