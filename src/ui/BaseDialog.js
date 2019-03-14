require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var dat = require("./dat.gui.js");
require("../styles/dat-gui-swec.css");
require("../styles/jquery-ui.theme.min.css");

var BaseDialog = function() {
  this.container = undefined;
  this.parent = undefined;
  this.content = undefined;
  this.datGui = undefined;
  this.UIIsReady = false;
  this.beforeCloseCallbacks = [];
  this.onCloseCallbacks = [];
  this.resizeStopCallbacks = [];
  this.title = "Default";
}

BaseDialog.prototype.close = function(myInstance) {
  return function(event, ui) {
    myInstance.container.dialog('destroy').remove();
    for (var i = 0; i < myInstance.onCloseCallbacks.length; i++) {
      myInstance.onCloseCallbacks[i]( this);
    }
  }
}

BaseDialog.prototype.beforeClose = function(myInstance) {
  return function(event, ui) {
    for (var i = 0; i < myInstance.beforeCloseCallbacks.length; i++) {
      myInstance.beforeCloseCallbacks[i]( this );
    }
  }
}

BaseDialog.prototype.resizeStopCallback = function(myInstance) {
  return function(event) {
    for (var i = 0; i < myInstance.resizeStopCallbacks.length; i++) {
      myInstance.resizeStopCallbacks[i]( this );
    }
  }
}

BaseDialog.prototype.create = function(htmlData) {
  this.container = $('<div></div>');
  this.container.attr('title', this.title);
  if (this.parent === undefined)
	  this.parent = $('body');
  this.container.dialog({
	appendTo: this.parent,
    show: "blind",
    hide: "blind",
    width: 600,
    height: 500,
    closeOnEscape: false,
    position: { my: "left top", at: "left top", of: this.parent},
    resize: function() {
      var heightPadding = parseInt($(this).css('padding-top'), 10) + parseInt($(this).css('padding-bottom'), 10),
        widthPadding = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10),
        titlebarMargin = parseInt($(this).prev('.ui-dialog-titlebar').css('margin-bottom'), 10);
      $(this).height($(this).parent().height() - $(this).prev('.ui-dialog-titlebar').outerHeight(true) - heightPadding - titlebarMargin);

      $(this).width($(this).prev('.ui-dialog-titlebar').outerWidth(true) - widthPadding);
    },
    resizeStop: this.resizeStopCallback(this),
    beforeClose: this.beforeClose(this),
    close: this.close(this)
  });
  this.container.parent().draggable({
	  containment: this.parent
  });
  this.container.parent().resizable({
	  containment: this.parent
  });
  var childNodes = $.parseHTML(htmlData);
  for (i = 0; i < childNodes.length; i++) {
    this.container[0].appendChild(childNodes[i]);
  }
};

BaseDialog.prototype.addDatGui = function() {
  this.datGui = new dat.GUI({autoPlace: false});
  this.datGui.domElement.id = 'gui';
  this.datGui.close();
};

BaseDialog.prototype.addBeforeCloseCallback = function(callback) {
  this.beforeCloseCallbacks.push(callback);
};

BaseDialog.prototype.removeBeforeCloseCallback = function(callback) {
  var index = this.beforeCloseCallbacks.indexOf(callback);
  if (index > -1) {
    this.beforeCloseCallbacks.splice(index, 1);
  }
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
      var wHeight = $(this.parent).height();
      var dHeight = wHeight * value;
      var actualHeight = Math.floor(dHeight + 0.5);
      if (actualHeight > 0)
        this.container.dialog( "option", "height", actualHeight );
    }
  } else if (typeof(heightIn) == "number") {
    var actualHeight = Math.floor(heightIn + 0.5);
    if (actualHeight > $(this.parent).height())
    	actualHeight = $(this.parent).height();
    if (actualHeight > 0)
      this.container.dialog( "option", "height", actualHeight );
  }
};

BaseDialog.prototype.getWidth = function() {
  return this.container.dialog( "option", "width" );
};

BaseDialog.prototype.setWidth = function(widthIn) {
  if (typeof(widthIn) == "string") {
    if (/^\d+(\.\d+)?%$/.test(widthIn)) {
      var value = parseFloat(widthIn) / 100.0;
      var wWidth = $(this.parent).width();
      var dWidth = wWidth * value;
      var actualWidth = Math.floor(dWidth + 0.5);
      if (actualWidth > 0)
        this.container.dialog( "option", "width", actualWidth );
    }
  } else if (typeof(widthIn) == "number") {
    var actualWidth = Math.floor(widthIn + 0.5);
    if (actualWidth > $(this.parent).width())
    	actualWidth = $(this.parent).width();
    if (actualWidth > 0)
      this.container.dialog( "option", "width", actualWidth );
  }
};

BaseDialog.prototype.moveToTop = function() {
  return this.container.dialog( "moveToTop" );
}

BaseDialog.prototype.setPosition = function(leftIn, topIn) {
	var leftString = "";
	var topString = "";
	if (typeof(leftIn) == "number") {
		if (leftIn >= 0)
			leftString = "+" + String(leftIn);
		else
			leftString = String(leftIn);
	} else if (typeof(leftIn) == "string") {
		if (/^\d+(\.\d+)?%$/.test(leftIn)) {
			leftString = "+" + leftIn;
		} else if (/^-\d+(\.\d+)?%$/.test(leftIn)) {
			leftString = leftIn;
		}
	}
	if (typeof(topIn) == "number") {
		if (topIn >= 0)
			topString = "+" + String(topIn);
		else
			topString = String(topIn);
	} else if (typeof(topIn) == "string") {
		if (/^\d+(\.\d+)?%$/.test(topIn)) {
			topString = "+" + topIn;
		} else if (/^-\d+(\.\d+)?%$/.test(topIn)) {
			topString = topIn;
		}
	}
	var atString = "left" + leftString + " top" + topString;
	this.container.dialog('option', 'position',
		{	my: "left top",
			at: atString,
			of: this.parent});
};


BaseDialog.prototype.setLeft = function(leftIn) {
  this.container[0].parentNode.style.left = leftIn;
};

BaseDialog.prototype.setTop = function(topIn) {
  this.container[0].parentNode.style.top = topIn;
};

exports.BaseDialog = BaseDialog;
