/**
 * Main loop to start loading the Physiome Journal Portal page,
 * it currenrly contains 5 panels containly a module each 
 * in the following layout.
 * 
 * <pre>
 * -------------------------
 * |     |     |     |     |
 * |     |     |  C  |     |
 * |  A  |  B  |-----|  E  |
 * |     |     |  D  |     |
 * |     |     |     |     |
 * -------------------------
 * 
 * A: {@link PJP.BodyViewer}
 * B: {@link PJP.OrgansViewer}
 * C: {@link PJP.TissueViewer}
 * D: {@link PJP.CellPanel}
 * E: {@link PJP.ModelPanel}
 * </pre>
 * 
 * Currently the main and each of the panel layouts are loaded into the page
 * using link element imports. 
 * This portal currently allows users to view from the 3D anatomy models to the
 * cell models of different parts of the bodies in selected species.
 * More functionalities will be implemented soon including annotations of models,
 * mesh refinement and many more.  
 * 
 * @class
 * @author Alan Wu
 * @returns {PJP.Main}
 */
PJP.Main = function()  {
  var bodyViewer = undefined;
  var organsViewer = undefined;
  var tissueViewer = undefined;
  var cellPanel = undefined;
  var modelPanel = undefined;
  var modelsLoader = undefined;
  var UIIsReady = true;
  var _this = this;
  this.DOM = [];
  
  var systemMetaReadyCallback = function() {
    return function() {
      bodyViewer.readSystemMeta();
    }
  }
  
  /**
   * Initialise all the panels required for PJP to function correctly.
   * Modules used incude - {@link PJP.ModelsLoader}, {@link PJP.BodyViewer},
   * {@link PJP.OrgansViewer}, {@link PJP.TissueViewer}, {@link PJP.CellPanel}
   * and {@link PJP.ModelPanel}.
   */
  var initialiseMain = function() {
    modelsLoader = new PJP.ModelsLoader();
    bodyViewer = new PJP.BodyViewer(modelsLoader, "bodyDisplayPort");
    organsViewer = new PJP.OrgansViewer(modelsLoader, "organsDisplayPort");
    tissueViewer = new PJP.TissueViewer("tissueDisplayPort");
    cellPanel = new PJP.CellPanel("cellDisplayPort");
    modelPanel = new PJP.ModelPanel("modelDisplayPort");
    modelPanel.enableSVGController('testsvg');
    modelsLoader.addSystemMetaIsReadyCallback(systemMetaReadyCallback());
    modelsLoader.initialiseLoading();
    bodyViewer.setOrgansViewer(organsViewer);
    organsViewer.setTissueViewer(tissueViewer);
    organsViewer.setCellPanel(cellPanel);
    organsViewer.setModelPanel(modelPanel);
    tissueViewer.setCellPanel(cellPanel);
    tissueViewer.setModelPanel(modelPanel);
  }
  
  var addUICallback = function() {
  }
  
  var loadHTMLComplete = function(link) {
    return function(event) {
      var localDOM = document.body;
      var childNodes = null;
      if (link.import.body !== undefined)
        childNodes = link.import.body.childNodes;
      else if (link.childNodes !== undefined)
        childNodes = link.childNodes;
      for (i = 0; i < childNodes.length; i++) {
        localDOM.appendChild(childNodes[i]);
      }
      initialiseMain();
      document.head.removeChild(link);
      addUICallback();
      UIIsReady = true;
    }
  }
  
  var initialise = function() {
    var link = document.createElement('link');
    link.rel = 'import';
    link.href = 'snippets/main.html';
    link.onload = loadHTMLComplete(link);
    link.onerror = loadHTMLComplete(link);
    document.head.appendChild(link);  
  }

  initialise();
}
