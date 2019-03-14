require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var Zinc = require('zincjs');
var WEBGL = require('./utilities/WebGL').WEBGL;

exports.ITEM_LOADED = { FALSE: -1, DOWNLOADING: 0, TRUE: 1 };

exports.createDialogContainer = function (DialogNameIn, data) {
  var e0 = $('<div></div>');
  e0.attr('title', DialogNameIn);
  var e1 = $('<div class="ui-widget-content" style="position:absolute;width:100%;height:100%;"></div>');
  e0.append(e1);
  e0.dialog({
          width: 600,
          height: 500});
  var childNodes = $.parseHTML(data);
  for (i = 0; i < childNodes.length; i++) {
    e1[0].appendChild(childNodes[i]);
  }

  return e1;
}

/**
 * Create a {@link Zinc.Renderer} on the dom element with corresponding elementID.
 * @param {String} elementID - id of the target dom element.
 * @returns {Zinc.Renderer}
 */
exports.createRenderer = function () {
  var localContainer = document.createElement( 'div' );
  var localRenderer = undefined;;
  localContainer.style.height = "100%";
  if (WEBGL.isWebGLAvailable()) {
    var localRenderer = new Zinc.Renderer(localContainer, window);
    Zinc.defaultMaterialColor = 0xFFFF9C;
    localRenderer.initialiseVisualisation();
    localRenderer.playAnimation = false;
  } else {
    var warning = WEBGL.getWebGLErrorMessage();
    localContainer.appendChild(warning);
  }
  return {"renderer":localRenderer, "container":localContainer};
}

/**
 * Find the {@link CSSStyleRule} with the provided css sheet title and selector name.
 * @param {String} sheetTitle - Style sheet with the same title.
 * @param {String} selectorText - selector string to match.
 * @returns {CSSStyleRule}
 */
exports.findCSSRule = function(selectorText) {
	for (var i = 0; i < document.styleSheets.length; i++ ) {
		var cssRules = document.styleSheets[i].cssRules || document.styleSheets[n].rules;
		for (var n = 0; n < cssRules.length; n++ ) {
			if (cssRules[n].selectorText === selectorText)
				return cssRules[n];
		}
	}
}

exports.getSelector = function(element) {
    var path, node = $(element);
    while (node.length) {
        var realNode = node[0];
        var name = realNode.localName;
        if (!name)
        	break;
        name = name.toLowerCase();
        if (realNode.id) {
            // As soon as an id is found, there's no need to specify more.
            name +=  '#' + realNode.id;
        } else if (realNode.className) {
            name += '.' + realNode.className.split(/\s+/).join('.');
        }
        var parent = node.parent();

        var sameTagSiblings = parent.children(name);
        if (sameTagSiblings.length > 1) { 
            var allSiblings = parent.children();
            var index = allSiblings.index(realNode) + 1;
            if (index > 1) {
                name += ':nth-child(' + index + ')';
            }
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
}
