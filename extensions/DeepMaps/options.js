// Saves options to browser.storage
function save_options() {
  var style = document.getElementById("style").value;
  var runwayASTUrl = document.getElementById("runwayASTUrl").value;
  browser.storage.sync.set(
    {
      style: style,
      runwayASTUrl: runwayASTUrl
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
      style: DEFAULTS.STYLE,
      runwayASTUrl: DEFAULTS.RUNWAY_AST_URL
    },
    items => {
      document.getElementById("style").value = items.style;
      document.getElementById("runwayASTUrl").value = items.runwayASTUrl;
      if (items.style === "localhost") {
        document.getElementById("localhost-info").style.display = "block";
      }
      if (items.style === "runway-ast") {
        document.getElementById("runway-info").style.display = "block";
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("style").addEventListener("change", save_options);
