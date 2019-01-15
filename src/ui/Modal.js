var dialogPolyfill = require("dialog-polyfill");
require("dialog-polyfill/dialog-polyfill.css");
require("../styles/modal.css");

exports.PortalModal = function(modalIn) {
  var modal = modalIn;
  dialogPolyfill.registerDialog(modal);
  var messageElement = modal.querySelector("p");
  var inputElement = modal.querySelector("#textInput");
  var closeBtn = modal.querySelector(".small.close-modal-btn");
  var okBtn = modal.querySelector(".small.ok-modal-btn");
  var pressedCallback = undefined;
  
  
  var okPressed = function() {
    modal.close();
    if (pressedCallback)
      pressedCallback(true, inputElement.value);
  }
  
  var closePressed = function() {
    modal.close();
    if (pressedCallback)
      pressedCallback(false, inputElement.value);
  }
  
  modal.querySelector("form").addEventListener('keydown', function(event) {
    switch (event.key) {
      case "Enter":
        okPressed();
        event.preventDefault();
        break;
      case "Escape":
        closePressed();
        event.preventDefault();
        break;
      default:
        break;
    }
  }, false);
  
  okBtn.addEventListener('click', function() {
    okPressed();
  });
  
  closeBtn.addEventListener('click', function() {
    closePressed();
  });
  
  var setCallback = function(pressedCallbackIn) {
    pressedCallback = pressedCallbackIn;
  }
  
  this.prompt = function(message, defaultAnswer, pressedCallbackIn) {
    messageElement.innerHTML = message;
    inputElement.style.display = "inline";
    inputElement.value = defaultAnswer;
    closeBtn.style.display = "inline";
    setCallback(pressedCallbackIn);
    modal.showModal();
    inputElement.focus();
  }
  
  this.alert = function(message, pressedCallbackIn) {
    messageElement.innerHTML = message;
    inputElement.style.display = "none";
    closeBtn.style.display = "none";
    setCallback(pressedCallbackIn);
    modal.showModal();
    okBtn.focus();
  }
  
  this.confirm = function(message, pressedCallbackIn) {
    messageElement.innerHTML = message;
    inputElement.style.display = "none";
    closeBtn.style.display = "inline";
    setCallback(pressedCallbackIn);
    modal.showModal();
    okBtn.focus();
  }
}

