// Mapa de España con Leaflet: provincias coloreadas por temperatura y un Pokémon por capital.
import { PROVINCES, provinceLocation, tempColor, WMO } from './data.js';
import { classify, pick, spriteUrl } from './pokemon.js';

const GEOJSON = 'https://cdn.jsdelivr.net/gh/codeforgermany/click_that_hood@main/public/data/spain-provinces.geojson';
// Teselas estándar de OpenStreetMap (sin clave). En modo oscuro se invierten por CSS.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAINLAND = [[35.7, -9.6], [43.9, 4.5]];
const byCode = Object.fromEntries(PROVINCES.map((p) => [p.code, p]));

export function createMap(el, { onSelect, theme, today }) {
  const L = window.L;
  const map = L.map(el, { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 4.5, maxZoom: 11, attributionControl: true, scrollWheelZoom: false });
  map.attributionControl.setPrefix(false);
  // rueda del ratón solo tras hacer clic en el mapa, para no secuestrar el scroll de la página
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
  map.fitBounds(MAINLAND);
  L.tileLayer(TILES, { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19, opacity: 0.55 }).addTo(map);
  // El contenedor puede no tener tamaño definitivo al crear el mapa: se reencuadra hasta que el usuario lo mueva
  let touched = false;
  map.on('mousedown touchstart wheel', () => { touched = true; });
  new ResizeObserver(() => { map.invalidateSize(); if (!touched && !community) map.fitBounds(MAINLAND); }).observe(el);

  const layers = {};      // código de provincia → capa del polígono
  const markers = {};     // código de provincia → marcador de la capital
  let weather = {}, selected = null, community = '', pin = null;

  const style = (code) => {
    const w = weather[code], dim = community && byCode[code]?.ca !== community;
    return {
      color: code === selected ? (theme === 'dark' ? '#ffffff' : '#10151f') : (theme === 'dark' ? '#0c111b' : '#ffffff'), weight: code === selected ? 2.5 : 1,
      fillColor: w?.temperature_2m != null ? tempColor(w.temperature_2m) : '#9aa6b8', fillOpacity: dim ? 0.12 : 0.62,
    };
  };
  const restyle = () => { for (const c in layers) layers[c].setStyle(style(c)); if (selected && layers[selected]) layers[selected].bringToFront(); };
  const tip = (p) => {
    const w = weather[p.code];
    if (w?.temperature_2m == null) return `<b>${p.name}</b><br>${p.capital}`;
    const cls = classify({ code: w.weather_code, temp: w.temperature_2m, wind: w.wind_speed_10m, gusts: w.wind_gusts_10m, isDay: w.is_day, humidity: w.relative_humidity_2m });
    return `<b>${p.capital}</b> · ${Math.round(w.temperature_2m)}°<br>${WMO[w.weather_code] ?? ''} · ${pick(cls.key, 'p' + p.code + '|' + today()).name}`;
  };

  const ready = fetch(GEOJSON).then((r) => { if (!r.ok) throw new Error('mapa'); return r.json(); }).then((geo) => {
    L.geoJSON(geo, {
      style: (f) => style(f.properties.cod_prov),
      onEachFeature: (f, layer) => {
        const p = byCode[f.properties.cod_prov]; if (!p) return;
        layers[p.code] = layer;
        layer.bindTooltip(() => tip(p), { sticky: true, direction: 'top', className: 'map-tip' });
        layer.on('click', () => onSelect(provinceLocation(p)));
        layer.on('mouseover', () => layer.setStyle({ weight: 2.2, fillOpacity: 0.8 }));
        layer.on('mouseout', () => layer.setStyle(style(p.code)));
      },
    }).addTo(map);
    restyle();
  });

  const syncZoom = () => el.classList.toggle('zoom-low', map.getZoom() < 6.25);
  map.on('zoomend', syncZoom); syncZoom();

  function setWeather(list) {
    weather = Object.fromEntries(list.map((w) => [w.code, w]));
    for (const p of PROVINCES) {
      const w = weather[p.code]; if (w?.temperature_2m == null) continue;
      const cls = classify({ code: w.weather_code, temp: w.temperature_2m, wind: w.wind_speed_10m, gusts: w.wind_gusts_10m, isDay: w.is_day, humidity: w.relative_humidity_2m });
      const mon = pick(cls.key, 'p' + p.code + '|' + today());
      const icon = L.divIcon({ className: 'pin-wrap', iconSize: [0, 0], html: `<div class="pin" style="--c:${tempColor(w.temperature_2m)}"><img src="${spriteUrl(mon.id)}" alt="${mon.name}" loading="lazy"><b>${Math.round(w.temperature_2m)}°</b></div>` });
      if (markers[p.code]) markers[p.code].setIcon(icon);
      else markers[p.code] = L.marker([p.lat, p.lon], { icon, title: `${p.capital}: ${Math.round(w.temperature_2m)}°, ${mon.name}`, keyboard: false }).addTo(map).on('click', () => onSelect(provinceLocation(p)));
    }
    restyle();
  }

  function select(loc, { fly = true } = {}) {
    selected = loc.id.startsWith('p') ? loc.id.slice(1) : null;
    restyle();
    if (pin) { pin.remove(); pin = null; }
    if (!selected) {
      pin = L.marker([loc.lat, loc.lon], { icon: L.divIcon({ className: 'pin-wrap', iconSize: [0, 0], html: '<div class="pin pin-city" id="cityPin"><span></span></div>' }), zIndexOffset: 1000 }).addTo(map);
      if (fly) map.flyTo([loc.lat, loc.lon], Math.max(map.getZoom(), 8), { duration: 0.8 });
    } else if (fly && !map.getBounds().pad(-0.1).contains([loc.lat, loc.lon])) map.flyTo([loc.lat, loc.lon], Math.max(map.getZoom(), 6.5), { duration: 0.8 });
  }
  /** Pone el Pokémon y la temperatura en el marcador de una ciudad buscada. */
  function setPin(mon, temp) {
    const n = document.getElementById('cityPin'); if (!n) return;
    n.style.setProperty('--c', tempColor(temp));
    n.innerHTML = `<img src="${spriteUrl(mon.id)}" alt="${mon.name}"><b>${Math.round(temp)}°</b>`;
  }

  function focusCommunity(ca) {
    community = ca; touched = !!ca; restyle();
    if (!ca) return map.flyToBounds(MAINLAND, { duration: 0.7 });
    const group = L.featureGroup(PROVINCES.filter((p) => p.ca === ca).map((p) => layers[p.code]).filter(Boolean));
    if (group.getLayers().length) map.flyToBounds(group.getBounds().pad(0.15), { duration: 0.7, maxZoom: 9 });
  }

  function setTheme(t) { theme = t; restyle(); }

  return { ready, setWeather, select, setPin, focusCommunity, setTheme, invalidate: () => map.invalidateSize() };
}
