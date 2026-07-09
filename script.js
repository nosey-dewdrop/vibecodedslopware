// vibecodedflopware — confetti field, cursor trail, bursts, demo quiz

(function () {
  "use strict";

  const GLYPHS = ["+", "✱", "*", "·", "▪"];
  const COLORS = ["#5a4a9f", "#b5a3ec", "#f77fae", "#e0af2e", "#7fbf85"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- theme (white terminal / black terminal) ----------

  const toggle = document.getElementById("theme-toggle");
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    if (toggle) toggle.textContent = t === "dark" ? "[light]" : "[dark]";
  };
  let theme = localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(theme);
  if (toggle) {
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", theme);
      applyTheme(theme);
    });
  }

  // ---------- static background field (like the reference: sparse, calm) ----------

  const field = document.getElementById("confetti-field");

  function buildField() {
    field.innerHTML = "";
    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(70, Math.max(30, Math.round(area / 22000)));
    for (let i = 0; i < count; i++) {
      const g = document.createElement("span");
      g.className = "glyph";
      g.textContent = pick(GLYPHS);
      g.style.left = rand(0, 100) + "vw";
      g.style.top = rand(0, 100) + "vh";
      g.style.color = pick(COLORS);
      g.style.fontSize = rand(8, 22) + "px";
      g.style.setProperty("--tw", rand(4, 10) + "s");
      g.style.setProperty("--td", rand(0, 8) + "s");
      field.appendChild(g);
    }
  }

  buildField();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildField, 300);
  });

  // ---------- cursor trail while hovering [data-confetti] ----------

  const trail = document.getElementById("confetti-trail");
  const MAX_BITS = 80;
  let lastSpawn = 0;
  let hovering = false;

  document.addEventListener("mouseover", (e) => {
    hovering = !!e.target.closest("[data-confetti]");
  });

  function spawnBit(x, y, spread) {
    if (trail.childElementCount >= MAX_BITS) return;
    const b = document.createElement("span");
    b.className = "trail-bit";
    b.textContent = pick(GLYPHS);
    b.style.left = x + rand(-6, 6) + "px";
    b.style.top = y + rand(-6, 6) + "px";
    b.style.color = pick(COLORS);
    b.style.fontSize = rand(9, 18) + "px";
    b.style.setProperty("--dx", rand(-spread, spread) + "px");
    b.style.setProperty("--dy", rand(20, spread * 2) + "px");
    b.style.setProperty("--rot", rand(-180, 180) + "deg");
    trail.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
  }

  document.addEventListener("mousemove", (e) => {
    if (!hovering || reducedMotion) return;
    const now = performance.now();
    if (now - lastSpawn < 40) return;
    lastSpawn = now;
    spawnBit(e.clientX, e.clientY, 40);
  });

  // ---------- burst (clicks, correct answers) ----------

  function burst(x, y, n) {
    if (reducedMotion) return;
    for (let i = 0; i < n; i++) {
      const b = document.createElement("span");
      b.className = "trail-bit";
      b.textContent = pick(GLYPHS);
      b.style.left = x + "px";
      b.style.top = y + "px";
      b.style.color = pick(COLORS);
      b.style.fontSize = rand(10, 22) + "px";
      const angle = rand(0, Math.PI * 2);
      const dist = rand(40, 130);
      b.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      b.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      b.style.setProperty("--rot", rand(-360, 360) + "deg");
      trail.appendChild(b);
      b.addEventListener("animationend", () => b.remove());
    }
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-confetti], .quiz-opt");
    if (target) burst(e.clientX, e.clientY, 14);
  });

  // touch devices get a tap burst instead of a trail
  document.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) burst(t.clientX, t.clientY, 10);
  }, { passive: true });

  // ---------- demo quiz ----------

  const quiz = document.getElementById("quiz");
  if (quiz) {
    const result = document.getElementById("quiz-result");
    const options = quiz.querySelectorAll(".quiz-opt");
    options.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        const correct = opt.dataset.correct === "true";
        if (correct) {
          opt.classList.add("right");
          options.forEach((o) => (o.disabled = true));
          result.textContent = "correct. imagine this, but it's your own code.";
          result.className = "quiz-result ok";
          const r = opt.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top, 26);
        } else {
          opt.classList.add("wrong");
          opt.disabled = true;
          result.textContent = "nope. hint: slugs use hyphens.";
          result.className = "quiz-result no";
          setTimeout(() => opt.classList.remove("wrong"), 400);
        }
      });
    });
  }
})();
