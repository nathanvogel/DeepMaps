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

var endpoint = "http://localhost:8080";
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
  console.log(details.url);
  console.log(endpoint + formatURLParams([details.url]));

  var xhr = new XMLHttpRequest();
  xhr.open("GET", endpoint + formatURLParams([details.url]), true);
  // Ask for the result as an ArrayBuffer.
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    console.log("Loaded custom image");
    var arrayBufferView = this.response;

    filter.ondata = event => {
      // console.log(event.data);
      filter.write(arrayBufferView);
      filter.disconnect();
    };
  };

  xhr.send();
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  replaceImage,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);
