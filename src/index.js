
//require("./styles/bootstrap.min.css");
require("./styles/w3.css");
require("./styles/jquery-ui.min.css");
require('./styles/bootstrap.min.css');

exports.BodyViewer = require("./bodyRenderer").BodyViewer;
exports.CellPanel = require("./cell_panel").CellPanel;
exports.ModelsLoader = require("./modelsLoader").ModelsLoader;
exports.ModelPanel = require("./model_panel").ModelPanel;
exports.OrgansViewer = require("./organsRenderer").OrgansViewer;
exports.TissueViewer = require("./tissueRenderer").TissueViewer;
exports.TissueViewer = require("./tissueRenderer").TissueViewer;
exports.BaseDialog = require("./ui/BaseDialog").BaseDialog;
exports.OrgansViewerDialog = require("./ui/OrgansViewerDialog").OrgansViewerDialog;
exports.BodyViewerDialog = require("./ui/BodyViewerDialog").BodyViewerDialog;
exports.EVENT_TYPE = require("./utilities/eventNotifier").EVENT_TYPE;
exports.EventNotifier = require("./utilities/eventNotifier").EventNotifier;
exports.ModuleManager = require("./manager").ModuleManager;
exports.ManagerSidebar = require("./ui/ManagerSidebar").ManagerSidebar;
//exports.CellPanelDialog = require("./ui/CellPanelDialog").CellPanelDialog;
exports.VERSION = '0.2.0';

