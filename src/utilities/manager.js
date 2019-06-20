var ManagerItem = require("./managerItem").ManagerItem;
var MANAGER_ITEM_CHANGE = require("./managerItem").MANAGER_ITEM_CHANGE;
var _ = require("lodash/lang");

exports.ModuleManager = function() {
  var ready = false;
  var moduleCounter = 0;
  var name = "Default Manager";
  var gridView = undefined;
  var currentSettings = undefined;
  var fragmentParser = new (require("./fragmentParser").FragmentParser)();
  var constructors = new function() {
    this["Body Viewer"] = [];
    this["Body Viewer"].module = function() {
      var module = new (require("../modules/bodyRenderer").BodyViewer)(modelsLoader);
      module.readSystemMeta();
      return module; 
    }
    this["Body Viewer"].dialog = function(module, parent, options) {
      var dialog = new (require("../ui/BodyViewerDialog").BodyViewerDialog)(module, parent, options);
      return dialog;
    }
    this["Organs Viewer"] = [];
    this["Organs Viewer"].module = function() {
      var module = new (require("../modules/organsRenderer").OrgansViewer)(modelsLoader);
      return module; 
    }
    this["Organs Viewer"].dialog = function(module, parent, options) {
      var dialog = new (require("../ui/OrgansViewerDialog").OrgansViewerDialog)(module, parent, options);
      return dialog; 
    }
    this["Scaffold Viewer"] = [];
    this["Scaffold Viewer"].module = function() {
      var module = new (require("../modules/ScaffoldViewer").ScaffoldViewer)();
      return module; 
    }
    this["Scaffold Viewer"].dialog = function(module, parent, options) {
      var dialog = new (require("../ui/ScaffoldDialog").ScaffoldDialog)(module, parent, options);
      return dialog; 
    }
  };
  var modelsLoader = undefined;
  var itemChangedCallbacks = [];
  var renameCallbacks = [];
  this.allowStateChange = false;
  var managerItems = [];
  var eventNotifier = new (require("./eventNotifier").EventNotifier)();
  var subscription = undefined;
  var importing = false;
  var _this = this;

  this.addConstructor = function(name, moduleConstructor, dialogConstructor) {
	  if(!constructors.hasOwnProperty(name)) {
		constructors[name] = [];
		constructors[name].module = function() {
		  var module = new moduleConstructor();
		  return module;
		}
		constructors[name].dialog = function(module, parent, options) {
		  var dialog = new dialogConstructor(module, parent, options);
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
      var item = undefined;
      if (moduleIn) {
	    item = findManagerItemWithModule(moduleIn);
	    if (item) {
	      if (item.getDialog() === undefined) {
	        item.setDialog(dialogIn);
	        dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      }
	    } else {
	      var managerItem = new ManagerItem();
	      managerItem.setDialog(dialogIn);
	      dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      moduleIn.addChangedCallback(moduleChangedCallback());
	      managerItems.push(managerItem);
	      for (var i = 0; i < itemChangedCallbacks.length; i++)
	        itemChangedCallbacks[i](managerItem, MANAGER_ITEM_CHANGE.ADDED)
	      item = managerItem;
	    }
      } else {
    	item = findManagerItemWithDialog(dialogIn);
    	if (item === undefined) {
  	      var managerItem = new ManagerItem();
	      managerItem.setDialog(dialogIn);
	      dialogIn.addBeforeCloseCallback(dialogDestroyCallback());
	      managerItems.push(managerItem);
	      for (var i = 0; i < itemChangedCallbacks.length; i++)
	        itemChangedCallbacks[i](managerItem, MANAGER_ITEM_CHANGE.ADDED)
	      item = managerItem;
    	}
      }
      //if gridVIew is defined and enabled, the dialog will be added to a grid
      if (item && gridView) {
    	  gridView.addManagerItem(item);
      }
      updateState();
    }
  }

  this.removeDialog = function(dialogIn) {
    if (dialogIn) {
      var item = findManagerItemWithDialog(dialogIn);
      if (item) {
    	  if (gridView)
    		  gridView.removeManagerItem(item);
    	  item.setDialog(undefined);
      }
    }
  }
  
  this.getSettings = function() {
	  var settings = [];
      for (var i = 0; i < managerItems.length; i++) {
          var newSettings = managerItems[i].getSettings();
          if (newSettings) {
        	  settings.push(newSettings);
          }
      }
	  return settings;
  }
  
  this.serialise = function() {
	  var settings = _this.getSettings();
	  var string = fragmentParser.stringify(settings);
      return string;
  }
  
  var updateState = function() {
	  if ((importing == false) && _this.allowStateChange && (self.history !== undefined)) {
		  var serialisation = _this.serialise();
		  if ((self.location !== undefined) && (self.location.hash != serialisation))
			  self.history.pushState({}, "Portal Manager State", serialisation);
	  }
  }

  var moduleChangedCallback = function() {
    return function(module, change) {
      if (change === require("../modules/BaseModule").MODULE_CHANGE.DESTROYED)
        _this.removeModule(module);
      else if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        var item = findManagerItemWithModule(module);
        if (item)
          for (var i = 0; i < itemChangedCallbacks.length; i++)
            itemChangedCallbacks[i](item, MANAGER_ITEM_CHANGE.NAME_CHANGED);
      } else if (change === require("../modules/BaseModule").MODULE_CHANGE.SETTINGS_CHANGED) {
    	  updateState();
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
      //updateState();
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
        var dialog = managerItems[index].getDialog();
        if (dialog) {
        	dialog.removeBeforeCloseCallback(dialogDestroyCallback());
        	dialog.close();
        } else {
	        for (var i = 0; i < itemChangedCallbacks.length; i++) {
	        	itemChangedCallbacks[i]( managerItems[index], MANAGER_ITEM_CHANGE.REMOVED);
	        }
	        managerItems.splice(index, 1);
        }
        updateState();
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
  
  this.initialiseGridView = function(container) {
	  if (gridView === undefined)
		  gridView = new (require("../ui/gridView").GridView)(container);
  }
  
  this.setGridHeight = function(height) {
	  if (gridView) {
		  gridView.setHeight(height);
	  }
  }
  
  this.enableGridView = function() {
	  if (gridView) {
		  gridView.enable(managerItems);
	  }
  }
  
  this.disableGridView = function() {
	  if (gridView) {
		  gridView.disable();
	  }
  }
  
  var findFirstModuleWithExactSettings = function(setting, remainingItems) {
	  var copyItems = remainingItems.slice();
	  for (var i = 0; i < copyItems.length; i++) {
		  var item = copyItems[i];
		  var currentSettings = item.getSettings();
		  if (_.isEqual(setting, currentSettings)) {
			  return [true, i];
		  }
	  }
	  return [false, -1];
  }
  
  var findFirstModuleWithMatchingType = function(setting, remainingItems) {
	  var copyItems = remainingItems.slice();
	  for (var i = 0; i < copyItems.length; i++) {
		  var item = copyItems[i];
		  var currentSettings = item.getSettings();
		  if (_.isEqual(setting.dialog, currentSettings.dialog)) {
			  return [true, i];
		  }
	  }
	  return [false, -1];
  }
  
  var createModulesFromSettings = function(settings) {
	  if (settings) {
		  var module = _this.createModule(settings.dialog);
		  if (module) {
			  module.importSettings(settings);
			  if (document && document.querySelector) {
				  var parent = undefined;
				  if (settings.parent)
					  parent = document.querySelector(settings.parent);
				  else
					  parent = document.querySelector("body");
				  _this.createDialog(module, parent);
			  }
		  }
	  } 
  }
  
  this.importSettings = function(settings) {
	  if (settings) {
		  importing = true;
		  // The following block should leave any non changed module alone
		  var copySettings = settings.slice();
		  var remainingItems = managerItems.slice();
		  for (var i = 0; i < copySettings.length;) {
			  var setting = copySettings[i];
			  var returned = findFirstModuleWithExactSettings(setting, remainingItems);
			  if (returned[0]) {
				  remainingItems.splice(returned[1], 1);
				  copySettings.splice(i, 1);
			  } else {
				  i++;
			  }
		  }
		  // Find the first matching module type and deserialise 
		  for (var i = 0; i < copySettings.length;) {
			  var setting = copySettings[i];
			  var returned = findFirstModuleWithMatchingType(setting, remainingItems);
			  if (returned[0]) {
				  var module = remainingItems[returned[1]].getModule();
				  module.importSettings(setting);
				  remainingItems.splice(returned[1], 1);
				  copySettings.splice(i, 1);
			  } else {
				  i++;
			  }
		  }
		  // These modules are no longer required
		  if (remainingItems.length > 0 ) {
			  for (var i = remainingItems.length - 1; i >= 0; i--) {
				  var module = remainingItems[i].getModule();
				  _this.removeModule(module);
			  }
		  }
		  //create missing modules
		  for (var i = 0; i < copySettings.length; i++) {
			  createModulesFromSettings(copySettings[i]);
		  }
		  var serialisation = _this.serialise();
		  if ((self.location !== undefined) && (self.location.hash != serialisation))
			  self.history.replaceState({}, "Portal Manager State", serialisation);
		  importing = false;
	  }
  }
  
  this.deserialise = function(hash) {
	  var settings = fragmentParser.parseString(hash);
	  _this.importSettings(settings);
  }
  
  var hashChangedCallback = function() {
	  if (self.location !== undefined) {
		  var settings = fragmentParser.parse(self.location);
		  _this.importSettings(settings);
	  }
  }
  
  this.enableHashChangedEvent = function() {
	  if (self && self.addEventListener && self.onhashchange == undefined) {
		  self.onhashchange = hashChangedCallback;
	  }
  }
  
  this.disableHashChangedEvent = function() {
	  if (self && self.onhashchang)
		  self.onhashchange = undefined;
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
