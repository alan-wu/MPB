require('webpack-jquery-ui/dialog');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');
require('webpack-jquery-ui/resizable');
require('webpack-jquery-ui/selectable');
require('webpack-jquery-ui/sortable');
var Zinc = require('zincjs');

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
exports.setupRenderer = function (elementID) {
	var localContainer = document.createElement( 'div' );
	document.getElementById(elementID).appendChild( localContainer );
	localContainer.style.height = "100%"
	var localRenderer = new Zinc.Renderer(localContainer, window);
	Zinc.defaultMaterialColor = 0xFFFF9C;
	localRenderer.initialiseVisualisation();
	localRenderer.playAnimation = false;	
	return localRenderer;
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
