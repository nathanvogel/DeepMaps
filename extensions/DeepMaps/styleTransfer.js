/* exported loadStyleTransferModel transferImage */

"use strict";

var styler;

function loadStyleTransferModel(styleName) {
  console.log("Loading models/" + styleName + "...");
  // TODO : check how to release memory of the previous model.
  styler = ml5.styleTransfer("models/" + styleName, modelLoaded);
}

function modelLoaded() {
  // Check if both models are loaded
  if (styler.ready) {
    console.log("style-transfer model loaded.");
  }
}

function transferImage(blob) {
  return new Promise((resolve, reject) => {
    if (!styler) {
      console.warn("Styler not loaded yet.");
      reject("Styler not loaded yet.");
      return;
    }
    if (!styler.ready) {
      console.warn("Styler not ready yet.");
      reject("Styler not ready yet.");
      return;
    }

    return blobUtil.blobToDataURL(blob).then(dataURL => {
      var image = document.createElement("img");
      image.src = dataURL;
      image.onload = () => {
        // We also need to wait for the image to be successfully loaded.
        styler.transfer(image, (err, result) => {
          // Clean the image
          image.remove();
          image = null;

          // Check style-transfer errors.
          if (err) {
            console.error("Failed to apply the style transfer.");
            console.log(err);
            reject(err);
            return null;
          }

          // Send the image back to background.js
          resolve(result ? result.src : result);
        });
      };
    });
  });
}
