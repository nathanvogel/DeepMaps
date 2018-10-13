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
  filter.ondata = event => {
    // Indicate that we already received the original image.
    didReceiveOriginalRequest = true;
  };

  var xhr = new XMLHttpRequest();
  xhr.open("GET", aiUrl, true);
  // Ask for the result as an ArrayBuffer.
  xhr.responseType = "arraybuffer";
  // The the callback for our custom image.
  xhr.onload = function(event) {
    var buffer = this.response;

    if (didReceiveOriginalRequest) {
      // The filter stream is already open since the original image from
      // OpenStreetMap loaded faster, so we can directly write to it.
      console.log("Received generated image after the original image.");
      filter.write(buffer);
      filter.disconnect();
    } else {
      // The original request hasn't completed yet, so we replace the callback:
      filter.ondata = event => {
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

function setup() {
  noCanvas();
}

function draw() {}

function doStyleTransfer(details) {
  console.log("DO STYLE TRANSFER");
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let buffers = [];

  filter.ondata = event => {
    console.log("on data ");
    buffers.push(event.data);
  };

  filter.onstop = event => {
    // event.data is an ArrayBuffer.
    // console.log(event.data);
    // console.log(event);
    console.log("on stop");
    // var arrayBuffer = event.data;
    // var blob = blobUtil.arrayBufferToBlob(arrayBuffer, "image/png");
    var blob = new Blob(buffers, { type: "image/png" });
    console.log(blob);
    blobUtil.blobToDataURL(blob).then(function(dataURL) {
      console.log(dataURL);
      // var image = new Image(256, 256);
      // image.src = dataURL;

      // Using p5 because the HTML Node argument seems to be buggy...
      var image = createImg(dataURL, function() {
        transferImage(image, function(styledImage) {
          console.log("Received generated image after the original image.");
          console.log(styledImage);
          // var buffer = Uint8Array.from(atob(styledImage.src), c => c.charCodeAt(0));

          var styledBlob = blobUtil.dataURLToBlob(styledImage);
          console.log(styledBlob);
          blobUtil
            .blobToArrayBuffer(styledBlob)
            .then(function(arrayBuff) {
              // success
              console.log("Converted to arrayBuff");
              console.log(arrayBuff);
              filter.write(arrayBuff);
              filter.disconnect();
            })
            .catch(function(err) {
              // error
              filter.disconnect();
              console.error(err);
            });
        });
      });
      // image.size(256, 256);
      // image.attribute("width", 256);
      // image.attribute("height", 256);
      console.log(image);

      // var bytes = new Uint8Array(arrayBuffer);
      // var image = new Image(256, 256);
      // image.src = "data:image/png;base64," + encode(bytes);
    });
  };

  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  doStyleTransfer,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);
