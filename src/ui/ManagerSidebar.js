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
    moduleManager.addViewer(dialog);
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
    var viewer = moduleManager.getViewerWithName(name);
    if (viewer)
      viewer.moveToTop();
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
  
  var moduleAddedCallback = function() {
    return function(module) {
      addModuleToSidebar(module);
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
      moduleManager.addModuleAddedCallback(moduleAddedCallback());
    }
  }
  
  initialise();
}

exports.ManagerSidebar = ManagerSidebar;
