// tema: tek tık, iki durum
(function () {
  var d = document.getElementById("tema");
  if (!d) return;
  d.addEventListener("click", function () {
    var yeni = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = yeni;
    try { localStorage.setItem("theme", yeni); } catch (e) {}
  });
})();
