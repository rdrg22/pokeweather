import { PROVINCES, COMMUNITIES, provinceLocation, WMO, cardinal, windLabel, uvLabel, pressureLabel, tempColor } from './data.js';
import { classify, pick, describe, pokemonInfo, artUrl, spriteUrl, dex, TYPES } from './pokemon.js';
import { getForecast, getMapWeather, searchCities, TTL, TTL_MAP } from './api.js';
import { createMap } from './map.js';
import { setScene } from './effects.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const r = Math.round;
const hhmm = (iso) => iso.slice(11, 16);

/* ---------------- estado ---------------- */
const MADRID = provinceLocation(PROVINCES.find((p) => p.code === '28'));
const state = { loc: MADRID, fc: null, fetchedAt: 0, mapAt: 0, seq: 0 };
try { const saved = JSON.parse(localStorage.getItem('pw:loc')); if (saved?.lat && saved?.name) state.loc = saved; } catch {}
const todayStr = () => state.fc?.current?.time?.slice(0, 10) || new Date().toISOString().slice(0, 10);

/* ---------------- tema ---------------- */
const media = matchMedia('(prefers-color-scheme: dark)');
const theme = () => document.documentElement.dataset.theme || (media.matches ? 'dark' : 'light');
function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  document.querySelector('meta[name=theme-color]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  map?.setTheme(theme());
}
let map = null;
try { applyTheme(localStorage.getItem('pw:theme')); } catch { applyTheme(null); }
$('#theme').onclick = () => { const t = theme() === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('pw:theme', t); } catch {} applyTheme(t); };
media.addEventListener('change', () => applyTheme(document.documentElement.dataset.theme || null));

/* ---------------- mapa ---------------- */
map = createMap($('#map'), { onSelect: (loc) => selectLocation(loc, { fly: false }), theme: theme(), today: todayStr });
map.ready.catch(() => { $('.hint').textContent = 'No se han podido cargar los límites de las provincias. Los marcadores siguen funcionando.'; });
const sel = $('#community');
sel.insertAdjacentHTML('beforeend', COMMUNITIES.map((c) => `<option>${esc(c)}</option>`).join(''));
sel.onchange = () => map.focusCommunity(sel.value);

async function loadMap(force = false) {
  try {
    const res = await getMapWeather(force);
    state.mapAt = res.t;
    map.setWeather(res.data);
  } catch { /* el mapa se queda sin colorear; el aviso general lo da la previsión */ }
}

/* ---------------- carga de la previsión ---------------- */
function notice(msg) { const n = $('#notice'); n.hidden = !msg; n.textContent = msg || ''; }

async function load(force = false) {
  const seq = ++state.seq, loc = state.loc;
  $('#refresh').classList.add('busy');
  if (!state.fc || state.fcLoc !== loc.id) skeleton();
  try {
    const res = await getForecast(loc.lat, loc.lon, force);
    if (seq !== state.seq) return;
    if (!res.data?.current || !res.data?.hourly?.time?.length) throw new Error('No hay datos meteorológicos disponibles para esta ubicación.');
    state.fc = res.data; state.fcLoc = loc.id; state.fetchedAt = res.t;
    notice(res.stale ? `No se han podido actualizar los datos (${res.error}). Se muestran los de las ${new Date(res.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.` : '');
    render();
  } catch (e) {
    if (seq !== state.seq) return;
    state.fc = null;
    renderError(e.message || 'No se han podido cargar los datos.');
  } finally {
    if (seq === state.seq) { $('#refresh').classList.remove('busy'); tickUpdated(); }
  }
}

function selectLocation(loc, { fly = true } = {}) {
  state.loc = loc;
  try { localStorage.setItem('pw:loc', JSON.stringify(loc)); } catch {}
  map.select(loc, { fly });
  load();
  if (innerWidth < 900) $('#hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------- render ---------------- */
function skeleton() {
  $('#heroBody').innerHTML = `<div class="hero-main"><p class="place"><b>${esc(state.loc.name)}</b><span>Consultando el tiempo…</span></p><div class="sk sk-temp"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div><div class="mon"><div class="sk sk-mon"></div></div>`;
  $('#hours').innerHTML = '<div class="sk sk-block"></div>';
  $('#days').innerHTML = '<div class="sk sk-block tall"></div>';
  $('#details').innerHTML = '<div class="sk sk-block"></div>';
}

function renderError(msg) {
  $('#hero').className = 'hero scene-cloudy';
  setScene($('#hero'), 'none');
  $('#heroBody').innerHTML = `<div class="hero-main"><p class="place"><b>${esc(state.loc.name)}</b><span>Ubicación no disponible</span></p><p class="story">${esc(msg)}</p><button class="retry" id="retry">Reintentar</button></div>`;
  $('#retry').onclick = () => load(true);
  for (const id of ['#hours', '#days', '#details']) $(id).innerHTML = '<p class="empty">Sin datos.</p>';
  notice('');
}

const clsHour = (h, i) => classify({ code: h.weather_code[i], temp: h.temperature_2m[i], wind: h.wind_speed_10m[i], gusts: h.wind_gusts_10m[i], isDay: h.is_day[i], uv: h.uv_index[i], humidity: h.relative_humidity_2m[i] });

function render() {
  const fc = state.fc, loc = state.loc, cur = fc.current, h = fc.hourly, d = fc.daily;
  let hi = h.time.findIndex((t) => t.slice(0, 13) === cur.time.slice(0, 13)); if (hi < 0) hi = 0;
  const date = cur.time.slice(0, 10);

  /* --- cabecera: tiempo actual y Pokémon protagonista --- */
  const cls = classify({ code: cur.weather_code, temp: cur.temperature_2m, wind: cur.wind_speed_10m, gusts: cur.wind_gusts_10m, isDay: cur.is_day, uv: h.uv_index[hi], humidity: cur.relative_humidity_2m });
  const mon = pick(cls.key, loc.id + '|' + date);
  const next = Array.from({ length: 6 }, (_, k) => hi + 1 + k).filter((i) => i < h.time.length).map((i) => ({ code: h.weather_code[i], temp: h.temperature_2m[i], prob: h.precipitation_probability[i] }));
  const story = describe({ mon, place: loc.name, cls, temp: cur.temperature_2m, wind: cur.wind_speed_10m, next });
  const prob = h.precipitation_probability[hi] ?? 0;
  const where = [...new Set([loc.admin !== loc.name ? loc.admin : '', loc.ca].filter(Boolean))].join(' · ');

  const hero = $('#hero');
  hero.className = 'hero scene-' + cls.key;
  setScene(hero, cls.key);
  $('#heroBody').innerHTML = `
    <div class="hero-main">
      <p class="place"><b>${esc(loc.name)}</b><span>${esc(where)}</span></p>
      <div class="temp-row">
        <span class="temp">${r(cur.temperature_2m)}°</span>
        <div class="state"><strong>${esc(cls.label)}</strong><span>Máx ${r(d.temperature_2m_max[0])}° · Mín ${r(d.temperature_2m_min[0])}°</span></div>
      </div>
      <p class="story">«${esc(story)}»</p>
      <div class="chips"><span>${esc(cls.title)}</span>${cls.specials.map((s) => `<span class="warn">${esc(s)}</span>`).join('')}</div>
      <button class="fact" id="fact" hidden title="Ver otra curiosidad"><span class="fact-k">Curiosidad de ${esc(mon.name)}</span><span id="factText"></span><small id="factMeta"></small></button>
    </div>
    <figure class="mon">
      <img class="mon-img" src="${artUrl(mon.id)}" alt="${esc(mon.name)}" width="475" height="475">
      <figcaption>
        <span class="dex">${dex(mon.id)}</span>
        <b id="monName">${esc(mon.name)}</b>
        <span class="types" id="monTypes"><i class="sk-pill"></i></span>
        <em id="monGenus"></em>
        <p class="note">${esc(mon.note)}</p>
      </figcaption>
    </figure>
    <dl class="stats">
      <div><dt>Sensación</dt><dd>${r(cur.apparent_temperature)}°</dd></div>
      <div><dt>Humedad</dt><dd>${r(cur.relative_humidity_2m)} %</dd></div>
      <div><dt>Viento</dt><dd>${r(cur.wind_speed_10m)} <small>km/h ${cardinal(cur.wind_direction_10m)}</small></dd></div>
      <div><dt>Prob. de lluvia</dt><dd>${r(prob)} %</dd></div>
      <div><dt>Amanecer</dt><dd>${hhmm(d.sunrise[0])}</dd></div>
      <div><dt>Atardecer</dt><dd>${hhmm(d.sunset[0])}</dd></div>
    </dl>`;
  const img = $('.mon-img'); img.onerror = () => { img.onerror = null; img.src = spriteUrl(mon.id); img.classList.add('pixel'); };
  // Tipos y nombre oficial en español desde PokeAPI (guardados tras la primera vez)
  const monId = mon.id;
  pokemonInfo(monId).then((info) => {
    if (!$('#monTypes') || state.heroMon !== monId) return;
    $('#monTypes').innerHTML = info.types.map((t) => `<i style="--t:${TYPES[t]?.[1] || '#888'}">${TYPES[t]?.[0] || t}</i>`).join('');
    if (info.genus) $('#monGenus').textContent = info.genus;
    if (info.name) $('#monName').textContent = info.name;
    // Curiosidad: una entrada de la Pokédex al azar; al pulsar se pasa a la siguiente
    const facts = info.facts || [], box = $('#fact');
    if (facts.length) {
      let n = Math.floor(Math.random() * facts.length);
      const num = (v) => String(v).replace('.', ',');
      const paint = () => { $('#factText').textContent = facts[n]; $('#factMeta').textContent = `Mide ${num(info.height)} m y pesa ${num(info.weight)} kg` + (facts.length > 1 ? ` · ${n + 1}/${facts.length} · pulsa para ver otra` : ''); };
      paint(); box.hidden = false;
      box.onclick = () => { n = (n + 1) % facts.length; paint(); };
    }
  }).catch(() => { const n = $('#monTypes'); if (n && state.heroMon === monId) n.innerHTML = '<i class="muted-pill">Tipo no disponible</i>'; });
  state.heroMon = monId;
  if (!loc.id.startsWith('p')) map.setPin(mon, cur.temperature_2m);

  /* --- próximas 24 horas --- */
  const idx = Array.from({ length: 24 }, (_, k) => hi + k).filter((i) => i < h.time.length);
  const temps = idx.map((i) => h.temperature_2m[i]), lo = Math.min(...temps), hiT = Math.max(...temps), span = hiT - lo || 1;
  const COL = 64, y = (t) => 26 + (1 - (t - lo) / span) * 34;
  const pts = idx.map((i, k) => [k * COL + COL / 2, y(h.temperature_2m[i])]);
  const line = pts.map(([px, py], k) => (k ? 'L' : 'M') + px + ' ' + py.toFixed(1)).join(' ');
  $('#hours').innerHTML = `<div class="hours" style="width:${idx.length * COL}px">
    <svg class="h-line" width="${idx.length * COL}" height="72" aria-hidden="true"><path d="${line} L${pts.at(-1)[0]} 72 L${pts[0][0]} 72 Z" class="area"/><path d="${line}" class="stroke"/>${pts.map(([px, py]) => `<circle cx="${px}" cy="${py.toFixed(1)}" r="3"/>`).join('')}</svg>
    ${idx.map((i, k) => {
      const c = k === 0 ? cls : clsHour(h, i), m = k === 0 ? mon : pick(c.key, `${loc.id}|${h.time[i].slice(0, 10)}|b${Math.floor(+h.time[i].slice(11, 13) / 3)}`);
      const label = k === 0 ? cls.label : WMO[h.weather_code[i]] ?? '';
      const p = h.precipitation_probability[i] ?? 0;
      return `<div class="h-col${k === 0 ? ' now' : ''}" title="${esc(label)} · ${esc(m.name)}">
        <span class="h-time">${k === 0 ? 'Ahora' : hhmm(h.time[i])}</span>
        <img src="${spriteUrl(m.id)}" alt="${esc(m.name)}" loading="lazy" width="48" height="48">
        <span class="h-slot"><b style="top:${(y(h.temperature_2m[i]) - 22).toFixed(1)}px">${r(h.temperature_2m[i])}°</b></span>
        <span class="h-cond">${esc(label)}</span>
        <span class="h-prob${p >= 50 ? ' hi' : ''}"><i style="height:${Math.max(2, p * 0.22)}px"></i>${r(p)} %</span>
      </div>`;
    }).join('')}</div>`;

  /* --- 7 días --- */
  const wMin = Math.min(...d.temperature_2m_min), wMax = Math.max(...d.temperature_2m_max), wSpan = wMax - wMin || 1;
  $('#days').innerHTML = d.time.map((day, i) => {
    const c = classify({ code: d.weather_code[i], temp: d.temperature_2m_max[i], wind: d.wind_speed_10m_max[i], gusts: d.wind_gusts_10m_max[i], isDay: 1, uv: d.uv_index_max[i], tmin: d.temperature_2m_min[i] });
    const m = i === 0 && cur.is_day ? mon : pick(c.key, loc.id + '|' + day);
    const name = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : new Date(day + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long' });
    const a = ((d.temperature_2m_min[i] - wMin) / wSpan) * 100, b = ((d.temperature_2m_max[i] - wMin) / wSpan) * 100;
    const p = d.precipitation_probability_max[i] ?? 0;
    return `<div class="day">
      <span class="d-name"><b>${name}</b><small>${new Date(day + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</small></span>
      <img src="${spriteUrl(m.id)}" alt="" loading="lazy" width="52" height="52">
      <span class="d-cond"><b>${esc(m.name)}</b><small>${esc(WMO[d.weather_code[i]] ?? '')}</small></span>
      <span class="d-prob${p >= 50 ? ' hi' : ''}" title="Probabilidad de lluvia">${r(p)} %</span>
      <span class="d-range"><small>${r(d.temperature_2m_min[i])}°</small><i><u style="left:${a.toFixed(1)}%;width:${Math.max(6, b - a).toFixed(1)}%;background:linear-gradient(90deg,${tempColor(d.temperature_2m_min[i])},${tempColor(d.temperature_2m_max[i])})"></u></i><b>${r(d.temperature_2m_max[i])}°</b></span>
    </div>`;
  }).join('');

  /* --- detalles --- */
  const uv = h.uv_index[hi] ?? 0, uvMax = d.uv_index_max[0] ?? 0;
  $('#details').innerHTML = `
    <div class="det"><h3>Humedad</h3><p class="big">${r(cur.relative_humidity_2m)}<small> %</small></p><div class="bar"><i style="width:${r(cur.relative_humidity_2m)}%"></i></div><p class="sub">${cur.relative_humidity_2m >= 75 ? 'Ambiente húmedo' : cur.relative_humidity_2m <= 30 ? 'Ambiente seco' : 'Ambiente confortable'}</p></div>
    <div class="det"><h3>Viento</h3><div class="wind"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path d="M24 8l6 14h-12z" transform="rotate(${(cur.wind_direction_10m + 180) % 360} 24 24)"/></svg><p class="big">${r(cur.wind_speed_10m)}<small> km/h</small></p></div><p class="sub">${windLabel(cur.wind_speed_10m)} del ${cardinal(cur.wind_direction_10m)} · rachas de ${r(cur.wind_gusts_10m)} km/h</p></div>
    <div class="det"><h3>Presión</h3><p class="big">${r(cur.pressure_msl)}<small> hPa</small></p><p class="sub">${pressureLabel(cur.pressure_msl)}</p></div>
    <div class="det"><h3>Índice UV</h3><p class="big">${r(uv)}<small> ${uvLabel(uv)}</small></p><div class="uv"><i style="left:${Math.min(100, (uv / 11) * 100).toFixed(0)}%"></i></div><p class="sub">Máximo de hoy: ${r(uvMax)} (${uvLabel(uvMax)})</p></div>
    <div class="det"><h3>Precipitación</h3><p class="big">${(d.precipitation_sum[0] ?? 0).toFixed(1).replace('.', ',')}<small> mm hoy</small></p><p class="sub">Ahora: ${(cur.precipitation ?? 0).toFixed(1).replace('.', ',')} mm · prob. máxima ${r(d.precipitation_probability_max[0] ?? 0)} %</p></div>
    <div class="det"><h3>Nubosidad</h3><p class="big">${r(cur.cloud_cover)}<small> %</small></p><div class="bar"><i style="width:${r(cur.cloud_cover)}%"></i></div><p class="sub">${cur.cloud_cover < 20 ? 'Cielo despejado' : cur.cloud_cover < 60 ? 'Nubes y claros' : cur.cloud_cover < 90 ? 'Muy nuboso' : 'Cubierto'}</p></div>`;
}

/* ---------------- actualización periódica ---------------- */
function tickUpdated() {
  const el = $('#updated');
  if (!state.fetchedAt || !state.fc) { el.textContent = 'Sin datos'; return; }
  const min = Math.floor((Date.now() - state.fetchedAt) / 60000);
  el.textContent = min < 1 ? 'Actualizado ahora' : `Actualizado hace ${min} min`;
}
function refreshIfStale() {
  if (document.hidden) return;
  if (Date.now() - state.fetchedAt > TTL) load();
  if (Date.now() - state.mapAt > TTL_MAP) loadMap();
}
setInterval(() => { tickUpdated(); refreshIfStale(); }, 60000);
document.addEventListener('visibilitychange', refreshIfStale);
addEventListener('online', () => { load(true); loadMap(true); });
let lastManual = 0;
$('#refresh').onclick = () => { if (Date.now() - lastManual < 15000) return tickUpdated(); lastManual = Date.now(); load(true); loadMap(true); }; // como mucho una petición manual cada 15 s

/* ---------------- buscador ---------------- */
const q = $('#q'), box = $('#results');
let found = [], active = 0, searchSeq = 0, deb;
const show = (html) => { box.innerHTML = html; box.hidden = false; q.setAttribute('aria-expanded', 'true'); };
const hide = () => { box.hidden = true; q.setAttribute('aria-expanded', 'false'); };
function paint() {
  show(found.map((c, i) => `<li role="option" data-i="${i}" aria-selected="${i === active}"><b>${esc(c.name)}</b><span>${esc([c.admin, c.ca].filter(Boolean).join(' · '))}</span></li>`).join(''));
}
q.addEventListener('input', () => {
  clearTimeout(deb); const text = q.value.trim(), seq = ++searchSeq;
  if (text.length < 2) { found = []; return hide(); }
  // capitales de provincia: respuesta inmediata sin red
  const n = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  found = PROVINCES.filter((p) => n(p.capital).startsWith(n(text))).slice(0, 4).map(provinceLocation); active = 0;
  if (found.length) paint(); else show('<li class="info">Buscando…</li>');
  deb = setTimeout(async () => {
    try {
      const res = await searchCities(text);
      if (seq !== searchSeq) return;
      const have = new Set(found.map((c) => n(c.name) + '|' + n(c.ca)));
      found = found.concat(res.filter((c) => !have.has(n(c.name) + '|' + n(c.ca)))).slice(0, 8);
      if (found.length) paint(); else show('<li class="info">No hay ninguna localidad española con ese nombre.</li>');
    } catch (e) { if (seq === searchSeq && !found.length) show(`<li class="info">${esc(e.message)}</li>`); }
  }, 300);
});
function choose(i) { const c = found[i]; if (!c) return; q.value = ''; found = []; hide(); q.blur(); selectLocation(c); }
q.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!found.length) return; e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + found.length) % found.length; paint(); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  else if (e.key === 'Escape') { hide(); }
});
box.addEventListener('mousedown', (e) => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(+li.dataset.i); } });
q.addEventListener('blur', () => setTimeout(hide, 120));
q.addEventListener('focus', () => { if (found.length) paint(); });

/* ---------------- arranque ---------------- */
map.select(state.loc, { fly: !state.loc.id.startsWith('p') });
load();
loadMap();
