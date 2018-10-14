"use strict";

var styler;

styler = ml5.styleTransfer("models/oldmap", modelLoaded);

// A function to be called when the models have loaded
function modelLoaded() {
  // Check if both models are loaded
  if (styler.ready) {
    console.log("style-transfer model loaded.");
  }
}

// Apply the transfer to both images!
function transferImage(inputImg, onImageStyled) {
  // console.log("Applying Style Transfer on this inputImg:");
  // console.log(inputImg);

  styler.transfer(inputImg, function(err, result) {
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
