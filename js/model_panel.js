var modelGui = undefined;
var otherModelControls = undefined;
var runModelURL = undefined;

var modelControl = function() {
	  this.Background = [ 255, 255, 255 ]; // RGB array
};

var openModel = function(svgName) {
	var svgObject = document.getElementById("testsvg");
	var svgFullName = "svg/" + svgName;

	if (svgName == "Myocyte_v4_Grouped_v4.svg") {
		svgObject.onload = function() {
			svgLoaded();
			runModelURL = 'https://models.cellml.org/workspace/noble_1962/rawfile/c70f8962407db00673f1fdcac9f35a2593781c17/noble_1962.sedml';
		}
	} else {
		svgObject.onload = undefined;
		runModelURL = 'https://models.physiomeproject.org/workspace/4ac/rawfile/99f626ad282c900cf3665f2119ab70f61ec2ba3c/Circulation_Model.sedml';
	}
	
	svgObject.setAttribute('data', svgFullName );
	document.getElementById("modelsContainer").style.visibility = "visible";
}

var runModel = function(source) {
	var opencorURL = 'opencor://openFile/' + runModelURL;
	
	window.open(opencorURL, '_self');
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
