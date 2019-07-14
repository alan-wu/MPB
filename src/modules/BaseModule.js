var MODULE_CHANGE = { ALL: 0, DESTROYED: 1, NAME_CHANGED: 2, SETTINGS_CHANGED: 3 };

var BaseModule = function() {
  this.typeName = "Base Module";
  this.instanceName = "default";
  this.onChangedCallbacks = [];
  this.messageFunction = undefined;
  /**  Notifier handle for informing other modules of any changes **/
  this.eventNotifiers = [];
  this.broadcastChannels = {};
}

BaseModule.prototype.setName = function(name) {
  if (name && this.instanceName !== name) {
    this.instanceName = name;
    var callbackArray = this.onChangedCallbacks.slice();
    for (var i = 0; i < callbackArray.length; i++) {
      callbackArray[i]( this, MODULE_CHANGE.NAME_CHANGED );
    }
  }
}

BaseModule.prototype.addBroadcastChannels = function(ChannelName) {
	if (ChannelName in this.broadcastChannels)
		return false;
	var newChannel = new (require('broadcast-channel')).default(ChannelName);
	this.broadcastChannels[ChannelName] = newChannel;
	return true;
}

BaseModule.prototype.removeBroadcastChannels = function(ChannelName) {
	if (ChannelName in this.broadcastChannels) {
		this.broadcastChannels[ChannelName].close();
		delete broadcastChannels[ChannelName];
	}
	
}

BaseModule.prototype.settingsChanged = function() {
	var callbackArray = this.onChangedCallbacks.slice();
    for (var i = 0; i < callbackArray.length; i++) {
      callbackArray[i]( this, MODULE_CHANGE.SETTINGS_CHANGED );
    }
}

BaseModule.prototype.exportSettings = function() {
	  var settings = {};
	  settings.dialog = this.typeName;
	  settings.name = this.instanceName;
	  return settings;
}

BaseModule.prototype.importSettings = function(settings) {
	if (settings.dialog == this.typeName) {
		this.setName(settings.name);
		return true;
	}
	return false;
}

BaseModule.prototype.publishChanges = function(annotations, eventType) {
  for (var i = 0; i < this.eventNotifiers.length; i++) {
    this.eventNotifiers[i].publish(this, eventType, annotations);
  }
  if (eventType === require("../utilities/eventNotifier").EVENT_TYPE.SELECTED) {
	  for (var key in this.broadcastChannels) {
		  this.broadcastChannels[key].postMessage(annotations);
	  }
  }
}

BaseModule.prototype.setMessageFunction = function(functionIn) {
   this.messageFunction = functionIn;
}

BaseModule.prototype.displayMessage = function(message) {
   if (this.messageFunction)
	   this.messageFunction(message);
}

BaseModule.prototype.getName = function() {
  return this.instanceName;
}

BaseModule.prototype.destroy = function() {
  //Make a temorary copy as the array may be altered during the loop
  var callbackArray = this.onChangedCallbacks.slice();
  for (var i = 0; i < callbackArray.length; i++) {
    callbackArray[i]( this, MODULE_CHANGE.DESTROYED );
  }

  delete this;
} 

BaseModule.prototype.addChangedCallback = function(callback) {
  if (this.onChangedCallbacks.includes(callback) == false)
    this.onChangedCallbacks.push(callback);
}

BaseModule.prototype.removeChangedCallback = function(callback) {
  var index = this.onChangedCallbacks.indexOf(callback);
  if (index > -1) {
    this.onChangedCallbacks.splice(index, 1);
  }
} 

BaseModule.prototype.addNotifier = function(eventNotifier) {
  this.eventNotifiers.push(eventNotifier);
}

exports.BaseModule = BaseModule;
exports.MODULE_CHANGE = MODULE_CHANGE;
