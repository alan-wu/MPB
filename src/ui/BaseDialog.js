require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var dat = require("../dat.gui.js");
require("../styles/dat-gui-swec.css");

var BaseDialog = function() {
  this.container = undefined;
  this.content = undefined;
  this.datGui = undefined;
  this.UIIsReady = false;
  this.title = "Default";
}

BaseDialog.prototype.create = function(htmlData, dataController) {
  this.container = $('<div></div>');
  this.container.attr('title', this.title);
  this.content = $('<div class="ui-widget-content" style="position:absolute;width:100%;height:100%;"></div>');
  this.container.append(this.content);
  this.container.dialog({
    width: 600,
    height: 500});

  var childNodes = $.parseHTML(htmlData);
  for (i = 0; i < childNodes.length; i++) {
    this.content[0].appendChild(childNodes[i]);
  }
};

BaseDialog.prototype.addDatGui = function() {
  this.datGui = new dat.GUI({autoPlace: false});
  this.datGui.domElement.id = 'gui';
  this.datGui.close();
};

BaseDialog.prototype.setTitle = function(titleIn) {
  this.title = titleIn;
  this.container.dialog("option", "title", this.title);
};

BaseDialog.prototype.getHeight = function() {
  return this.container.dialog( "option", "height" );
};

BaseDialog.prototype.setHeight = function(heightIn) {
  if (typeof(heightIn) == "string") {
    if (/^\d+(\.\d+)?%$/.test(heightIn)) {
      var value = parseFloat(heightIn) / 100.0;
      var wHeight = $(window).height();
      var dHeight = wHeight * value;
      var actualHeight = Math.floor(dHeight + 0.5);
      if (actualHeight > 0)
        this.container.dialog( "option", "height", actualHeight );
    }
  } else if (typeof(heightIn) == "number") {
    var actualHeight = Math.floor(heightIn + 0.5);
    if (actualHeight > 0)
      this.container.dialog( "option", "height", actualHeight );
  }
};

BaseDialog.prototype.getWidth = function() {
  return this.container.dialog( "option", "width" );
};

BaseDialog.prototype.setWidth = function(widthIn) {
  console.log(widthIn);
  if (typeof(widthIn) == "string") {
    if (/^\d+(\.\d+)?%$/.test(widthIn)) {
      var value = parseFloat(widthIn) / 100.0;
      var wWidth = $(window).width();
      var dWidth = wWidth * value;
      var actualWidth = Math.floor(dWidth + 0.5);
      console.log(actualWidth);
      if (actualWidth > 0)
        this.container.dialog( "option", "width", actualWidth );
    }
  } else if (typeof(widthIn) == "number") {
    var actualWidth = Math.floor(widthIn + 0.5);
    if (actualWidth > 0)
      this.container.dialog( "option", "width", actualWidth );
  }
};

BaseDialog.prototype.setLeft = function(leftIn) {
  this.container[0].parentNode.style.left = leftIn;
};

BaseDialog.prototype.setTop = function(topIn) {
  this.container[0].parentNode.style.top = topIn;
};

exports.BaseDialog = BaseDialog;
