var cellGui = undefined;
var otherCellControls = undefined;

var cellControl = function() {
	  this.Background = [ 255, 255, 255 ]; // RGB array
};

var openCell = function() {
	document.getElementById("imageContainer").style.visibility = "visible";
}

var cellBackGroundChanged = function() {
	return function(value) {
		var redValue = parseInt(value[0]);
		var greenValue = parseInt(value[1]);
		var blueValue = parseInt(value[2]);
		
		var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
		document.getElementById("cellDisplayPort").style.backgroundColor = backgroundColourString;
	}
}


var initialiseCellPanel = function() {
	cellGui = new dat.GUI({autoPlace: false});
	cellGui.domElement.id = 'gui';
	cellGui.close();
	var control = new cellControl();
	var controller = cellGui.addColor(control, 'Background');
	controller.onChange(cellBackGroundChanged());
	otherCellControls = cellGui.addFolder('Others');
	var customContainer = document.getElementById("cellGui").append(cellGui.domElement);
}