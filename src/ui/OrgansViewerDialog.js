require("../styles/my_styles.css");

var OrgansViewerDialog = function(organsViewerIn, parentIn, options) {
	(require('./BaseDialog').BaseDialog).call(this, parentIn, options);
	this.module = organsViewerIn;
	var sceneData = undefined;
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

	// data used by dat.gui to control non-model specific controls.
	var organsControl = function() {
		this.Background = [ 255, 255, 255 ]; // RGB array
	};

	/**
	 * Update layout of the organs panel, there are three different layouts at
	 * this moment. 1. Normal display - Fullscreen/split screen with a single
	 * display. 2. Nerve map display - Three panels when it is on fullscreen
	 * display. 3. Species comparison display - Two panels when it is on
	 * fullscreen display.
	 */
	var updateLayout = function(compareScene, nerveMapIsActive) {
		if (compareScene) {
			var element = _myInstance.container.find("#organsDisplayArea")[0];
			element.style.width = "50%";
			element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
			element.className = "organsSecondSceneDisplay";
			element.style.display = "block";
			element = _myInstance.container.find("#timeSliderContainer")[0];
			element.style.width = "50%";
			element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
			element.style.display = "none";
			element = _myInstance.container
					.find("#organsSecondaryDisplayRenderer")[0];
			element.style.display = "block";
			var secondDisplayRenderer = _myInstance.container
					.find("#organsSecondaryDisplayRenderer")[0];
			_myInstance.module
					.initialiseSecondaryRenderer(secondDisplayRenderer);
		} else if (nerveMapIsActive) {
			var element = _myInstance.container.find("#organsDisplayArea")[0];
			element.style.width = "100%";
			element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
			element.className = "organsSecondNerveDisplay";
			element.style.display = "none";
			element = _myInstance.container.find("#timeSliderContainer")[0];
			element.style.width = "95%";
			// move the following to model viewer?
			// element =
			// _myInstance.container.find("#organsTertieryDisplayArea")[0];
			// element.style.display = "block";
			// setupOrgansNerveSVG();
		} else {
			var element = _myInstance.container.find("#organsDisplayArea")[0];
			element.style.width = "100%";
			element = _myInstance.container.find("#timeSliderContainer")[0];
			element.style.width = "95%";
			element = _myInstance.container.find("#organsSecondaryDisplayArea")[0];
			element.style.display = "none";
			element = _myInstance.container.find("#organsTertieryDisplayArea")[0];
			element.style.display = "none";
		}
		if (nerveMapIsActive) {
			element = _myInstance.container.find("#texSlider")[0];
			element.style.display = "block";
			// element = _myInstance.container.find("#organsImgContainer")[0];
			// element.style.display = "block";
			element = _myInstance.container
					.find("#organsSecondaryDisplayRenderer")[0];
			element.style.display = "none";
			element = _myInstance.container.find("#CheckboxTree")[0];
			element.style.display = "block";

		} else {
			element = _myInstance.container.find("#texSlider")[0];
			element.style.display = "none";
			element = _myInstance.container.find("#organsImgContainer")[0];
			element.style.display = "none";
			element = _myInstance.container
					.find("#organsSecondaryDisplayRenderer")[0];
			element.style.display = "block";
			element = _myInstance.container.find("#CheckboxTree")[0];
			element.style.display = "none";
		}
	}

	var layoutUpdateRequiredCallback = function() {
		return function(compareScene, nerveMapIsActive) {
			updateLayout(compareScene, nerveMapIsActive);
		}
	}

	/**
	 * Speed slider has moved, adjust the play speed of the renderer.
	 * 
	 * @callback
	 */
	var speedSliderChanged = function() {
		return function(value) {
			_myInstance.module.setPlayRate(value);
		}
	}

	var updateSpeedSlider = function() {
		if (speedSlider) {
			var playRate = _myInstance.module.getPlayRate();
			organGuiControls.Speed = playRate;
			speedSlider.updateDisplay();
		}
	}

	var texSliderChanged = function() {
		_myInstance.module.setTexturePos(texSlider.value);
	}

	/**
	 * Used to update internal timeer in scene when time slider has changed.
	 */
	var timeSliderChanged = function() {
		_myInstance.module.updateTime(timeSlider.value);
	}

	var timeChangedCallback = function() {
		return function(time) {
			timeSlider.value = time / 30.0;
		};
	}

	var playPauseAnimation = function(element) {
		if (element.className == "play") {
			element.className = "pause";
			_myInstance.module.playAnimation(true);
		} else {
			element.className = "play";
			_myInstance.module.playAnimation(false);
		}
	}

	var organsBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue
					+ ',' + blueValue + ')';
			_myInstance.container.find("#organsSecondaryDisplayArea")[0].style.backgroundColor = backgroundColourString;
			_myInstance.module.changeBackgroundColour(backgroundColourString);
		}
	}

	/**
	 * Callback function when a data geometry has been toggled on/off the scene.
	 */
	var changeDataGeometryVisibility = function() {
		return function(value) {
			_myInstance.module.updateDataGeometryVisibility(value);
		}
	}

	/**
	 * Reset dat.gui ui and also update it to fit the current displaying organs.
	 */
	var updateOrganSpecificGui = function(sceneData) {
		organPartGuiControls = function() {
		};
		_myInstance.datGui.removeFolder('Visibility Control');
		organPartsGui = _myInstance.datGui.addFolder('Visibility Control');
		organPartsGui.open();
		if (sceneData.nerveMap) {
			var nerveMapButton = {
				'Toggle nerve' : function() {
					_myInstance.module.changeNerveMapVisibility()
				}
			};
			organPartsGui.add(nerveMapButton, 'Toggle nerve');
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
			_myInstance.module.setSelectedByGroupName(groupName, true);
		}
	}

	var toggleTimeControlsVisibility = function(timeVarying) {
		var visibility = timeVarying ? "visible" : "hidden";
		if (organsPlayToggle)
			organsPlayToggle.style.visibility = visibility;
		if (timeSlider)
			timeSlider.style.visibility = visibility;
	}

	var organPartAddedCallback = function() {
		return function(groupName, timeVarying) {
			if (!organPartGuiControls.hasOwnProperty(groupName)) {
				organPartGuiControls[groupName] = true;
				var controller = organPartsGui.add(organPartGuiControls,
						groupName);
				var span = controller.__li.getElementsByTagName("span")[0];
				controller.onChange(_myInstance.module
						.changeOrganPartsVisibilityCallback(groupName));
				controller.__li.onmouseover = function() {
					_myInstance.module.setHighlightedByGroupName(groupName,
							true);
				};
				span.onclick = organsPartNameClickedCallback(groupName);
			}
			/*
			 * controls are hidden when _myInstance.module update the scene.
			 * Reenabling it when a geometry is time varying.
			 */
			if (timeVarying)
				toggleTimeControlsVisibility(true);
		}
	}

	/**
	 * Add UI callbacks after html page has been loaded.
	 */
	var addUICallback = function() {
		var organLinkeButton = _myInstance.container.find("#organLinkButton")[0];
		organLinkeButton.onclick = function() {
			openOrganModelLink()
		};
		// var organsScreenButton =
		// _myInstance.container.find("#organsScreenButton")[0];
		// organsScreenButton.onclick = function() {
		// expandCollapseOrgans(organsScreenButton, 'organsDisplayPort') };
		timeSlider = _myInstance.container.find("#organ_animation_slider")[0];
		timeSlider.oninput = function() {
			timeSliderChanged()
		};
		texSlider = _myInstance.container.find("#texSlider")[0];
		texSlider.oninput = function() {
			texSliderChanged()
		};
		organsPlayToggle = _myInstance.container.find("#organsPlayToggle")[0];
		organsPlayToggle.onclick = function() {
			playPauseAnimation(organsPlayToggle)
		};
		var element = _myInstance.container.find("#organsImgContainer")[0];
		// enableImageMouseInteraction(element);
	}

	var initialiseOrgansControlUI = function() {
		addUICallback();
		_myInstance.addDatGui();
		var control = new organsControl();
		/* var controller = _myInstance.datGui.addColor(control, 'Background');
		controller.onChange(organsBackGroundChanged());
		*/
		_myInstance.container.find("#organGui")[0]
				.appendChild(_myInstance.datGui.domElement);
		var resetViewButton = {
			'Reset View' : function() {
				_myInstance.module.resetView()
			}
		};
		var viewAllButton = {
			'View All' : function() {
				_myInstance.module.viewAll()
			}
		};
		/*
		speedSlider = _myInstance.datGui
				.add(organGuiControls, 'Speed', 0, 5000).step(50).onChange(
						speedSliderChanged());
						*/
		_myInstance.datGui.add(resetViewButton, 'Reset View');
		_myInstance.datGui.add(viewAllButton, 'View All');
		organPartsGui = _myInstance.datGui.addFolder('Visibility Control');
		organPartsGui.open();
		updateOrganSpecificGui(_myInstance.module.getSceneData());
	}

	var organsViewerChangedCallback = function() {
		return function(module, change) {
			if (change === require("../modules/BaseModule").MODULE_CHANGE.NAME_CHANGED) {
				_myInstance.setTitle(module.getName());
			}
		}
	}

	var initialise = function() {
		if (_myInstance.module) {
			_myInstance.create(require("../snippets/organsViewer.html"));
			var name = _myInstance.module.getName();
			_myInstance.setTitle(name);
			initialiseOrgansControlUI();
			var displayArea = _myInstance.container.find("#organsDisplayArea")[0];
			_myInstance.module.initialiseRenderer(displayArea);
			_myInstance.module.addTimeChangedCallback(timeChangedCallback());
			_myInstance.module.addSceneChangedCallback(sceneChangedCallback());
			_myInstance.module
					.addOrganPartAddedCallback(organPartAddedCallback());
			_myInstance.module
					.addChangedCallback(organsViewerChangedCallback());
			_myInstance.module
					.addLayoutUpdateRequiredCallback(layoutUpdateRequiredCallback());
			var snackbar = _myInstance.getSnackbar();
			_myInstance.module.setMessageFunction(snackbar.showMessage);
		}
	}

	initialise();
}

OrgansViewerDialog.prototype = Object
		.create((require('./BaseDialog').BaseDialog).prototype);
exports.OrgansViewerDialog = OrgansViewerDialog;
