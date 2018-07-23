var MANAGER_MODULE_CHANGE = { CHANGED: 0, ADDED: 1, REMOVED: 2 };

exports.ModuleManager = function()  {
  var ready = false;
  var moduleCounter = 0; 
  var constructors = new function() {
    this["Body Viewer"] = require("./bodyRenderer").BodyViewer;
    this["Organs Viewer"] = require("./organsRenderer").OrgansViewer;
  };
  
  var modules = [];
  var ui_dialogs = [];
  var modelsLoader = undefined;
  var moduleChangedCallbacks = [];
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
  
  this.getDialogWithName = function(name) {
    for (var i = 0; i< ui_dialogs.length; i++) {
      if (name.localeCompare(ui_dialogs[i].getModule().getName()) == 0)
        return ui_dialogs[i];
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
  
  var dialogDestroyCallback = function() {
    return function(dialog) {
     _this.removeDialog(dialog);
    }
  }
  
  this.addDialog = function(dialog) {
    if (ui_dialogs.includes(dialog) == false) {
      ui_dialogs.push(dialog);
      dialog.addBeforeCloseCallback(dialogDestroyCallback());
    }
  }
  
  this.removeDialog = function(dialog) {
    var index = ui_dialogs.indexOf(dialog);
    if (index > -1) {
      ui_dialogs.splice(index, 1);
    }
  }
  
  var moduleChangedCallback = function() {
    return function(module, change) {
      if (change ===  require("./BaseModule").MODULE_CHANGE.DESTROYED)
        _this.removeModule(module);
    }
  }
  
  this.addModule = function(module) {
    if (modules.includes(module) == false) {
      modules.push(module);
      for (var i = 0; i < moduleChangedCallbacks.length;i++) {
        moduleChangedCallbacks[i](module, MANAGER_MODULE_CHANGE.ADDED);
      }
      module.addChangedCallback(moduleChangedCallback());
    }
  }
  
  this.removeModule = function(module) {
    var index = modules.indexOf(module);
    if (index > -1) {
      modules.splice(index, 1);
      for (var i = 0; i < moduleChangedCallbacks.length;i++) {
        moduleChangedCallbacks[i](module, MANAGER_MODULE_CHANGE.REMOVED);
      }
      
      module.removeChangedCallback(moduleChangedCallback());
    }
  }
  
  this.addModuleChangedCallback = function(callback) {
    if (typeof(callback === "function"))
      moduleChangedCallbacks.push(callback);
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

exports.MANAGER_MODULE_CHANGE = MANAGER_MODULE_CHANGE;
