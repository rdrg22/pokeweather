// Efectos de la cabecera: partículas en canvas (lluvia, nieve, viento, ascuas, estrellas) y relámpagos.
// Las capas de nubes, niebla y sol son CSS (ver styles.css, clases .fx-*).
const SCENES = {
  storm: { p: 'rain', n: 170, flash: true, layers: ['clouds', 'dark'] },
  gale: { p: 'rain', n: 200, slant: 0.55, layers: ['clouds', 'dark'] },
  'rain-heavy': { p: 'rain', n: 220, layers: ['clouds'] },
  rain: { p: 'rain', n: 120, layers: ['clouds'] },
  drizzle: { p: 'rain', n: 45, layers: ['clouds'] },
  sleet: { p: 'sleet', n: 110, layers: ['clouds'] },
  'snow-heavy': { p: 'snow', n: 190, layers: ['clouds'] },
  snow: { p: 'snow', n: 90, layers: [] },
  fog: { p: null, layers: ['fog'] },
  wind: { p: 'wind', n: 26, layers: [] },
  'heat-extreme': { p: 'embers', n: 60, layers: ['sun', 'haze'] },
  heat: { p: 'embers', n: 24, layers: ['sun', 'haze'] },
  sun: { p: null, layers: ['sun'] },
  partly: { p: null, layers: ['sun', 'clouds-light'] },
  cloudy: { p: null, layers: ['clouds'] },
  'night-clear': { p: 'stars', n: 90, layers: ['moon'] },
  'night-cloudy': { p: 'stars', n: 25, layers: ['clouds', 'dark'] },
  frost: { p: 'stars', n: 40, layers: [] },
  cold: { p: null, layers: ['clouds-light'] },
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let raf = 0, state = null;

export function setScene(host, scene) {
  cancelAnimationFrame(raf);
  const cfg = SCENES[scene] || SCENES.cloudy;
  const layers = host.querySelector('.fx-layers');
  layers.innerHTML = cfg.layers.map((l) => `<i class="fx-${l}"></i>`).join('');
  const cv = host.querySelector('canvas.fx');
  const g = cv.getContext('2d');
  const size = () => { const r = host.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); return r; };
  let { width: W, height: H } = size();
  g.clearRect(0, 0, W, H);
  if (!cfg.p && !cfg.flash) return;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const make = (init) => {
    switch (cfg.p) {
      case 'rain': return { x: rnd(-W * 0.3, W), y: init ? rnd(0, H) : -20, v: rnd(9, 15), l: rnd(10, 22) };
      case 'sleet': return { x: rnd(0, W), y: init ? rnd(0, H) : -10, v: rnd(4, 8), l: rnd(3, 7), r: rnd(1, 2) };
      case 'snow': return { x: rnd(0, W), y: init ? rnd(0, H) : -10, v: rnd(0.5, 1.8), r: rnd(1.2, 3.6), ph: rnd(0, 6.28) };
      case 'wind': return { x: init ? rnd(-W, W) : -rnd(100, 400), y: rnd(0, H), v: rnd(9, 18), l: rnd(60, 180) };
      case 'embers': return { x: rnd(0, W), y: init ? rnd(0, H) : H + 10, v: rnd(0.3, 1.1), r: rnd(1, 2.6), ph: rnd(0, 6.28) };
      case 'stars': return { x: rnd(0, W), y: rnd(0, H * 0.85), r: rnd(0.5, 1.6), ph: rnd(0, 6.28), v: rnd(0.01, 0.04) };
      default: return {};
    }
  };
  const count = Math.round((cfg.n || 0) * Math.min(1.4, Math.max(0.5, W / 900)));
  const parts = Array.from({ length: count }, () => make(true));
  const slant = cfg.slant ?? 0.18;
  let flash = 0, nextFlash = performance.now() + rnd(1500, 4000), tick = 0;
  state = { host, size: () => ({ width: W, height: H } = size()) };

  const frame = (now) => {
    g.clearRect(0, 0, W, H); tick++;
    if (cfg.p === 'rain') {
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2; g.beginPath();
      for (const p of parts) { g.moveTo(p.x, p.y); g.lineTo(p.x + p.l * slant, p.y + p.l); p.x += p.v * slant; p.y += p.v; if (p.y > H) Object.assign(p, make(false)); }
      g.stroke();
    } else if (cfg.p === 'sleet') {
      g.fillStyle = 'rgba(255,255,255,.75)';
      for (const p of parts) { g.fillRect(p.x, p.y, p.r, p.l); p.y += p.v; p.x += 0.6; if (p.y > H) Object.assign(p, make(false)); }
    } else if (cfg.p === 'snow') {
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (const p of parts) { p.ph += 0.02; p.y += p.v; p.x += Math.sin(p.ph) * 0.6; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill(); if (p.y > H + 5) Object.assign(p, make(false)); }
    } else if (cfg.p === 'wind') {
      g.lineCap = 'round'; g.lineWidth = 1.6;
      for (const p of parts) {
        const gr = g.createLinearGradient(p.x, 0, p.x + p.l, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.55)');
        g.strokeStyle = gr; g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(p.x + p.l / 2, p.y - 6, p.x + p.l, p.y); g.stroke();
        p.x += p.v; if (p.x > W + 20) Object.assign(p, make(false));
      }
    } else if (cfg.p === 'embers') {
      for (const p of parts) { p.ph += 0.03; p.y -= p.v; p.x += Math.sin(p.ph) * 0.4; g.fillStyle = `rgba(255,${180 + Math.round(60 * Math.sin(p.ph))},90,${0.35 + 0.35 * Math.sin(p.ph * 2)})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill(); if (p.y < -10) Object.assign(p, make(false)); }
    } else if (cfg.p === 'stars') {
      for (const p of parts) { p.ph += p.v; g.fillStyle = `rgba(255,255,255,${0.35 + 0.55 * Math.abs(Math.sin(p.ph))})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill(); }
    }
    if (cfg.flash) {
      if (now > nextFlash) { flash = 1; nextFlash = now + rnd(2500, 7000); bolt(g, W, H, rnd); }
      if (flash > 0.02) { g.fillStyle = `rgba(235,235,255,${flash * 0.35})`; g.fillRect(0, 0, W, H); flash *= 0.86; }
    }
    if (!document.hidden) raf = requestAnimationFrame(frame); else raf = 0;
  };
  if (reduce.matches) { frame(0); cancelAnimationFrame(raf); return; } // un fotograma estático
  state.frame = frame;
  raf = requestAnimationFrame(frame);
}

function bolt(g, W, H, rnd) {
  let x = rnd(W * 0.15, W * 0.85), y = 0;
  g.strokeStyle = 'rgba(255,255,220,.95)'; g.lineWidth = 2.2; g.shadowColor = '#fff7a8'; g.shadowBlur = 16; g.beginPath(); g.moveTo(x, y);
  while (y < H * 0.75) { x += rnd(-28, 28); y += rnd(18, 42); g.lineTo(x, y); }
  g.stroke(); g.shadowBlur = 0;
}

document.addEventListener('visibilitychange', () => { if (!document.hidden && state?.frame && !raf && !reduce.matches) raf = requestAnimationFrame(state.frame); });
addEventListener('resize', () => state?.size());
