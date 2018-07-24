var SidebarItemArray = function() {
  var array = [];
  var _this = this;
  
  this.push = function(name, managerItem, element) {
    array[name] = [managerItem, element];
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



var ManagerSidebar = function(parentIn, moduleManagerIn) {
  var parent = parentIn;
  var jelem = undefined;
  var sidebarEle = undefined;
  var moduleManager = moduleManagerIn;
  var renameDialog = undefined;
  var currentItemElement = undefined;
  var itemsArray = new SidebarItemArray();
  _this = this;
  
  var open = function() {
    sidebarEle.style.display = "block";
  }
  
  var close = function() {
    sidebarEle.style.display = "none";
  }
  
  var addUICallback = function() {
    var element = jelem.find("#sidebarClose")[0];
    element.onclick = function() { close() };
    var element = jelem.find("#sidebarOpen")[0];
    element.onclick = function() { open() };
    var element = jelem.find("#addPanel")[0];
    element.onclick = function() { addPanelPressed() };
  }
  
  var addPanelPressed = function() {
    var module = moduleManager.createModule("Body Viewer");
    module.readSystemMeta();
    var dialog = new (require("./BodyViewerDialog").BodyViewerDialog)(module);
    dialog.setTitle(module.getName());
    dialog.destroyModuleOnClose = true;
    moduleManager.manageDialog(dialog);
  }
  
  var renameDialogCallback = function() {
    var nameElem = renameDialog.find( "#new_name" )[0];
    var managerItem = itemsArray.findManagerItemForElement(currentItemElement);
    managerItem.getModule().setName(nameElem.value);
    renameDialog.dialog( "close" );
  }

  var create = function(htmlData) {
    jelem = $(parent);
    var childNodes = $.parseHTML(htmlData);
    for (i = 0; i < childNodes.length; i++) {
      parent.appendChild(childNodes[i]);
    }
    sidebarEle = jelem.find("#managerSidebar")[0];
    var renameElem = jelem.find("#rename-form");
    renameDialog = renameElem.dialog({
      autoOpen: false,
      height: 300,
      width: 300,
      modal: true,
      buttons: {
        "Rename": renameDialogCallback,
        Cancel: function() {
          renameDialog.dialog( "close" );
        }
      },
      close: function() {
        renameDialog.dialog( "close" );
      }
    });
    
    
    addUICallback();
  }
  
  var onModuleClick = function(managerItem) {
    var dialog = managerItem.getDialog();
    if (dialog)
      dialog.moveToTop();
  }
  
  var renameModuleClicked = function(element) {
    return function(event) {
      currentItemElement = element;
      event.stopPropagation();
      if (renameDialog) {
        currentItemElement = element;
        var nameElem = renameDialog.find( "#new_name" );
        nameElem[0].value = element.id;
        renameDialog.dialog( "open" );
      }
    }
  }
  
  var addItemToSidebar = function(managerItem) {
    var name = managerItem.getModule().getName();
    var element = document.createElement("div");
    element.className = "w3-grey w3-bar-item w3-button dropdown";
    element.innerHTML = name;
    element.id = name;
    itemsArray.push(name, managerItem, element);
    element.onclick = function() { onModuleClick(managerItem) };
    var menuContent = document.createElement("div");
    menuContent.className = "dropdown-content";
    var menuItem = document.createElement("div");
    menuItem.innerHTML = "Rename";
    menuItem.onclick = renameModuleClicked(element);
    menuContent.appendChild(menuItem);
    element.appendChild(menuContent);
    sidebarEle.appendChild(element);
  }
  
  var removeItemFromSidebar = function(managerItem) {
    var itemsElem = $(sidebarEle);
    var name = "[id='" + managerItem.getModule().getName() + "']";
    itemsElem.find(name).remove();
    itemsArray.removeItem(name);
  }
  
  var itemNameChanged = function(managerItem) {
    var sidebarItemElem = itemsArray.findElementForManagerItem(managerItem);
    var newName = managerItem.getModule().getName();
    sidebarItemElem.id = newName;
    $(sidebarItemElem).contents().first()[0].textContent = newName;
    //$(sidebarItemElem).contents().last()[0].textContent = newName;
    //sidebarItemElem.innerHTML = newName;
    itemsArray.renameManagerItem(managerItem, newName);
   
  }
  
  var itemChangedCallback = function() {
    return function(managedItem, eventType) {
      if (eventType === require("../utilities/manager").MANAGER_ITEM_CHANGE.ADDED)
        addItemToSidebar(managedItem);
      else if (eventType === require("../utilities/manager").MANAGER_ITEM_CHANGE.REMOVED)
        removeItemFromSidebar(managedItem);
      else if (eventType === require("../utilities/manager").MANAGER_ITEM_CHANGE.NAME_CHANGED)
        itemNameChanged(managedItem);
    }
  }
  
  var initialise = function() {
    if (parent)
      create(require("../snippets/managerSidebar.html"));
    if (moduleManager) {
      var itemsArray = moduleManager.getAllManagerItems();
      for (i = 0; i < itemsArray.length; i++) {
        addItemToSidebar(itemsArray[i]);
      }
      moduleManager.addManagedItemChangedCallback(itemChangedCallback());
    }
  }
  
  initialise();
}

exports.ManagerSidebar = ManagerSidebar;
