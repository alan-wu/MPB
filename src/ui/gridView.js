require("../styles/gridView.css")

exports.GridView = function(containerIn) {
	var container = containerIn;
	var parent = undefined;
	var rowElement = undefined;
	var template = require("../snippets/gridView.html");
	var _this = this;
	var dialogs = [];
	//var sensor = undefined;
	var height = "800px";
	this.isEnabled = false;

	this.enable = function(managerItems) {
		if (_this.isEnabled == false) {
			parent[0].style.display = "block";
			_this.isEnabled = true;
			for (var i = 0; i < managerItems.length; i++) {
				_this.addManagerItem(managerItems[i]);
			}
		}
	}

	this.disable = function() {
		parent[0].style.display = "none";
		_this.isEnabled = false;
		for (var i = 0; i < dialogs.length; i++) {
			dialogs[i].undock();
		}
		dialogs = [];
		rowElement.innerHTML = "";
	}
	
	this.setHeight = function(heightIn) {
		height = heightIn;
		if (_this.isEnabled) {
			for (var i = 0; i < dialogs.length; i++) {
				var containment = dialogs[i].getContainment();
				containment.style.height = height;
			}
		}
	} 

	var getNewItemContainer = function() {
		var itemTemplate = '<div class="Column"><div class="itemContainment" style="height:' + height + ';"></div></div>';
		var item = $(itemTemplate);
		var itemContainment = item.find(".itemContainment")[0];
		rowElement.appendChild(item[0]);
		return itemContainment;
	}

	var removeContainer = function(containment) {
		if (containment.parentNode.parentNode === rowElement) {
			rowElement.removeChild(containment.parentNode);
			return true;
		}
		return false;
	}
	
	this.addManagerItem = function(item) {
		if (_this.isEnabled) {
			var dialog = item.getDialog();
			if (dialog && (dialogs.includes(dialog)== false)) {
				var containment = getNewItemContainer();
				dialog.dockToContainment(containment);
				dialogs.push(dialog);
			}
		}
	}
	
	var removeDialog = function(dialog) {
		if (dialog && (dialogs.includes(dialog) == true)) {
			var containment = dialog.getContainment();
			if (removeContainer(containment)) {
				dialog.undock();
				var index = dialogs.indexOf(dialog);
				if (index > -1) {
					dialogs.splice(index, 1);
				}
				updateSize();
			}
		}
	}

	this.removeManagerItem = function(item) {
		var dialog = item.getDialog();
		removeDialog(dialog);
	}
	
	var setup = function() {
		parent = $(template);
		rowElement = parent.find(".Row")[0];
		container.appendChild(parent[0]);
	}

	setup();
}

