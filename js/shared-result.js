(function () {
  "use strict";
  var summary = /^#(\d{1,3}(?:\.\d)?),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})$/.exec(window.location.hash);
  if (!summary) return;
  var values = summary.slice(1).map(Number);
  var risk = values[0], exposures = values[1], phish = values[2], handled = values[3], legit = values[4];
  if (risk > 100 || exposures > phish || handled > legit) return;
  document.getElementById("shared-risk").textContent = risk;
  document.getElementById("shared-exposure").textContent = exposures + "/" + phish;
  document.getElementById("shared-legit").textContent = handled + "/" + legit;
  document.getElementById("shared-stats").hidden = false;
})();
