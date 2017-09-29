var cellGui = undefined;

var openCell = function() {
	document.getElementById("imageContainer").style.visibility = "visible";
}

var initialiseCellPanel = function() {
	cellGui = new dat.GUI({autoPlace: false});
	cellGui.domElement.id = 'gui';
	cellGui.close();
	var customContainer = document.getElementById("cellGui").append(cellGui.domElement);
}