var CellPanelDialog = function() {
  (require('./BaseDialog').BaseDialog).call(this);
  var otherCellControls = undefined;
  var _this = this;

  var cellBackGroundChanged = function() {
    return function(value) {
      var redValue = parseInt(value[0]);
      var greenValue = parseInt(value[1]);
      var blueValue = parseInt(value[2]);
      var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
      this.container[0].style.backgroundColor = backgroundColourString;
    }
  }
  
  var cellControl = function() {
    this.Background = [ 255, 255, 255 ]; // RGB array
  };
  
  var initialise = function() {
    _this.create(require("../snippets/cellPanel.html"));
    _this.addDatGui();
    
    var control = new cellControl();
    var controller = datGui.addColor(control, 'Background');
    console.log(container)
    controller.onChange(cellBackGroundChanged());
    container.find("#cellGui")[0].appendChild(datGui.domElement);
    otherCellControls = datGui.addFolder('Others');
  }
  
  initialise();
}

CellPanelDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.CellPanelDialog = CellPanelDialog;
