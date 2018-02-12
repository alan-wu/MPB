/**
 * Class utilising html5 canvas to composite a combined image. This is currently used to 
 * create the nerve map texture.
 * @class
 * 
 * @author Alan Wu
 * @returns {ImageCombiner}
 */
ImageCombiner = function()  {
	var canvas = undefined;
	var ctx = undefined;
	var _this = this;
	var elems = new Array();
	
	var initialise = function() {
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		ctx.globalCompositeOperation="source-in";
		ctx.save();
	}
	
	/**
	 * Set the size of the canvas.
	 * {Number} widthIn - parameter to set the width of the canvas, must be larger than 0.
	 * {Number} heightIn - parameter to set the height of the canvas, must be larger than 0.
	 */
	this.setSize = function(widthIn, heightIn) {
		if (widthIn > 0)
			canvas.width = widthIn;
		if (heightIn > 0)
			canvas.height = heightIn;
	}
	
	
	var findObjectLocation = function(elem) {
	    var i;
	    for (i = 0; i < elems.length; i++) {
	        if (elems[i] === elem) {
	            return i;
	        }
	    }
	    return -1;
	}
	
	/**
	 * Add an img element to the array of elements which will be composited together.
	 * {object} elem - DOM image object containing an image. 
	 */
	this.addElement = function(elem) {
		if (findObjectLocation(elem) == -1)
			elems.push(elem);
	}
	
	/**
	 * Remove an img element from the array of elements.
	 * {object} elem - DOM image object containing an image. 
	 */
	this.removeElement = function(elem) {
		var index = findObjectLocation(elem);
		if (index != -1) {
			elems.splice(index, 1);
		}
	}
	
	/**
	 * Get the combined image composited by DOM image elements currently in the array. 
	 */
	this.getCombinedImage = function() {
		ctx.restore();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgb(255, 255, 255)"; // without alpha
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (i = 0; i < elems.length; i++)
			ctx.drawImage(elems[i], 0, 0);
		
		return canvas;
	}
	
	initialise();	
}