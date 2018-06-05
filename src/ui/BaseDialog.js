require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var dat = require("../dat.gui.js");
require("../styles/dat-gui-swec.css");

var BaseDialog = function() {
  var container = undefined;
  var content = undefined;
  var datGui = undefined;
  var UIIsReady = false;
  var title = "Default";
  var _this = this;
}

BaseDialog.prototype.create = function(htmlData, dataController) {
  container = $('<div></div>');
  container.attr('title', title);
  content = $('<div class="ui-widget-content" style="position:absolute;width:100%;height:100%;"></div>');
  container.append(content);
  container.dialog({
    width: 600,
    height: 500});

  var childNodes = $.parseHTML(htmlData);
  for (i = 0; i < childNodes.length; i++) {
    content[0].appendChild(childNodes[i]);
  }
};

BaseDialog.prototype.addDatGui = function() {
  datGui = new dat.GUI({autoPlace: false});
  datGui.domElement.id = 'gui';
  datGui.close();
};

BaseDialog.prototype.setTitle = function(titleIn) {
  title = titleIn;
  container.attr('title', title);
};

exports.BaseDialog = BaseDialog;
