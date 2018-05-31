
//require("./styles/bootstrap.min.css");
require("./styles/w3.css");
require("./styles/jquery-ui.min.css");
require('bootstrap/dist/css/bootstrap.min.css');

exports.BodyViewer = require("./bodyRenderer").BodyViewer;
exports.CellPanel = require("./cell_panel").CellPanel;
exports.ModelsLoader = require("./modelsLoader").ModelsLoader;
exports.ModelPanel = require("./model_panel").ModelPanel;
exports.OrgansViewer = require("./organsRenderer").OrgansViewer;
exports.TissueViewer = require("./tissueRenderer").TissueViewer;
exports.VERSION = '0.2.0';
//exports.OrgansViewer = require("./organsRenderer").OrgansViewer;
