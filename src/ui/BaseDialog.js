require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var dat = require("./dat.gui.js");
require("../styles/dat-gui-swec.css");
require("../styles/jquery-ui.theme.min.css");
require("../styles/dialog.css");

var BaseDialog = function() {
  this.container = undefined;
  this.module = undefined;
  this.parent = undefined;
  this.containment = undefined;
  this.content = undefined;
  this.datGui = undefined;
  this.UIIsReady = false;
  this.titlebarHidden = false;
  this.beforeCloseCallbacks = [];
  this.onCloseCallbacks = [];
  this.resizeStopCallbacks = [];
  this.snackbar = undefined;
  this.title = "Default";
}

BaseDialog.prototype.getModule = function() {
	return this.module;
}

BaseDialog.prototype.close = function(myInstance) {
  return function(event, ui) {
    myInstance.container.dialog('destroy').remove();
    for (var i = 0; i < myInstance.onCloseCallbacks.length; i++) {
      myInstance.onCloseCallbacks[i]( myInstance);
    }
    if (myInstance.destroyModuleOnClose) {
      if (myInstance.module) {
        myInstance.module.destroy();
        myInstance.module = undefined;
      }
    }
  }
}

BaseDialog.prototype.beforeClose = function(myInstance) {
  return function(event, ui) {
    for (var i = 0; i < myInstance.beforeCloseCallbacks.length; i++) {
      myInstance.beforeCloseCallbacks[i]( myInstance );
    }
  }
}

BaseDialog.prototype.resizeStopCallback = function(myInstance) {
  return function(event) {
    var heightPadding = parseInt($(this).css('padding-top'), 10) + parseInt($(this).css('padding-bottom'), 10),
    widthPadding = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10),
    titlebarMargin = parseInt($(this).prev('.ui-dialog-titlebar').css('margin-bottom'), 10);

    $(this).width($(this).parent().width() - widthPadding);
    for (var i = 0; i < myInstance.resizeStopCallbacks.length; i++) {
      myInstance.resizeStopCallbacks[i]( myInstance );
    }
  }
}

BaseDialog.prototype.dock = function() {
	this.container.parent().draggable({
		containment: this.containment,
		disabled: true
	});
	this.container.parent().resizable({
		containment: this.containment,
		disabled: true
	});
	this.setWidth("100%");
	this.setHeight("100%");
	this.setPosition(0 , 0);
}

BaseDialog.prototype.dockToContainment = function(containment) {
	this.containment = containment;
	this.dock();
}

BaseDialog.prototype.undock = function() {
	this.containment = this.parent;
	this.container.parent().draggable({
		containment: this.containment,
		disabled: false
	});
	this.container.parent().resizable({
		containment: this.containment,
		disabled: false
	});
}

BaseDialog.prototype.getContainment = function() {
	return this.containment;
}

BaseDialog.prototype.create = function(htmlData) {
  this.container = $('<div></div>');
  this.container.attr('title', this.title);
  if (this.parent === undefined)
	  this.parent = $('body');
  if (this.containment === undefined)
	  this.containment = $('body');
  this.container.dialog({
	appendTo: this.parent,
    show: "blind",
    hide: "blind",
    width: 600,
    height: 500,
    closeOnEscape: false,
    position: { my: "left top", at: "left top", of: this.containment},
    resize: function() {
      var heightPadding = parseInt($(this).css('padding-top'), 10) + parseInt($(this).css('padding-bottom'), 10),
        widthPadding = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10);
      var titlebarMargin = 0;
      if (this.titlebarHidden === false)
    	  titlebarMargin = parseInt($(this).prev('.ui-dialog-titlebar').css('margin-bottom'), 10);
      $(this).height($(this).parent().height() - $(this).prev('.ui-dialog-titlebar').outerHeight(true) - heightPadding - titlebarMargin);
      $(this).width($(this).parent().width() - widthPadding);
    },
    resizeStop: this.resizeStopCallback(this),
    beforeClose: this.beforeClose(this),
    close: this.close(this)
  });
  this.container.parent().draggable({
	  containment: this.containment
  });
  this.container.parent().resizable({
	  containment: this.containment
  });
  
  //this is a docked widget if the containment and parent are not the same
  if (this.containment != this.parent) {
	  this.dock();
  }
  
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

BaseDialog.prototype.getSnackbar = function() {
	if (this.snackbar === undefined)
		this.snackbar = new (require("./Snackbar").Snackbar)(this.container[0]);
	return this.snackbar;
}

BaseDialog.prototype.setHeight = function(heightIn) {
  if (typeof(heightIn) == "string") {
    if (/^\d+(\.\d+)?%$/.test(heightIn)) {
      var value = parseFloat(heightIn) / 100.0;
      var wHeight = $(this.containment).height();
      var dHeight = wHeight * value;
      var actualHeight = Math.floor(dHeight + 0.5);
      if (actualHeight > 0)
        this.container.dialog( "option", "height", actualHeight );
    }
  } else if (typeof(heightIn) == "number") {
    var actualHeight = Math.floor(heightIn + 0.5);
    if (actualHeight > $(this.containment).height())
    	actualHeight = $(this.containment).height();
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
      var wWidth = $(this.containment).width();
      var dWidth = wWidth * value;
      var actualWidth = Math.floor(dWidth + 0.5);
      if (actualWidth > 0)
        this.container.dialog( "option", "width", actualWidth );
    }
  } else if (typeof(widthIn) == "number") {
    var actualWidth = Math.floor(widthIn + 0.5);
    if (actualWidth > $(this.containment).width())
    	actualWidth = $(this.containment).width();
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
			of: this.containment,
			collision:  "none"});
};

BaseDialog.prototype.showCloseButton = function() {
	  this.container.dialog("option",
	       "classes.ui-dialog-titlebar-close", "displayBlock");
	}


BaseDialog.prototype.hideCloseButton = function() {
  this.container.dialog("option",
       "classes.ui-dialog-titlebar-close", "displayNone");
}

BaseDialog.prototype.showTitlebar = function() {
	  this.container.dialog("option",
		"classes.ui-dialog-titlebar", "displayBlock");
	  this.titlebarHidden = false;
};

BaseDialog.prototype.hideTitlebar = function() {
	  this.container.dialog("option",
		"classes.ui-dialog-titlebar", "displayNone");
	  this.titlebarHidden = true;
};

BaseDialog.prototype.setLeft = function(leftIn) {
  this.container[0].parentNode.style.left = leftIn;
};

BaseDialog.prototype.setTop = function(topIn) {
  this.container[0].parentNode.style.top = topIn;
};

exports.BaseDialog = BaseDialog;
