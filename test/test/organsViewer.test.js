var physiomeportal = require("../../src/index");
const path = require("path");
var assert = require('chai').assert;
var expect = require('chai').expect;
const nock = require('nock');
var fs = require('file-system');
const container = window.document.querySelector("#container");
var geometryCount = 0;
var currentDone = undefined;

var preRenderCallback = function() {
  return function() {
    it('PreRenderCallbackFunction',function() 
      {assert.isTrue(true, 'PreRenderCallbackFunction is successfully called');}
    );
  }
}

var timeChangedCallback = function() {
  return function(currentTime) {
    assert.isDefined(currentDone, "Done should be defined.")
    if (currentDone)
      currentDone();
  }
}

var organsViewerChangedCallback = function() {
  return function(module, change) {
    assert.isDefined(currentDone, "Done should be defined.")
    if (currentDone)
      currentDone();
  }
}

function checkOrganViewer() {
  describe('OrganViewer()', function(){
    var organsViewer = undefined;
    before('Initialise new Organ Viewer', function() {
      organsViewer = new physiomeportal.OrgansViewer();
      assert.isObject(organsViewer, 'Organ Viewer is available');
    });
    describe('Local Variables()', function(){
      it('typeName', function(){
        assert.equal(organsViewer.typeName, "Organ Viewer");
      });
      it('zincRenderer', function(){
        assert.isUndefined(organsViewer.zincRenderer, 'renderer is an object');
      });
      it('Polyfill zincRenderer', function(){
        var parameters = {};
        var context = require("gl")(1024, 1024);
        parameters['context'] = context;
        organsViewer.zincRenderer = new (require('zincjs')).Renderer(container, window);
        organsViewer.zincRenderer.initialiseVisualisation(parameters);
        assert.isObject(organsViewer.zincRenderer, 'renderer is an object');
        assert.isUndefined(organsViewer.zincRenderer.render(), 'renderer start rendering');
      });
      
      it('graphicsHighlight', function(){
        assert.isObject(organsViewer.graphicsHighlight, 'graphicsHighlight is an object');
      });
    });
    describe('Methods()', function(){
      before('Setup Mock response', function() {
        var scope = nock('https://www.mytestserver.com')
          .persist()
          .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
          .get(function(uri) {
            return uri;
          })
          .reply(200, (uri, requestBody, cb) => {console.log(uri);fs.readFile("." + uri, cb)});
      });
      beforeEach('Reset done', function() {
        currentDone = undefined;
      });
      it('addTimeChangedCallback', function() {
        assert.isUndefined(organsViewer.addTimeChangedCallback(timeChangedCallback()), "TimeChangedCallback added successfully");
      });
      it('updateTime', function() {
        assert.isUndefined(organsViewer.updateTime(50), "Time is updated");
      });
      it('addChangedCallback', function() {
        assert.isUndefined(organsViewer.addChangedCallback(organsViewerChangedCallback()), "organsViewerChangedCallback added successfully");
      });
      it('loadOrgansFromURL', function(done) {
        currentDone = done;
        assert.isUndefined( organsViewer.loadOrgansFromURL("https://www.mytestserver.com/models/test_metadata.json", 
          "test species", "test system", "test part"), "Load organs called");
      });
      var settings = undefined;
      it('exportSettings', function() {
        settings = organsViewer.exportSettings();
        assert.isObject(settings, "Successfully export settings");
        assert.equal(settings.name, organsViewer.instanceName, "Name is correct");
        assert.equal(settings.metaURL, "https://www.mytestserver.com/models/test_metadata.json", "MetaURL is correct");
      });
      it('importSettings', function() {
        assert.isTrue(organsViewer.importSettings(settings), "ImportSettings is called successfully");
      });
      it('destroy', function(done) {
        currentDone = done;
        assert.isUndefined(organsViewer.destroy(), "Destroy is called successfully");
        assert.isUndefined(organsViewer.zincRenderer, "ZincRenderer has been destroyed");
      });
    });
  });
}

function checkPhysiomePortalObject() {
  it('PhysiomePortal is a valid object', function(){
    assert.isObject(physiomeportal, 'PhysiomePortal is an object'); 
  });
  checkOrganViewer();
}

describe('PhysiomePortal', function(){
  checkPhysiomePortalObject();
})
