var BaseModule = function() {
  this.typeName = "Base Module";
  this.instanceName = "default";
}

BaseModule.prototype.setName = function(name) {
  this.instanceName = name;
}

BaseModule.prototype.getName = function() {
  return this.instanceName;
}

exports.BaseModule = BaseModule;

