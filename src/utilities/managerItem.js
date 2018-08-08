var MANAGER_ITEM_CHANGE = {
  CHANGED : 0,
  ADDED : 1,
  REMOVED : 2,
  NAME_CHANGED : 3
};

exports.ManagerItem = function() {
  var module = undefined;
  var dialog = undefined;
 
  var _this = this;
  
  this.setModule = function(moduleIn) {
    if (module === undefined)
      module = moduleIn;
  }
  
  this.getModule = function() {
    return module;
  }
  
  this.setDialog = function(dialogIn) {
    if (dialogIn && dialogIn.getModule() !== undefined) {
      if (module === undefined || module === dialogIn.getModule()){
        dialog = dialogIn;
        module = dialogIn.getModule();
      }
    } else if (dialogIn === undefined) {
      dialog = undefined;
    }
  }
  
  this.getDialog = function() {
    return dialog;
  }
}

exports.MANAGER_ITEM_CHANGE = MANAGER_ITEM_CHANGE;
