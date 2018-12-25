/* globals transferImage loadStyleTransferModel */

"use strict";

// eslint-disable-next-line no-unused-vars
function listener(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();
  console.log(details);
  console.log(details.url);

  filter.ondata = event => {
    let str = decoder.decode(event.data, { stream: true });
    // Just change any instance of Example in the HTTP response
    // to WebExtension Example.
    str = str.replace(/Maps/g, "Stuff");
    filter.write(encoder.encode(str));
    filter.disconnect();
  };
  return {};
}

var endpoint = "http://localhost:8080/tmp.png";
function formatURLParams(params) {
  return (
    "?" +
    Object.keys(params)
      .map(key => {
        return key + "=" + encodeURIComponent(params[key]);
      })
      .join("&")
  );
}

function replaceImage(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  // console.log(details.url);
  // console.log(endpoint + formatURLParams([details.url]));

  // The URL to query our local server:
  let aiUrl = endpoint + formatURLParams({ originalUrl: details.url });
  // Uncomment to query a dummy image:
  // aiUrl = "https://www.bing.com/sa/simg/hpc26.png";

  var didReceiveOriginalRequest = false;
  filter.ondata = _event => {
    // Indicate that we already received the original image.
    didReceiveOriginalRequest = true;
  };

  var xhr = new XMLHttpRequest();
  xhr.open("GET", aiUrl, true);
  // Ask for the result as an ArrayBuffer.
  xhr.responseType = "arraybuffer";
  // The the callback for our custom image.
  xhr.onload = function(_event) {
    var buffer = this.response;

    if (didReceiveOriginalRequest) {
      // The filter stream is already open since the original image from
      // OpenStreetMap loaded faster, so we can directly write to it.
      console.log("Received generated image after the original image.");
      filter.write(buffer);
      filter.disconnect();
    } else {
      // The original request hasn't completed yet, so we replace the callback:
      filter.ondata = _event => {
        console.log("OSM request complete. We can now write our custom image.");
        filter.write(buffer);
        filter.disconnect();
      };
      console.log("Received generated image before the original image.");
    }
  };

  xhr.send();
  return {};
}

function doStyleTransfer(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let buffers = [];

  // Gather all the buffers coming in. The image might arrive in several pieces.
  filter.ondata = event => {
    buffers.push(event.data);
  };

  // When all the pieces are here.
  filter.onstop = _event => {
    console.log("Received a new tile.");
    // Concat them using the Blob API.
    var blob = new Blob(buffers, { type: "image/png" });
    // Convert the buffers to an Image
    blobUtil.blobToDataURL(blob).then(dataURL => {
      var image = document.createElement("img");
      image.src = dataURL;
      // We also need to wait for the image to be successfully loaded.
      image.onload = () => {
        // Apply style-transfer to the image.
        transferImage(image, styledImage => {
          if (!styledImage) {
            console.log("Didn't receive a styled image. aborting");
            filter.disconnect();
            return;
          }
          console.log("Image restyled.");
          image.remove();
          image = null;

          // Convert the result back to an ArrayBuffer.
          var styledBlob = blobUtil.dataURLToBlob(styledImage.src);
          styledImage = null;
          blobUtil
            .blobToArrayBuffer(styledBlob)
            .then(arrayBuff => {
              // success
              filter.write(arrayBuff);
              filter.disconnect();
              filter.ondata = null;
              filter.onstop = null;
              filter = null;
              buffers = null;
            })
            .catch(err => {
              // error
              filter.disconnect();
              console.error("Error while converting and writing the buffer:");
              console.error(err);
            });
        });
      };
    });
  };

  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  isGenerationLocalhost() ? replaceImage : doStyleTransfer,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);

var style = "oldmap01";
function isGenerationLocalhost() {
  return style === "localhost";
}

function restore_options() {
  browser.storage.sync.get(
    {
      style: "oldmap01"
    },
    items => {
      style = items.style;
      console.log("Selected style:", style);
      if (!isGenerationLocalhost()) {
        loadStyleTransferModel(style);
      }
    }
  );
}
restore_options();
