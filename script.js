// vibecodedslopware — confetti field, cursor trail, bursts, demo quiz

(function () {
  "use strict";

  const GLYPHS = ["+", "✱", "*", "·", "▪"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- themes: white / black / plum / midnight ----------

  const THEMES = ["white", "black", "plum", "midnight"];
  const toggle = document.getElementById("theme-toggle");
  let COLORS = [];

  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    return ["--purple", "--lavender", "--pink", "--yellow", "--green"]
      .map((v) => cs.getPropertyValue(v).trim());
  };

  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    if (toggle) toggle.textContent = "[" + t + "]";
    COLORS = readColors();
  };

  // head script already set a valid dataset.theme (with legacy migration)
  let theme = document.documentElement.dataset.theme;
  applyTheme(theme);
  if (toggle) {
    toggle.addEventListener("click", () => {
      theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
      localStorage.setItem("theme", theme);
      applyTheme(theme);
      buildField();
    });
  }

  // ---------- background field: dense, slowly drifting down ----------

  const field = document.getElementById("confetti-field");

  function buildField() {
    field.innerHTML = "";
    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(130, Math.max(50, Math.round(area / 12000)));
    for (let i = 0; i < count; i++) {
      const g = document.createElement("span");
      g.className = "glyph";
      const inner = document.createElement("span");
      inner.className = "glyph-inner";
      inner.textContent = pick(GLYPHS);
      inner.style.setProperty("--tw", rand(4, 10) + "s");
      inner.style.setProperty("--td", rand(0, 8) + "s");
      g.appendChild(inner);
      g.style.left = rand(0, 100) + "vw";
      g.style.color = pick(COLORS);
      g.style.fontSize = rand(8, 22) + "px";
      if (reducedMotion) {
        g.style.top = rand(0, 100) + "vh";
      } else {
        const fall = rand(40, 110);
        g.style.setProperty("--fall", fall + "s");
        // negative delay scatters glyphs across the whole screen immediately
        g.style.setProperty("--fd", -rand(0, fall) + "s");
      }
      field.appendChild(g);
    }
  }

  buildField();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildField, 300);
  });

  // ---------- cursor trail, everywhere ----------

  const trail = document.getElementById("confetti-trail");
  const MAX_BITS = 100;
  let lastSpawn = 0;

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
    if (reducedMotion) return;
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

  // ---------- hero typing effect ----------

  const typed = document.getElementById("typed");
  if (typed) {
    const LINES = ["you vibecoded it.", "now actually learn it."];
    if (reducedMotion) {
      typed.innerHTML = LINES.join("<br>");
    } else {
      let line = 0, ch = 0;
      const typeNext = () => {
        if (line >= LINES.length) return;
        if (ch < LINES[line].length) {
          typed.appendChild(document.createTextNode(LINES[line][ch]));
          ch++;
          setTimeout(typeNext, rand(35, 75));
        } else {
          line++; ch = 0;
          if (line < LINES.length) {
            typed.appendChild(document.createElement("br"));
            setTimeout(typeNext, 300);
          }
        }
      };
      setTimeout(typeNext, 350);
    }
  }

  // ---------- scroll reveal ----------

  const revealTargets = document.querySelectorAll(
    ".cols section, .outro, .steps li, .type-list li, .privacy-list li"
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    const i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty("--rd", (i % 5) * 80 + "ms");
  });
  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

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
