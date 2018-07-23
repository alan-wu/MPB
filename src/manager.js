exports.ModuleManager = function()  {
  var ready = false;
  var moduleCounter = 0; 
  var constructors = new function() {
    this["Body Viewer"] = require("./bodyRenderer").BodyViewer;
    this["Organs Viewer"] = require("./organsRenderer").OrgansViewer;
  };
  
  var modules = [];
  var ui_viewers = [];
  var modelsLoader = undefined;
  var moduleAddedCallbacks = new Array();
  var _this = this;
  
  this.getAllModules = function() {
    return modules;
  }
  
  this.getAvailableModules = function() {
    var array = [];
    for (var key in constructors) {
      if (constructors.hasOwnProperty(key))
        array.push(key);
    } 
    return array;
  }
  
  this.getModuleWithName = function(name) {
    for (var i = 0; i < modules.length; i++) {
      if (name.localeCompare(modules[i].getName()) == 0)
        return modules[i];
    }
  }
  
  this.getViewerWithName = function(name) {
    for (var i = 0; i< ui_viewers.length; i++) {
      if (name.localeCompare(ui_viewers[i].getModule().getName()) == 0)
        return ui_viewers[i];
    }
  }
  
  this.getListOfModulesName = function() {
    var array = [];
    for (var i = 0; modules.length < i; i++) {
        array.push(module[i].getName());
    } 
    return array;
  }
  
  var pad = function(number, width) {
    var n = number + '';
    var length = n.length;
    for (var i = 0; i < width - length; i++)
      n = "0" + n; 
    return "Panel" + n;
  }
  
  this.getModelsLoader = function() {
    return modelsLoader; 
  }
  
  this.addViewer = function(viewer) {
    if (ui_viewers.includes(viewer) == false) {
      ui_viewers.push(viewer);
    }
  }
  
  this.addModule = function(module) {
    if (modules.includes(module) == false) {
      modules.push(module);
      for (var i = 0; i < moduleAddedCallbacks.length;i++) {
        moduleAddedCallbacks[i](module);
      }
    }
  }
  
  this.addModuleAddedCallback = function(callback) {
    if (typeof(callback === "function"))
      moduleAddedCallbacks.push(callback);
  }
  
  this.createModule = function(moduleName) {
    if (modelsLoader && ready) {
      var module = new constructors[moduleName](modelsLoader);
      moduleCounter = moduleCounter + 1;
      var name = pad(moduleCounter, 4);
      module.setName(name);
      _this.addModule(module);
    }
    
    return module;
  }
  
  this.isReady = function() {
    return ready;
  }
  
  var systemMetaReadyCallback = function() {
    return function() {
      ready = true;
    }
  }
  
  var initialise = function() {
    modelsLoader = new (require("./modelsLoader").ModelsLoader)();
    modelsLoader.addSystemMetaIsReadyCallback(systemMetaReadyCallback());
    modelsLoader.initialiseLoading();
  }
  
  initialise();
}
