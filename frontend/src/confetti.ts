// confetti field + cursor trail + bursts, theme-aware — same behavior as landing

const GLYPHS = ["+", "✱", "*", "·", "▪"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

let colors: string[] = [];

export function refreshColors(): void {
  const cs = getComputedStyle(document.documentElement);
  colors = ["--purple", "--lavender", "--pink", "--yellow", "--green"]
    .map((v) => cs.getPropertyValue(v).trim());
}

export function buildField(): void {
  const field = document.getElementById("confetti-field");
  if (!field) return;
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
    g.style.color = pick(colors);
    g.style.fontSize = rand(8, 22) + "px";
    if (reducedMotion) {
      g.style.top = rand(0, 100) + "vh";
    } else {
      const fall = rand(40, 110);
      g.style.setProperty("--fall", fall + "s");
      g.style.setProperty("--fd", -rand(0, fall) + "s");
    }
    field.appendChild(g);
  }
}

function spawn(x: number, y: number, dx: number, dy: number, size: number): void {
  const trail = document.getElementById("confetti-trail");
  if (!trail || trail.childElementCount >= 100) return;
  const b = document.createElement("span");
  b.className = "trail-bit";
  b.textContent = pick(GLYPHS);
  b.style.left = x + "px";
  b.style.top = y + "px";
  b.style.color = pick(colors);
  b.style.fontSize = size + "px";
  b.style.setProperty("--dx", dx + "px");
  b.style.setProperty("--dy", dy + "px");
  b.style.setProperty("--rot", rand(-360, 360) + "deg");
  trail.appendChild(b);
  b.addEventListener("animationend", () => b.remove());
}

export function burst(x: number, y: number, n = 14): void {
  if (reducedMotion) return;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const d = rand(40, 130);
    spawn(x, y, Math.cos(a) * d, Math.sin(a) * d, rand(10, 22));
  }
}

let armed = false;

export function initConfetti(): void {
  refreshColors();
  buildField();
  if (armed) return;
  armed = true;

  let lastSpawn = 0;
  document.addEventListener("mousemove", (e) => {
    if (reducedMotion) return;
    const now = performance.now();
    if (now - lastSpawn < 40) return;
    lastSpawn = now;
    spawn(e.clientX + rand(-6, 6), e.clientY + rand(-6, 6), rand(-40, 40), rand(20, 80), rand(9, 18));
  });

  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("a, button")) burst(e.clientX, e.clientY);
  });

  document.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) burst(t.clientX, t.clientY, 10);
  }, { passive: true });

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildField, 300);
  });
}
