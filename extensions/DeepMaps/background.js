/* globals transferImage loadStyleTransferModel queryRunway */

"use strict";

/*
 * This is just a default web extension example of replacing text
 * inside an HTTP request.
 */
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

// My local server default address
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

function replaceImageWithCustomServer(details) {
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

function replaceTile(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let buffers = [];

  // Gather all the buffers coming in. The image might arrive in several pieces.
  filter.ondata = event => {
    buffers.push(event.data);
  };

  filter.onstop = _event => {
    // When all the pieces are here.
    console.log("Received a new tile from OSM.");
    // Concat them using the Blob API.
    var blob = new Blob(buffers, { type: "image/png" });

    var promise;
    switch (style) {
      case "runway-ast":
        promise = queryRunway(blob);
        break;
      default:
        promise = transferImage(blob);
        break;
    }

    promise
      // Check errors in dataUrl
      .then(dataUrl => {
        if (!dataUrl) throw "Didn't receive a styled image. aborting";
        console.log("Image restyled.");
        return dataUrl;
      })
      // Convert data url to an ArrayBuffer writable to our StreamFilter
      .then(blobUtil.dataURLToBlob)
      .then(blobUtil.blobToArrayBuffer)
      // Write the restyled and converted image to the request.
      .then(arrayBuff => {
        filter.write(arrayBuff);
      })
      .catch(error => {
        // Catch any error and log them
        console.error("Couldn't restyle the image:", error);
        // Return something so that the error is "handled" and the then()
        // handler can be called and clean up.
        return 0;
      })
      .then(() => {
        filter.disconnect();
        filter.ondata = null;
        filter.onstop = null;
        filter = null;
        buffers = null;
      });
  };

  return {};
}

var style = DEFAULTS.STYLE;

function isStyleTransfer() {
  switch (style) {
    case "localhost":
    case "runway-ast":
      return false;
    default:
      return true;
  }
}

function getReplaceFunction() {
  switch (style) {
    case "localhost":
      return replaceImageWithCustomServer;
    default:
      return replaceTile;
  }
}

function startListeningTiles() {
  browser.webRequest.onBeforeRequest.addListener(
    getReplaceFunction(),
    { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
    ["blocking"]
  );
}

function restore_options() {
  browser.storage.sync.get(
    {
      style: DEFAULTS.STYLE
    },
    items => {
      style = items.style;
      console.log("Selected style:", style);
      if (isStyleTransfer()) {
        loadStyleTransferModel(style);
      }
      startListeningTiles();
    }
  );
}

restore_options();
