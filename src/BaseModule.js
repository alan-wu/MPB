var MODULE_CHANGE = { ALL: 0, DESTROYED: 1, NAME_CHANGED: 2 };


var BaseModule = function() {
  this.typeName = "Base Module";
  this.instanceName = "default";
  this.onChangedCallbacks = [];

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

exports.BaseModule = BaseModule;
exports.MODULE_CHANGE = MODULE_CHANGE;
