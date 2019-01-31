/* exported queryRunway */

"use strict";

function queryRunway(arrayBuffer) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();

    let url = "http://localhost:8000/query";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    // The the callback for our custom image.
    xhr.onload = function(_event) {
      var dataUrl = this.response.stylizedImage;
      resolve(dataUrl);
    };

    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };

    return Jimp.read(arrayBuffer).then(image => {
      image.getBase64(Jimp.MIME_JPEG, (error, jpegDataUrl) => {
        if (error) throw error;
        xhr.send(
          JSON.stringify({
            contentImage: jpegDataUrl
          })
        );
      });
    });
  });
}

// function queryRunway(base64Image) {
//   return new Promise((resolve, reject) => {
//     var xhr = new XMLHttpRequest();
//
//     let url = "http://localhost:8000/query";
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.responseType = "json";
//     // The the callback for our custom image.
//     xhr.onload = function(_event) {
//       console.log(this.response);
//       var dataUrl = this.response.stylizedImage;
//       resolve(dataUrl);
//     };
//
//     xhr.onerror = function() {
//       reject({
//         status: this.status,
//         statusText: xhr.statusText
//       });
//     };
//
//       xhr.send(
//         JSON.stringify({
//           contentImage: base64Image
//         })
//       );
//   });
// }
