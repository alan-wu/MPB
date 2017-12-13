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
	
	this.setSize = function(widthIn, heightIn) {
		canvas.width = widthIn;
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
	
	this.addElement = function(elem) {
		if (findObjectLocation(elem) == -1)
			elems.push(elem);
	}
	
	this.removeElement = function(elem) {
		var index = findObjectLocation(elem);
		if (index != -1) {
			console.log(index);
			elems.splice(index, 1);
		}
	}
	
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