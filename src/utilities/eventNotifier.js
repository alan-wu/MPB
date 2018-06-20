var EVENT_TYPE = { ALL: 0, SELECTED: 1, HIGHLIGHTED: 2 };


var SelectionEvent = function(eventTypeIn, identifiersIn) {
  this.eventType = eventTypeIn;
  this.identifiers = identifiersIn;
}

var returnFullID = function(sourceId) {
  //return full annotations with all different name
}
  
var Suscription = function(suscriberIn, callbackIn, eventType) {
  this.targetedID = [];
  var suscriber = suscriberIn;
  if (eventType === undefined)
    this.targetEventType = EVENT_TYPE.ALL;
  else
    this.targetEventType = eventType;
  var callback = callbackIn;
  
  var _this = this;
  
  this.getEventType = function() {
    return eventType;
  }
  
  this.notify = function(source, eventType, id) {
    if (source !== suscriber && (_this.targetEventType ===  EVENT_TYPE.ALL ||
        _this.targetEventType === eventType)) {
      //should support different type of id e.g lyph, name, fmas...
      //need a function that finds all relavant ids
      var event = new SelectionEvent(eventType, id);
      callback(event);
    }
  }
}

exports.EventNotifier = function() {
  var events = [];
  var suscriptions = [];
  var _this = this;
  
  this.publish = function(source, eventType, id) {
    for (var i = 0; i < suscriptions.length;i++) {
      suscriptions[i].notify(source, eventType, id);
    }
  }
  
  this.suscribe = function(suscriber, callbackFunction, eventType) {
    if (typeof callbackFunction === "function") {
      var suscription = new Suscription(suscriber, callbackFunction, eventType);
      suscriptions.push(suscription);
      return suscription;
    }
    return undefined;
  }
  
  this.unsuscribe = function(suscriber) {
    for (var i = 0; i < suscribers.length;i++) {
      if (suscriber === suscribers[i]) {
        suscribers.splice(i, 1);
        return;
      }
    }
  }
}  


exports.EVENT_TYPE = EVENT_TYPE;
