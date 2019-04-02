var ManagerItem = require("./managerItem").ManagerItem;
var MANAGER_ITEM_CHANGE = require("./managerItem").MANAGER_ITEM_CHANGE;

exports.ModuleManager = function() {
  var ready = false;
  var moduleCounter = 0;
  var name = "Default Manager";
  var constructors = new function() {
    this["Body Viewer"] = [];
    this["Body Viewer"].module = function() {
      var module = new (require("../modules/bodyRenderer").BodyViewer)(modelsLoader);
      module.readSystemMeta();
      return module; 
    }
    this["Body Viewer"].dialog = function(module, parent) {
      var dialog = new (require("../ui/BodyViewerDialog").BodyViewerDialog)(module, parent);
      return dialog; 
    }
    this["Organs Viewer"] = [];
    this["Organs Viewer"].module = function() {
      var module = new (require("../modules/organsRenderer").OrgansViewer)(modelsLoader);
      return module; 
    }
    this["Organs Viewer"].dialog = function(module, parent) {
      var dialog = new (require("../ui/OrgansViewerDialog").OrgansViewerDialog)(module, parent);
      return dialog; 
    }
    this["Model Panel"] = [];
    this["Model Panel"].module = function() {
      var module = new (require("../modules/model_panel").ModelPanel)();
      return module; 
    }
    this["Model Panel"].dialog=  function(module, parent) {
      var dialog = new (require("../ui/ModelViewerDialog").ModelViewerDialog)(module, parent);
      return dialog; 
    }
    this["Scaffold Viewer"] = [];
    this["Scaffold Viewer"].module = function() {
      var module = new (require("../modules/ScaffoldViewer").ScaffoldViewer)();
      return module; 
    }
    this["Scaffold Viewer"].dialog = function(module, parent) {
      var dialog = new (require("../ui/ScaffoldDialog").ScaffoldDialog)(module, parent);
      return dialog; 
    }
  };
  var modelsLoader = undefined;
  var itemChangedCallbacks = [];
  var renameCallbacks = [];
  var managerItems = [];
  var eventNotifier = new (require("./eventNotifier").EventNotifier)();
  var subscription = undefined;
  var _this = this;

  this.addConstructor = function(name, moduleConstructor, dialogConstructor) {
	  if(!constructors.hasOwnProperty(name)) {
		constructors[name] = [];
		constructors[name].module = function() {
		  var module = new moduleConstructor();
		  console.log(module);
		  return module;
		}
		constructors[name].dialog = function(module, parent) {
		  var dialog = new dialogConstructor(module, parent);
		  return dialog;
		}
	  }
  }

  this.getAllManagerItems = function() {
    return managerItems.slice();
  }

  this.getAvailableModules = function() {
    var array = [];
    for (var key in constructors) {
      if (constructors.hasOwnProperty(key))
        array.push(key);
    }
    return array;
  }

  this.getManagerItemsWithName = function(name) {
    for (var i = 0; i < managerItems.length; i++) {
      var module = managerItems[i].getModule();
      if (name.localeCompare(module.getName()) == 0)
        return managerItems[i];
    }
  }

  this.getListOfModulesName = function() {
    var array = [];
    for (var i = 0; managerItems.length < i; i++) {
      array.push(managerItems[i].getModule().getName());
    }
    return array;
  }
  
  var findManagerItemWithModule = function(moduleIn) {
    for (var i = 0; i < managerItems.length; i++) {
      var module = managerItems[i].getModule();
      if (module === moduleIn) {
        return managerItems[i];
      }
    }
    return undefined;
  }
  
  var findManagerItemWithDialog = function(dialogIn) {
	for (var i = 0; i < managerItems.length; i++) {
	  var dialog = managerItems[i].getDialog();
	  if (dialog === dialogIn) {
	    return managerItems[i];
	  }
	}
	return undefined;
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

  this.manageDialog = function(dialogIn) {
    if (dialogIn) {
      var moduleIn = dialogIn.getModule();
      if (moduleIn) {
	    var item = findManagerItemWithModule(moduleIn);
	    if (item) {
	      if (item.getDialog() === undefined) {
	        item.setDialog(dialogIn);
	        dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      }
	      return item;
	    } else {
	      var managerItem = new ManagerItem();
	      managerItem.setDialog(dialogIn);
	      dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      moduleIn.addChangedCallback(moduleChangedCallback());
	      managerItems.push(managerItem);
	      for (var i = 0; i < itemChangedCallbacks.length; i++)
	        itemChangedCallbacks[i](managerItem, MANAGER_ITEM_CHANGE.ADDED)
	      return managerItem;
	    }
      } else {
    	var item = findManagerItemWithDialog(dialogIn);
    	if (item === undefined) {
  	      var managerItem = new ManagerItem();
	      managerItem.setDialog(dialogIn);
	      dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      managerItems.push(managerItem);
	      for (var i = 0; i < itemChangedCallbacks.length; i++)
	        itemChangedCallbacks[i](managerItem, MANAGER_ITEM_CHANGE.ADDED)
	      return managerItem;
    	}
    	return item;
      }
    }
  }

  this.removeDialog = function(dialogIn) {
    if (dialogIn) {
      var item = findManagerItemWithDialog(dialogIn);
      if (item) {
    	  item.setDialog(undefined);
      }
    }
  }

  var moduleChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.DESTROYED)
        _this.removeModule(module);
      else if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        var item = findManagerItemWithModule(module);
        if (item)
          for (var i = 0; i < itemChangedCallbacks.length; i++) {
            itemChangedCallbacks[i](item, MANAGER_ITEM_CHANGE.NAME_CHANGED);
          }
      }
    }
  }

  this.manageModule = function(moduleIn) {
    if (moduleIn) {
      for (var i = 0; i < managerItems.length; i++) {
        var module = managerItems[i].getModule();
        if (module === moduleIn) {
          return managedItems[i];
        }
      }
      //item not found, add a new entry
      var managerItem = new ManagerItem();
      managerItem.setModule(moduleIn);
      moduleIn.addChangedCallback(moduleChangedCallback());
      moduleIn.addNotifier(eventNotifier);
      managerItems.push(managerItem);
      for (var i = 0; i < itemChangedCallbacks.length; i++)
        itemChangedCallbacks[i](managerItem, MANAGER_ITEM_CHANGE.ADDED);
      return managerItem;
    }
  }

  this.removeModule = function(moduleIn) {
    var index = -1;
    if (moduleIn) {
      for (var i = 0; (i < managerItems.length) && (index == -1); i++) {
        var module = managerItems[i].getModule();
        if (module === moduleIn)
          index = i;
      }
      if (index > -1) {
        moduleIn.removeChangedCallback(moduleChangedCallback());
        managerItems[index].getDialog().removeBeforeCloseCallback(dialogDestroyCallback());
        for (var i = 0; i < itemChangedCallbacks.length; i++) {
          itemChangedCallbacks[i]( managerItems[index], MANAGER_ITEM_CHANGE.REMOVED);
        }
        managerItems.splice(index, 1);
      }
    }
  }

  this.addManagedItemChangedCallback = function(callback) {
    if (typeof (callback === "function"))
      itemChangedCallbacks.push(callback);
  }
  
  this.createDialog = function(module, parent) {
    if (module && ready) {
      if (constructors[module.typeName]) {
        var dialog = constructors[module.typeName].dialog(module, parent);
        _this.manageDialog(dialog);
        return dialog;
      }
    }

    return;
  }
  
  this.addRenameCallback = function(callback) {
    if (typeof(callback === "function"))
      renameCallbacks.push(callback);
  }
  
  this.getName = function() {
    return name;
  }
  
  this.setName = function(nameIn) {
    if (name.localeCompare(nameIn) != 0) {
      var oldName = name;
      name = nameIn;
      for (var i = 0; i < renameCallbacks.length;i++) {
        renameCallbacks[i](_this, oldName, name);
      }
    }
  }

  this.createModule = function(moduleName) {
    if (modelsLoader && ready) {
      var module = constructors[moduleName].module();
      if (module) {
	      moduleCounter = moduleCounter + 1;
	      var name = pad(moduleCounter, 4);
	      module.setName(name);
	      _this.manageModule(module);
      }
      return module;
    }
    return;
    
  }
  
  var eventNotifierCallback = function() {
    return function(event) {
      if (event && (event.eventType === require("./eventNotifier").EVENT_TYPE.SELECTED) && 
          event.identifiers && event.identifiers[0]) {
        var id = event.identifiers[0];
        if (id.type == "anatomical") {
          for (var i = 0; (i < managerItems.length); i++) {
            var module = managerItems[i].getModule();
            if (module.typeName === "Organs Viewer")
              module.loadOrgans(id.data.species, id.data.system, id.data.part);
          }
        }
      }
    }
  }
  
  this.destroy = function() {
    if (eventNotifier && subscription)
      eventNotifier.unsubscribe(subscription);
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
    modelsLoader = new (require("../modelsLoader").ModelsLoader)();
    modelsLoader.addSystemMetaIsReadyCallback(systemMetaReadyCallback());
    modelsLoader.initialiseLoading();
    subscription = eventNotifier.subscribe(_this, eventNotifierCallback(), undefined);
  }

  initialise();
}
