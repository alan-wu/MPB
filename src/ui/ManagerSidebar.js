var ManagerSidebar = function(parentIn, moduleManagerIn) {
  var parent = parentIn;
  var jelem = undefined;
  var sidebarEle = undefined;
  var moduleManager = moduleManagerIn;
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
    moduleManager.addDialog(dialog);
  }
  
  var create = function(htmlData) {
    jelem = $(parent);
    var childNodes = $.parseHTML(htmlData);
    for (i = 0; i < childNodes.length; i++) {
      parent.appendChild(childNodes[i]);
    }
    sidebarEle = jelem.find("#managerSidebar")[0];
    addUICallback();
  }
  
  var onModuleClick = function(name, module) {
    var dialog = moduleManager.getDialogWithName(name);
    if (dialog)
      dialog.moveToTop();
  }
  
  var addModuleToSidebar = function(module) {
    var name = module.getName();
    var element = document.createElement("div");
    element.className = "w3-bar-item w3-button";
    element.innerHTML = name;
    element.id = name;
    element.onclick = function() { onModuleClick(name, module) };
    sidebarEle.appendChild(element);
  }
  
  var removeModuleFromSidebar = function(module) {
    var itemsElem = $(sidebarEle);
    //sidebarEle.removeChild(itemsElem.find("#" + module.getName())[0]);
    itemsElem.find("#" + module.getName()).remove();
  }
  
  var moduleChangedCallback = function() {
    return function(module, eventType) {
      if (eventType === require("../manager").MANAGER_MODULE_CHANGE.ADDED)
        addModuleToSidebar(module);
      else if (eventType === require("../manager").MANAGER_MODULE_CHANGE.REMOVED)
        removeModuleFromSidebar(module);
    }
  }
  
  var initialise = function() {
    if (parent)
      create(require("../snippets/managerSidebar.html"));
    if (moduleManager) {
      var modulesArray = moduleManager.getAllModules();
      for (i = 0; i < modulesArray.length; i++) {
        var module = modulesArray[i];
        if (module)
          addModuleToSidebar(module);
      }
      moduleManager.addModuleChangedCallback(moduleChangedCallback());
    }
  }
  
  initialise();
}

exports.ManagerSidebar = ManagerSidebar;
