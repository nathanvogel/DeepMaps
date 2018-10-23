// Saves options to browser.storage
function save_options() {
  var style = document.getElementById("style").value;
  browser.storage.sync.set(
    {
      style: style
    },
    () => {
      browser.runtime.reload();
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in browser.storage.
function restore_options() {
  browser.storage.sync.get(
    {
      style: "oldmap01"
    },
    items => {
      document.getElementById("style").value = items.style;
      if (items.style === "localhost") {
        document.getElementById("localhost-info").style.display = "block";
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
