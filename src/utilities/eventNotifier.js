var EVENT_TYPE = { ALL: 0, SELECTED: 1, HIGHLIGHTED: 2 };

var SelectionEvent = function(eventTypeIn, identifiersIn) {
  this.eventType = eventTypeIn;
  this.identifiers = identifiersIn;
}

var returnFullID = function(sourceId) {
  //return full annotations with all different name
}
  
var Subscription = function(subscriberIn, callbackIn, eventType) {
  this.targetedID = [];
  var subscriber = subscriberIn;
  if (eventType === undefined)
    this.targetEventType = EVENT_TYPE.ALL;
  else
    this.targetEventType = eventType;
  var callback = callbackIn;
  
  var _this = this;
  
  this.getEventType = function() {
    return eventType;
  }
  
  this.notify = function(source, eventType, ids) {
    if (source !== subscriber && (_this.targetEventType ===  EVENT_TYPE.ALL ||
        _this.targetEventType === eventType)) {
      //should support different type of id e.g lyph, name, fmas...
      //need a function that finds all relavant ids
      var event = new SelectionEvent(eventType, ids);
      callback(event);
    }
  }
}

exports.EventNotifier = function() {
  var events = [];
  var subscriptions = [];
  var _this = this;
  
  this.publish = function(source, eventType, id) {
    for (var i = 0; i < subscriptions.length;i++) {
      subscriptions[i].notify(source, eventType, id);
    }
  }
  
  this.subscribe = function(subscriber, callbackFunction, eventType) {
    if (typeof callbackFunction === "function") {
      var subscription = new Subscription(subscriber, callbackFunction, eventType);
      subscriptions.push(subscription);
      return subscription;
    }
    return undefined;
  }
  
  this.unsubscribe = function(subscription) {
    for (var i = 0; i < subscriptions.length;i++) {
      if (subscription === subscriptions[i]) {
        subscriptions.splice(i, 1);
        return;
      }
    }
  }
}  

exports.EVENT_TYPE = EVENT_TYPE;
