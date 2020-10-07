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
    var fullList = getFullListOfObjects(array);
    for (var i = 0; i < fullList.length; i++) {
      if (fullList[i] && fullList[i].material && fullList[i].material.emissive)
        fullList[i].material.emissive.setHex(_this.highlightColour);
    }
    currentHighlightedObjects = array;
    return isDifferent(currentHighlightedObjects, previousHighlightedObjects);
  }

  this.setSelected = function(objects) {
    // first find highlighted object that are not selected
    var previousHSelectedObjects = currentSelectedObjects;
    var array = getUnmatchingObjects(currentHighlightedObjects, objects);
    currentHighlightedObjects = array;
    _this.resetSelected();
    var fullList = getFullListOfObjects(objects);
    for (var i = 0; i < fullList.length; i++) {
    	if (fullList[i] && fullList[i].material && fullList[i].material.emissive)
        fullList[i].material.emissive.setHex(_this.selectColour);
    }
    currentSelectedObjects = objects;
    return isDifferent(currentSelectedObjects, previousHSelectedObjects);
  }

  var getFullListOfObjects = function(objects) {
    let fullList = [];
    for (var i = 0; i < objects.length; i++) {
      if (objects[i].material)
        fullList.push(objects[i]);
    }
    return fullList;
  }
  
  this.resetHighlighted = function() {
    let fullList = getFullListOfObjects(currentHighlightedObjects);
    for (var i = 0; i < fullList.length; i++) {
      if (fullList[i] && fullList[i].material) {
        if (fullList[i].material.emissive)
          fullList[i].material.emissive.setHex(_this.originalColour);
        if (fullList[i].material.depthFunc)
          fullList[i].material.depthFunc = THREE.LessEqualDepth;
      }
    }
    currentHighlightedObjects = [];
  }
  
  this.resetSelected = function() {
    let fullList = getFullListOfObjects(currentSelectedObjects);
    for (var i = 0; i < fullList.length; i++) {
    	if (fullList[i] && fullList[i].material) {
    		if (fullList[i].material.emissive)
          fullList[i].material.emissive.setHex(_this.originalColour);
    		if (fullList[i].material.depthFunc)
          fullList[i].material.depthFunc = THREE.LessEqualDepth;
    	}
    }
    currentSelectedObjects = [];
  }
  
  this.getSelected = function() {
    return currentSelectedObjects;
  }
  
  this.reset = function() {
    _this.resetSelected();
    _this.resetHighlighted();
  }
}
