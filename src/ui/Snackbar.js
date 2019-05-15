require("../styles/Snackbar.css");

exports.Snackbar = function(containerIn) {
  var element = undefined;
  var container = containerIn;
  var parent = undefined;
  var template = '<div class="snackbar fadeHide"></div>';
  var _this = this;
  var myTimeout = undefined;
  
  var close = function() {
	  element.className = element.className.replace(" show", " fadeHide");
  }
  
  /**
   * Change the tooltip text.
   * @param {String} text - Text to update the tooltip to.
   */
  this.showMessage = function(text) {
	  if (element.className.indexOf("show") >= 0) {
		  if (myTimeout) {
			  clearTimeout(myTimeout);
			  myTimeout = undefined;
		  }
	  } else {
		  element.className = element.className.replace(" fadeHide", " show");
	  }
	  element.innerHTML = text;
	  myTimeout = setTimeout(close, 4000);
  }

  var setupSnackbar = function() {
    parent = $(template);
    element = parent[0];
    container.appendChild(parent[0]);
  }
  
  setupSnackbar();
}

