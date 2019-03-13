var SidebarItemArray = function() {
  var array = new Object();
  var _this = this;

  this.push = function(name, managerItem, element) {
    array[name] = [ managerItem, element ];
  }

  this.removeItem = function(name) {
    delete array[name];
  }

  this.renameManagerItem = function(managerItem, newName) {
    var oldName = undefined;
    if (array[newName] === undefined) {
      for (var name in array) {
        if (array.hasOwnProperty(name))
          if (array[name][0] == managerItem) {
            oldName = name;
            break;
        }
      }
    }
    if (oldName) {
      var data = array[oldName];
      array[newName] = data;
      delete array[oldName];
    }
  }

  this.findDisplayNameForManagerItem = function(managerItem) {
    for (var name in array) {
      if (array.hasOwnProperty(name))
        if (array[name][0] == managerItem) {
          return name;
      }
    }
    return;
  }

  this.findElementForManagerItem = function(managerItem) {
    for (var name in array) {
      if (array.hasOwnProperty(name))
        if (array[name][0] == managerItem) {
          return array[name][1];
      }
    }
    return;
  }

  this.findManagerItemForElement = function(element) {
    for (var name in array) {
      if (array.hasOwnProperty(name))
        if (array[name][1] == element) {
          return array[name][0];
      }
    }
    return;
  }
}

var ManagerElement = function(manager, jelemIn) {
  var managerElem = undefined;
  var jelem = jelemIn;
  var renameDialog = undefined;
  var addDialog = undefined;
  var sidebarEle = undefined;
  var itemsArray = new SidebarItemArray();
  var moduleManager = manager;
  var _this = this;
  
  this.getManager = function() {
    return moduleManager;
  }
  
  var addDialogClicked = function() {
    return function(event) {
      event.stopPropagation();
      if (addDialog) {
        var dialog_selection = addDialog.find("#dialog_selection");
        var availableModules = moduleManager.getAvailableModules();
        dialog_selection.children('option:not(:first)').remove();
        for (var i = 0; i < availableModules.length; i++) {
          dialog_selection.append($('<option>', {value: availableModules[i], text:availableModules[i]}));
        }
        addDialog.data("manager", moduleManager);
        dialog_selection.val("Please pick one");
        addDialog.find("#dialog_name")[0].value = "";
        addDialog.dialog("open"); 
      }
    }
  }
  
  var itemNameChanged = function(managerItem) {
    var sidebarItemElem = itemsArray.findElementForManagerItem(managerItem);
    var newName = managerItem.getModule().getName();
    sidebarItemElem.id = newName;
    $(sidebarItemElem).contents().first()[0].textContent = newName;
    itemsArray.renameManagerItem(managerItem, newName);
  }
  
  var removeItemFromSidebar = function(managerItem) {
    var itemsElem = $(managerElem);
    var name = "[id='" + managerItem.getModule().getName() + "']";
    itemsElem.find(name).remove();
    itemsArray.removeItem(name);
  }
  
  var onModuleClick = function(managerItem) {
    var dialog = managerItem.getDialog();
    if (dialog)
      dialog.moveToTop();
  }
  
  var renameModuleClicked = function(managerItem) {
    return function(event) {
      event.stopPropagation();
      if (renameDialog) {
        renameDialog.data("managerItem", managerItem);
        var nameElem = renameDialog.find("#new_name");
        nameElem[0].value = managerItem.getModule().getName();
        renameDialog.dialog("open");
      }
    }
  }
  
  var addItemToSidebar = function(managerItem) {
    var name = managerItem.getModule().getName();
    var element = document.createElement("div");
    element.className = "w3-bar-item w3-button dropdown sidebar-module ";
    element.innerHTML = name;
    element.id = name;
    itemsArray.push(name, managerItem, element);
    element.onclick = function() {
      onModuleClick(managerItem);
    };
    var menuContent = document.createElement("div");
    menuContent.className = "dropdown-content";
    var menuItem = document.createElement("div");
    menuItem.innerHTML = "Rename";
    menuItem.style.fontWeight = "normal";
    menuItem.onclick = renameModuleClicked(managerItem);
    menuContent.appendChild(menuItem);
    element.appendChild(menuContent);
    managerElem.appendChild(element);
  }
  
  var itemChangedCallback = function() {
    return function(managedItem, eventType) {
      if (eventType === require("../utilities/managerItem").MANAGER_ITEM_CHANGE.ADDED)
        addItemToSidebar(managedItem);
      else if (eventType === require("../utilities/managerItem").MANAGER_ITEM_CHANGE.REMOVED)
        removeItemFromSidebar(managedItem);
      else if (eventType === require("../utilities/managerItem").MANAGER_ITEM_CHANGE.NAME_CHANGED)
        itemNameChanged(managedItem);
    }
  }
  
  var addAddDialogButton = function() {
    var button = document.createElement("button");
    button.className = "w3-bar-item w3-button add-dialog";
    button.innerHTML = "+ Add Dialog";
    button.id="addDialog";
    button.onclick = addDialogClicked();
    managerElem.appendChild(button);
    
  }
  
  var addManagerToSidebar = function() {
    var name = moduleManager.getName();
    managerElem = document.createElement("div");
    managerElem.className = "w3-bar-item w3-button sidebar-manager ";
    managerElem.innerHTML = name;
    managerElem.id = name;
    sidebarEle.appendChild(managerElem);
    
    addAddDialogButton();
    var itemsArray = moduleManager.getAllManagerItems();
    for (i = 0; i < itemsArray.length; i++) {
      addItemToSidebar(itemsArray[i]);
    }
    manager.addManagedItemChangedCallback(itemChangedCallback());
  }
  
  var initialise = function() {
    sidebarEle = jelem.find("#managerSidebar")[0];
    renameDialog = jelem.find("#rename-form");
    addDialog = jelem.find("#add-dialog-form");
    addManagerToSidebar();
  }
  
  initialise();
}

var ManagerSidebar = function(parentIn) {
  var parent = parentIn;
  var jelem = undefined;
  var sidebarEle = undefined;
  var renameDialog = undefined;
  var addDialog = undefined;
  var addManagerDialog = undefined;
  var messageDialog = undefined;
  var ManagerElementArray = [];
  var _this = this;

  this.open = function() {
    sidebarEle.style.display = "block";
    jelem.find("#sidebarOpen")[0].style.display = "none";
  }

  this.close = function() {
    sidebarEle.style.display = "none";
    jelem.find("#sidebarOpen")[0].style.display = "block";
  }
  
  this.setWidth = function(widthIn) {
    sidebarEle.style.width  = widthIn;
  }

  var addUICallback = function() {
    var element = jelem.find("#sidebarClose")[0];
    element.onclick = function() {
      _this.close();
    };
    element = jelem.find("#sidebarOpen")[0];
    element.onclick = function() {
      _this.open();
    };
    element = jelem.find("#addManager")[0];
    element.onclick = addManagerClicked();
  }
  
  var addDialogCallback = function() {
    var dialogSelection = addDialog.find("#dialog_selection");
    var dialogName = dialogSelection.find(":selected").text();
    var name = addDialog.find("#dialog_name")[0].value;
    var moduleManager = addDialog.data("manager");
    if ((dialogName !== "Please pick one") && name !== "") {
      var module = moduleManager.createModule(dialogName);
      module.setName(name);
      var dialog = moduleManager.createDialog(module, parent);
      dialog.destroyModuleOnClose = true;
      moduleManager.manageDialog(dialog);
      addDialog.dialog("close");
    } else {
      messageDialog.dialog("open");
    }
  }

  var addManagerDialogCallback = function() {
    var name = addManagerDialog.find("#manager_name")[0].value;
    if (name !== "") {
      var manager = new (require("../utilities/manager").ModuleManager)();
      manager.setName(name);
      _this.addManager(manager);
      addManagerDialog.dialog("close");
    } else {
      messageDialog.dialog("open");
    }
  } 

  var addManagerClicked = function() {
    return function(event) {
      event.stopPropagation();
      if (addManagerDialog) {
        addManagerDialog.find("#manager_name")[0].value = "";
        addManagerDialog.dialog("open"); 
      }
    }
  }
  
  var renameDialogCallback = function() {
    var nameElem = renameDialog.find("#new_name")[0];
    var managerItem = renameDialog.data("managerItem");
    managerItem.getModule().setName(nameElem.value);
    renameDialog.dialog("close");
  }
  
  var create = function(htmlData) {
    jelem = $(parent);
    var childNodes = $.parseHTML(htmlData);
    for (i = 0; i < childNodes.length; i++) {
      (jelem[0]).appendChild(childNodes[i]);
    }
    sidebarEle = jelem.find("#managerSidebar")[0];
    var renameElem = jelem.find("#rename-form");
    renameDialog = renameElem.dialog({
      appendTo: parent,
      autoOpen : false,
      height : 300,
      width : 400,
      resizable : false,
      modal : true,
      buttons : {
        "Rename" : renameDialogCallback,
        Cancel : function() {
          renameDialog.dialog("close");
        }
      },
      close : function() {
        renameDialog.dialog("close");
      }
    });
    renameElem.parent().draggable({
    	  containment: parent
      });
    
    var addManagerDialogElem = jelem.find("#add-manager-form");
    addManagerDialog = addManagerDialogElem.dialog({
      appendTo: parent,
      autoOpen : false,
      width : 400,
      resizable : false,
      modal : true,
      buttons : {
        "Confirm" : addManagerDialogCallback,
        Cancel : function() {
          addManagerDialog.dialog("close");
        }
      },
      close : function() {
        addManagerDialog.dialog("close");
      }
    });
    addManagerDialogElem.parent().draggable({
  	  containment: parent
    });
   
    var addDialogElem = jelem.find("#add-dialog-form");
    addDialog = addDialogElem.dialog({
      appendTo: parent,
      autoOpen : false,
      height : 300,
      width : 400,
      resizable : false,
      modal : true,
      buttons : {
        "Confirm" : addDialogCallback,
        Cancel : function() {
          addDialog.dialog("close");
        }
      },
      close : function() {
        addDialog.dialog("close");
      }
    });
    addDialogElem.parent().draggable({
    	  containment: parent
      });
    
    var messageDialogElem = jelem.find("#message-dialog");
    messageDialog = messageDialogElem.dialog({
      appendTo: parent,
      autoOpen : false,
      resizable : false,
      modal : true
    });
    messageDialogElem.parent().draggable({
  	  containment: parent
    });
    
    addUICallback();
  }
  
  this.addManager = function(manager) {
    var managerInArray = false;
    for (var i = 0; i < ManagerElementArray.length; i++) {
      if (ManagerElementArray[i].getManager() === manager) {
        managerInArray = true;
      }
    }
    if (managerInArray === false) {
      var managerElement = new ManagerElement(manager, jelem);
      ManagerElementArray.push(managerElement);
    }
  }
  
  var initialise = function() {
    if (parent)
      create(require("../snippets/managerSidebar.html"));
  }

  initialise();
}

exports.ManagerSidebar = ManagerSidebar;
