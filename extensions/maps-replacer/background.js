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

// eslint-disable-next-line no-unused-vars
function replaceImage(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  console.log("Downloading");
  console.log(details.url);
  // browser.downloads.download({ url: details.url });
  var xhr = new XMLHttpRequest();

  // Use JSFiddle logo as a sample image to avoid complicating
  // this example with cross-domain issues.
  xhr.open("GET", "https://localhost:8080/", true);

  // Ask for the result as an ArrayBuffer.
  xhr.responseType = "arraybuffer";

  xhr.onload = function(e) {
    console.log("LOADED");
    // Obtain a blob: URL for the image data.
    var arrayBufferView = new ArrayBuffer(this.response);
    console.log(arrayBufferView);

    filter.ondata = event => {
      console.log(event.data);
      filter.write(arrayBufferView);
      filter.disconnect();
    };
    // var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    // var urlCreator = window.URL || window.webkitURL;
    // var imageUrl = urlCreator.createObjectURL( blob );
    // var img = document.querySelector( "#photo" );
    // img.src = imageUrl;
  };

  xhr.send();
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  replaceImage,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);
