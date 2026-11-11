// Datos reales de Open-Meteo (sin clave). Caché en memoria + sessionStorage para no repetir peticiones.
import { PROVINCES } from './data.js';

export const TTL = 10 * 60 * 1000;      // la previsión de una ciudad se considera fresca 10 min
export const TTL_MAP = 15 * 60 * 1000;  // el mapa de capitales, 15 min

const mem = new Map();
function readCache(key) {
  if (mem.has(key)) return mem.get(key);
  try { const v = JSON.parse(sessionStorage.getItem('pw:' + key)); if (v) { mem.set(key, v); return v; } } catch {}
  return null;
}
function writeCache(key, data) {
  const v = { t: Date.now(), data }; mem.set(key, v);
  try { sessionStorage.setItem('pw:' + key, JSON.stringify(v)); } catch {}
  return v;
}

async function getJSON(url, ms = 12000) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (r.status === 429) throw new Error('Open-Meteo ha limitado las peticiones. Prueba en unos minutos.');
    if (!r.ok) throw new Error('El servicio meteorológico ha respondido con un error (' + r.status + ').');
    return await r.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('El servicio meteorológico tarda demasiado en responder.');
    if (e instanceof TypeError) throw new Error('No hay conexión con el servicio meteorológico.');
    throw e;
  } finally { clearTimeout(to); }
}

const inflight = new Map();
/** Devuelve { data, t, stale }. Con caché fresca no hay petición; si la red falla y hay caché vieja, se usa marcada como stale. */
async function cached(key, ttl, url, force) {
  const hit = readCache(key);
  if (hit && !force && Date.now() - hit.t < ttl) return { ...hit, stale: false };
  if (inflight.has(key)) return inflight.get(key);
  const p = getJSON(url).then((data) => ({ ...writeCache(key, data), stale: false }))
    .catch((e) => { if (hit) return { ...hit, stale: true, error: e.message }; throw e; })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const CURRENT = 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
const HOURLY = 'temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,wind_gusts_10m,uv_index,relative_humidity_2m';
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max';

export function getForecast(lat, lon, force = false) {
  const la = lat.toFixed(2), lo = lon.toFixed(2);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=${CURRENT}&hourly=${HOURLY}&daily=${DAILY}&timezone=auto&forecast_days=7`;
  return cached(`fc:${la},${lo}`, TTL, url, force);
}

/** Tiempo actual de las 52 capitales en una sola petición. */
export async function getMapWeather(force = false) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${PROVINCES.map((p) => p.lat).join(',')}&longitude=${PROVINCES.map((p) => p.lon).join(',')}&current=temperature_2m,weather_code,is_day,wind_speed_10m,wind_gusts_10m,relative_humidity_2m&timezone=auto`;
  const res = await cached('map', TTL_MAP, url, force);
  const arr = Array.isArray(res.data) ? res.data : [res.data];
  return { ...res, data: PROVINCES.map((p, i) => ({ code: p.code, time: arr[i]?.current?.time, ...arr[i]?.current })) };
}

const searchMem = new Map();
/** Buscador de localidades españolas (geocodificación de Open-Meteo). */
export async function searchCities(q) {
  const key = q.trim().toLowerCase();
  if (searchMem.has(key)) return searchMem.get(key);
  const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=8&language=es&countryCode=ES`, 8000);
  const out = (j.results || []).filter((r) => r.country_code === 'ES').map((r) => ({
    id: 'g' + r.id, name: r.name, lat: r.latitude, lon: r.longitude, ca: r.admin1 || '',
    admin: (r.admin2 || '').replace(/^Provincia de (la |las |los )?/i, ''), population: r.population || 0,
  }));
  searchMem.set(key, out);
  return out;
}
