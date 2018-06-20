var THREE = require("three");

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
    _this.unsetHighlighted();
    // Selected object cannot be highlighted
    var array = getUnmatchingObjects(objects, currentSelectedObjects);
    for (var i = 0; i < array.length; i++) {
      array[i].material.emissive.setHex(_this.highlightColour);
    }
    currentHighlightedObjects = array;
    return getUnmatchingObjects(currentHighlightedObjects, previousHighlightedObjects);
  }
  
  this.unsetHighlighted = function() {
    for (var i = 0; i < currentHighlightedObjects.length; i++) {
      currentHighlightedObjects[i].material.emissive.setHex(_this.originalColour);
      currentHighlightedObjects[i].material.depthFunc = THREE.LessEqualDepth;
    }
    currentHighlightedObjects = [];
  }
  
  this.unsetSelected = function() {
    for (var i = 0; i < currentSelectedObjects.length; i++) {
      currentSelectedObjects[i].material.emissive.setHex(_this.originalColour);
      currentSelectedObjects[i].material.depthFunc = THREE.LessEqualDepth;
    }
    currentSelectedObjects = [];
  }

  this.setSelected = function(objects) {
    // first find highlighted object that are not selected
    var previousHSelectedObjects = currentSelectedObjects;
    var array = getUnmatchingObjects(currentHighlightedObjects, objects);
    currentHighlightedObjects = array;
    _this.unsetSelected();
    for (var i = 0; i < objects.length; i++) {
      objects[i].material.emissive.setHex(_this.selectColour);
    }
    currentSelectedObjects = objects;
    return getUnmatchingObjects(currentSelectedObjects, previousHSelectedObjects);
  }
}
