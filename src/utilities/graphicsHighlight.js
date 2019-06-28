var THREE = require('zincjs').THREE;

/**
 * This module manages highlighted and selected objects in 3D modules. 
 * 
 * @class
 * @returns {exports.GraphicsHighlight}
 */
exports.GraphicsHighlight = function() {
  var currentHighlightedObjects = [];
  var currentSelectedObjects = [];
  this.highlightColour = 0x0000FF;
  this.selectColour = 0x00FF00;
  this.originalColour = 0x000000;
  var _this = this;
  
  var removeDuplicatedObjects = function(array) {
    var uniqueArray = [];
    $.each(names, function(i, el){
      if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueArray;
  }
  
  var getMatchingObjects = function(objectsArray1, objectsArray2) {
    var matchingObjects = [];
    if (objectsArray1.length == 0 || objectsArray2.length == 0)
      return matchingObjects;
    for (var i = 0; i < objectsArray1.length; i++) {
      for (var j = 0; j < objectsArray2.length; j++) {
        if (objectsArray1[i] === objectsArray2[j]) 
          if($.inArray(objectsArray1[i], unmatchingObjects) === -1)
            matchingObjects.push(objectsArray1[i]);
      }
    }
    return matchingObjects;
  }
  
  var isDifferent = function(array1, array2) {
    if ((array1.length == 0) && (array2.length == 0))
      return false;
    
    for (var i = 0; i < array1.length; i++) {
      var matched = false;
      for (var j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j]) {
          matched = true;
        }
      }
      if (!matched)
        return true;
    }
    for (var i = 0; i < array2.length; i++) {
      var matched = false;
      for (var j = 0; j < array1.length; j++) {
        if (array2[i] === array1[j]) {
          matched = true;
        }
      }
      if (!matched)
        return true;
    }
    return false;
  }
  
  var getUnmatchingObjects = function(objectsArray1, objectsArray2) {
    var unmatchingObjects = [];
    if (objectsArray2.length == 0)
      return objectsArray1;
    for (var i = 0; i < objectsArray1.length; i++) {
      var matched = false;
      for (var j = 0; j < objectsArray2.length; j++) {
        if (objectsArray1[i] === objectsArray2[j]) {
          matched = true;
        }
      }
      if (!matched)
        unmatchingObjects.push(objectsArray1[i]);
    }
    return unmatchingObjects;
  }

  
  this.setHighlighted = function(objects) {
    var previousHighlightedObjects = currentHighlightedObjects;
    _this.resetHighlighted();
    // Selected object cannot be highlighted
    var array = getUnmatchingObjects(objects, currentSelectedObjects);
    for (var i = 0; i < array.length; i++) {
      if (array[i] && array[i].material && array[i].material.emissive)
        array[i].material.emissive.setHex(_this.highlightColour);
    }
    currentHighlightedObjects = array;
    return isDifferent(currentHighlightedObjects, previousHighlightedObjects);
  }
  
  this.resetHighlighted = function() {
    for (var i = 0; i < currentHighlightedObjects.length; i++) {
		if (currentHighlightedObjects[i].material.emissive)
			currentHighlightedObjects[i].material.emissive.setHex(_this.originalColour);
		if (currentHighlightedObjects[i].material.depthFunc)
			currentHighlightedObjects[i].material.depthFunc = THREE.LessEqualDepth;
    }
    currentHighlightedObjects = [];
  }
  
  this.resetSelected = function() {
    for (var i = 0; i < currentSelectedObjects.length; i++) {
    	if (currentSelectedObjects[i] && currentSelectedObjects[i].material) {
    		if (currentSelectedObjects[i].material.emissive)
    			currentSelectedObjects[i].material.emissive.setHex(_this.originalColour);
    		if (currentSelectedObjects[i].material.depthFunc)
    			currentSelectedObjects[i].material.depthFunc = THREE.LessEqualDepth;
    	}
    }
    currentSelectedObjects = [];
  }

  this.setSelected = function(objects) {
    // first find highlighted object that are not selected
    var previousHSelectedObjects = currentSelectedObjects;
    var array = getUnmatchingObjects(currentHighlightedObjects, objects);
    currentHighlightedObjects = array;
    _this.resetSelected();
    for (var i = 0; i < objects.length; i++) {
    	if (objects[i] && objects[i].material && objects[i].material.emissive)
    		objects[i].material.emissive.setHex(_this.selectColour);
    }
    currentSelectedObjects = objects;
    return isDifferent(currentSelectedObjects, previousHSelectedObjects);
  }
  
  this.getSelected = function() {
    return currentSelectedObjects;
  }
  
  this.reset = function() {
    _this.resetSelected();
    _this.resetHighlighted();
  }
}
