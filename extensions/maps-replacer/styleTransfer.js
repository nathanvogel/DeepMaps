"use strict";

var styler;

function loadStyleTransferModel(styleName) {
  console.log("Loading models/" + styleName + "...");
  // TODO : check how to release memory of the previous model.
  styler = ml5.styleTransfer("models/" + styleName, modelLoaded);
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Check if both models are loaded
  if (styler.ready) {
    console.log("style-transfer model loaded.");
  }
}

// Apply the transfer to both images!
function transferImage(inputImg, onImageStyled) {
  if (!styler) {
    console.warn("Styler not loaded yet.");
    return;
  }
  if (!styler.ready) {
    console.warn("Styler not ready yet.");
    return;
  }

  // console.log("Applying Style Transfer on this inputImg:");
  // console.log(inputImg);

  styler.transfer(inputImg, (err, result) => {
    if (err) {
      console.error("Failed to apply the style transfer.");
      console.log(err);
      return null;
    }
    // console.log("Style transfer finished. Result = ");
    // console.log(result);
    onImageStyled(result);
    result = null;
  });
}
