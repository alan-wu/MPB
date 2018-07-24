var OrgansViewerDialog = function(organsViewerIn) {
  (require('./BaseDialog').BaseDialog).call(this);
  var sceneData = undefined;
  var organsViewer = organsViewerIn;
  var organPartsGui = undefined;
  var speedSlider = undefined;
  var timeSlider = undefined;
  var texSlider = undefined;
  var organsPlayToggle = undefined;
  var fullScreen = false;
  var organGuiControls = new function() {
    this.Speed = 500;
  };
  // data used by dat.gui to control model specific controls. 
  var organPartGuiControls = function() {
  };
  var toolTip = undefined;
  var _myInstance = this;

  
  this.getModule = function() {
    return organsViewer;
  }
  
  // data used by dat.gui to control non-model specific controls. 
  var organsControl = function() {
      this.Background = [ 255, 255, 255 ]; // RGB array
  };
  
  /**
   * Speed slider has moved, adjust the play speed of the renderer.
   * @callback
   */
  var speedSliderChanged = function() {
    return function(value) {
      organsViewer.setPlayRate(value);
    }
  }

  var updateSpeedSlider = function() {
    var playRate = organsViewer.getPlayRate();
    organGuiControls.Speed = playRate;
    speedSlider.updateDisplay();  
  }
  
  var texSliderChanged = function() {
    organsViewer.setTexturePos(texSlider.value);
  }
  
  /**
   * Used to update internal timeer in scene when time slider has changed.
   */
  var timeSliderChanged = function() {
    organsViewer.updateTime(timeSlider.value);
  }
  
  var timeChangedCallback = function() {
    return function(time) {
      timeSlider.value = time / 30.0;
    };
  }
  
  var playPauseAnimation = function(element) {
    if (element.className == "play") {
      element.className = "pause";
      organsViewer.playAnimation(true);
    } else {
      element.className = "play";
      organsViewer.playAnimation(false);
    }
  }
  
  var organsBackGroundChanged = function() {
    return function(value) {
      var redValue = parseInt(value[0]);
      var greenValue = parseInt(value[1]);
      var blueValue = parseInt(value[2]);
      var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
      _myInstance.container.find("#organsSecondaryDisplayArea")[0].style.backgroundColor = backgroundColourString;
      organsViewer.changeBackgroundColour(backgroundColourString);
    }
  }
  
  /**
   * Callback function when a data geometry has been toggled on/off the scene.
   */
  var changeDataGeometryVisibility = function() {
    return function(value) {
      organsViewer.updateDataGeometryVisibility(value);
    }
  }
  
  var toggleFieldVisibility = function(dataFields) {
    return function(value) {
      organsViewer.updateFieldvisibility(dataFields, value);
      
    }
  }
  
  var openOrganModelLink = function() {
    window.open(sceneData.externalOrganLink, '');
  } 
  
  /**
   * Reset dat.gui ui and also update it to fit the current displaying
   * organs.
   */
  var updateOrganSpecificGui = function(sceneData) {
    organPartGuiControls = function() {
    };
    _myInstance.datGui.removeFolder('Visibility Control');
    organPartsGui = _myInstance.datGui.addFolder('Visibility Control');
    organPartsGui.open();
    if (sceneData.associateData) {
      organPartGuiControls["Data Geometry"] = false;
      organPartsGui.add(organPartGuiControls, "Data Geometry").onChange(changeDataGeometryVisibility());
    }
    if (sceneData.dataFields) {
      organPartGuiControls.Field = -1;
      var fieldPairs = {};
      fieldPairs["None"] = -1;
      for ( var i = 0; i < sceneData.dataFields.length; i ++ ) {
        fieldPairs[sceneData.dataFields[i].PartName] = i; 
      }
      organPartsGui.add(organPartGuiControls, 'Field', fieldPairs ).onChange(
          toggleFieldVisibility(sceneData.dataFields));
    }
    if (sceneData.nerveMap) {
      var nerveMapButton = { 'Toggle nerve':function(){ organsViewer.changeNerveMapVisibility() }};
      organPartsGui.add(nerveMapButton, 'Toggle nerve');
    }
    var otherSpecies = organsViewer.getAvailableSpecies(sceneData.currentSpecies,
      sceneData.currentSystem, sceneData.currentPart);
    if (otherSpecies.length > 1) {
      organPartGuiControls["Compared With"] = "none";
      var comparedSelected = organPartsGui.add(organPartGuiControls, 'Compared With', otherSpecies);
      comparedSelected.onChange(function(species) { organsViewer.changeComparedSpecies(species); } );
    }
        
    var element = _myInstance.container.find("#texSlider")[0];
    element.style.display = "none";
    toggleTimeControlsVisibility(false);
  }
  
  var updateLink = function(sceneData) {
    var button = _myInstance.container.find("#organLinkButton")[0];
    if (sceneData.externalOrganLink) {
      button.style.visibility = "visible";
    } else {
      button.style.visibility = "hidden";
    }
  }
  
  var sceneChangedCallback = function() {
    return function(sceneDataIn) {
      sceneData = sceneDataIn;
      _myInstance.setTitle(sceneData.currentName);
      updateLink(sceneData);
      updateOrganSpecificGui(sceneData);
      updateSpeedSlider();
     }
  }
  
  var organsPartNameClickedCallback = function(groupName) {
    return function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      organsViewer.setSelectedByGroupName(groupName, true);
    } 
  }
  
  var toggleTimeControlsVisibility = function(timeVarying) {
    var visibility = timeVarying ? "visible" : "hidden";
    if (organsPlayToggle)
      organsPlayToggle.style.visibility = visibility;
    if (timeSlider)
      timeSlider.style.visibility = visibility;
  }
  
  var organPartAddedCallback= function() {
    return function(groupName, timeVarying) {
      if (!organPartGuiControls.hasOwnProperty(groupName)) {
        organPartGuiControls[groupName] = true;
        var controller = organPartsGui.add(organPartGuiControls, groupName);
        var span = controller.__li.getElementsByTagName("span")[0];
        controller.onChange(organsViewer.changeOrganPartsVisibilityCallback(groupName));
        controller.__li.onmouseover = function() {organsViewer.setHighlightedByGroupName(groupName, true);};
        span.onclick = organsPartNameClickedCallback(groupName);
      }
      /* controls are hidden when organsViewer update the scene. 
       * Reenabling it when a geometry is time varying.
       * */
      if (timeVarying)
        toggleTimeControlsVisibility(true);
    }
  }
  
  /** 
   * Update layout of the organs panel, there are three different layouts at this moment.
   * 1. Normal display - Fullscreen/split screen with a single display.
   * 2. Nerve map display - Three panels when it is on fullscreen display.
   * 3. Species comparison display - Two panels when it is on fullscreen display.
   */
  var updateLayout = function() {

    if (fullScreen) {
      if (comparedSceneIsOn) {
        var element = _myInstance.container.find("#organsDisplayArea")[0];
        element.style.width = "50%";
        element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
        element.className = "organsSecondSceneDisplay";
        element.style.display = "block";
        element = _myInstance.container.find("#timeSlider_myInstance.container")[0];
        element.style.width = "50%";
        element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
        element.style.display = "none";
      } else if (nerveMapIsActive) {
        var element = _myInstance.container.find("#organsDisplayArea")[0];
        element.style.width = "33%";
        element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
        element.className = "organsSecondNerveDisplay";
        element.style.display = "block";
        element = _myInstance.container.find("#timeSlider_myInstance.container")[0];
        element.style.width = "33%";
        element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
        element.style.display = "block";
      } else {
        var element = _myInstance.container.find("#organsDisplayArea")[0];
        element.style.width = "100%";
        element = _myInstance.container.find("#timeSlider_myInstance.container")[0];
        element.style.width = "100%";
        element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
        element.style.display = "none";
        element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
        element.style.display = "none";
      }
    } else {
      var element = _myInstance.container.find("#organsDisplayArea")[0];
      element.style.width = "100%";
      element = _myInstance.container.find("#timeSlider_myInstance.container")[0];
      element.style.width = "100%";
      element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
      element.style.display = "none";
      element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
      element.style.display = "none";
    }
    
    if (nerveMapIsActive) {
      element = _myInstance.container.find("#texSlider")[0];
      element.style.display = "block";
      element = _myInstance.container.find("#organsImg_myInstance.container")[0];
      element.style.display = "block";
      element = _myInstance.container.find("#organsSecondaryDisplayRenderer")[0];
      element.style.display = "none";
      element = _myInstance.container.find("#CheckboxTree")[0];
      element.style.display = "block";
      
    } else {
      element = _myInstance.container.find("#texSlider")[0];
      element.style.display = "none";
      element = _myInstance.container.find("#organsImg_myInstance.container")[0];
      element.style.display = "none";
      element = _myInstance.container.find("#organsSecondaryDisplayRenderer")[0];
      element.style.display = "block";
      element = _myInstance.container.find("#CheckboxTree")[0];
      element.style.display = "none";
        
    }
  }
  
  var expandCollapseOrgans = function(source, portName) {
    if (source.value == "Expand") {
      fullScreen = true;
    } else {
      fullScreen = false;
    }
    expandCollapse(source, portName);
    activateAdditionalNerveMapRenderer();
  }
  
  /**
   * Add UI callbacks after html page has been loaded.
   */
  var addUICallback = function() {
    var organLinkeButton = _myInstance.container.find("#organLinkButton")[0];
    organLinkeButton.onclick = function() { openOrganModelLink() };
    //var organsScreenButton = _myInstance.container.find("#organsScreenButton")[0];
    //organsScreenButton.onclick = function() { expandCollapseOrgans(organsScreenButton, 'organsDisplayPort') };
    timeSlider = _myInstance.container.find("#organ_animation_slider")[0];
    timeSlider.oninput= function() { timeSliderChanged() };
    texSlider = _myInstance.container.find("#texSlider")[0];
    texSlider.oninput= function() { texSliderChanged() };
    organsPlayToggle = _myInstance.container.find("#organsPlayToggle")[0];
    organsPlayToggle.onclick = function() { playPauseAnimation(organsPlayToggle) };
    var element = _myInstance.container.find("#organsImgContainer")[0];
    //enableImageMouseInteraction(element);
  }
  
  var initialiseOrgansControlUI = function() {
    addUICallback();
    _myInstance.addDatGui();
    var control = new organsControl();
    var controller = _myInstance.datGui.addColor(control, 'Background');
    controller.onChange(organsBackGroundChanged());
    _myInstance.container.find("#organGui")[0].append(_myInstance.datGui.domElement);
    var resetViewButton = { 'Reset View':function(){ organsViewer.resetView() }};
    var viewAllButton = { 'View All':function(){ organsViewer.viewAll() }};
    speedSlider = _myInstance.datGui.add(organGuiControls, 'Speed', 0, 5000).step(50).onChange(speedSliderChanged());
    _myInstance.datGui.add(resetViewButton, 'Reset View');
    _myInstance.datGui.add(viewAllButton, 'View All');
    organPartsGui = _myInstance.datGui.addFolder('Visibility Control');
    organPartsGui.open();
  }
  
  var _organsViewerDialogClose = function() {
    return function(myDialog) {
      if (_myInstance.destroyModuleOnClose) {
        organsViewer.destroy();
        organsViewer = undefined;
      }
    }
  }
  
  var organsViewerChangedCallback = function() {
    return function(module, change) {
      if (change === require("../BaseModule").MODULE_CHANGE.NAME_CHANGED) {
        _myInstance.setTitle(module.getName());
      }
    }
  }
  
  var initialise = function() {
    if (organsViewer) {
      _myInstance.create(require("../snippets/organsViewer.html"));
      var name = organsViewer.getName();
      _myInstance.setTitle(name);
      initialiseOrgansControlUI();
      var displayArea = _myInstance.container.find("#organsDisplayArea")[0];
      organsViewer.initialiseRenderer(displayArea);
      organsViewer.addTimeChangedCallback(timeChangedCallback());
      organsViewer.addSceneChangedCallback(sceneChangedCallback());
      organsViewer.addOrganPartAddedCallback(organPartAddedCallback());
      organsViewer.addChangedCallback(organsViewerChangedCallback());
      _myInstance.onCloseCallbacks.push(_organsViewerDialogClose());
    }
  }
  
  
  initialise();
}

OrgansViewerDialog.prototype = Object.create((require('./BaseDialog').BaseDialog).prototype);
exports.OrgansViewerDialog = OrgansViewerDialog;
