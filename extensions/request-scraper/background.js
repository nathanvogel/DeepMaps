// Default Mozilla sample
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
function redirect(requestDetails) {
  console.log("Redirecting: " + requestDetails.url);
  return {
    redirectUrl: "http://localhost:8080"
  };
}

function downloadAndPass(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  console.log("Downloading");
  console.log(details.url);
  browser.downloads.download({ url: details.url });

  filter.ondata = event => {
    // console.log(event.data);
    filter.write(event.data);
    filter.disconnect();
  };
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  downloadAndPass,
  { urls: ["https://*.tile.openstreetmap.org/*"], types: ["image"] },
  ["blocking"]
);
