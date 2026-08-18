(function () {
  var sira = ["white", "black", "plum", "midnight"];
  var dugme = document.getElementById("theme-toggle");
  if (!dugme) return;
  dugme.addEventListener("click", function () {
    var simdi = document.documentElement.dataset.theme || "white";
    var yeni = sira[(sira.indexOf(simdi) + 1) % sira.length];
    document.documentElement.dataset.theme = yeni;
    try { localStorage.setItem("theme", yeni); } catch (e) {}
  });
})();
