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

var last

function replaceImage(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  console.log(details.url);
  console.log(endpoint + formatURLParams([details.url]));
  let aiUrl = endpoint + formatURLParams({ originalUrl: details.url });
  // aiUrl = "https://www.bing.com/sa/simg/hpc26.png";
  // aiUrl = "http://www.blended.study/uploads/1/2/8/7/12875823/frame-1_orig.png"
  // aiUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg?test=" + Math.random()


  // filter.ondata = event => {
  //   writeBufferIfAvailable();
  // };

  var xhr = new XMLHttpRequest();
  xhr.open("GET", aiUrl, true);
  // Ask for the result as an ArrayBuffer.
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    console.log("Loaded custom image");
    var buffer = this.response;
    console.log(this);
    // var arrayBufferView = new Uint8Array( this.response );
    // console.log(arrayBufferView);



    // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
    // var urlCreator = window.URL || window.webkitURL;
    // var imageUrl = urlCreator.createObjectURL( blob );
    // console.log(imageUrl);

    // var img = document.getElementsByClassName("button");
    // img.src = imageUrl;

      console.log("timeout");
    // filter.ondata = event => {
    console.log("ONDATA");
        // console.log(event.data);
          filter.write(buffer);
          filter.disconnect();
      // };
  };

  xhr.send();
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  replaceImage,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);
