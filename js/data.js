// Provincias de España: código INE, nombre, capital, coordenadas de la capital y comunidad autónoma.
export const PROVINCES = [
  ['01', 'Álava', 'Vitoria-Gasteiz', 42.85, -2.67, 'País Vasco'],
  ['02', 'Albacete', 'Albacete', 38.99, -1.86, 'Castilla-La Mancha'],
  ['03', 'Alicante', 'Alicante', 38.35, -0.48, 'Comunidad Valenciana'],
  ['04', 'Almería', 'Almería', 36.84, -2.46, 'Andalucía'],
  ['05', 'Ávila', 'Ávila', 40.66, -4.70, 'Castilla y León'],
  ['06', 'Badajoz', 'Badajoz', 38.88, -6.97, 'Extremadura'],
  ['07', 'Illes Balears', 'Palma', 39.57, 2.65, 'Illes Balears'],
  ['08', 'Barcelona', 'Barcelona', 41.39, 2.17, 'Cataluña'],
  ['09', 'Burgos', 'Burgos', 42.34, -3.70, 'Castilla y León'],
  ['10', 'Cáceres', 'Cáceres', 39.48, -6.37, 'Extremadura'],
  ['11', 'Cádiz', 'Cádiz', 36.53, -6.29, 'Andalucía'],
  ['12', 'Castellón', 'Castellón de la Plana', 39.99, -0.04, 'Comunidad Valenciana'],
  ['13', 'Ciudad Real', 'Ciudad Real', 38.99, -3.93, 'Castilla-La Mancha'],
  ['14', 'Córdoba', 'Córdoba', 37.89, -4.78, 'Andalucía'],
  ['15', 'A Coruña', 'A Coruña', 43.37, -8.40, 'Galicia'],
  ['16', 'Cuenca', 'Cuenca', 40.07, -2.14, 'Castilla-La Mancha'],
  ['17', 'Girona', 'Girona', 41.98, 2.82, 'Cataluña'],
  ['18', 'Granada', 'Granada', 37.18, -3.60, 'Andalucía'],
  ['19', 'Guadalajara', 'Guadalajara', 40.63, -3.17, 'Castilla-La Mancha'],
  ['20', 'Gipuzkoa', 'San Sebastián', 43.32, -1.98, 'País Vasco'],
  ['21', 'Huelva', 'Huelva', 37.26, -6.95, 'Andalucía'],
  ['22', 'Huesca', 'Huesca', 42.14, -0.41, 'Aragón'],
  ['23', 'Jaén', 'Jaén', 37.77, -3.79, 'Andalucía'],
  ['24', 'León', 'León', 42.60, -5.57, 'Castilla y León'],
  ['25', 'Lleida', 'Lleida', 41.62, 0.62, 'Cataluña'],
  ['26', 'La Rioja', 'Logroño', 42.47, -2.45, 'La Rioja'],
  ['27', 'Lugo', 'Lugo', 43.01, -7.56, 'Galicia'],
  ['28', 'Madrid', 'Madrid', 40.42, -3.70, 'Comunidad de Madrid'],
  ['29', 'Málaga', 'Málaga', 36.72, -4.42, 'Andalucía'],
  ['30', 'Murcia', 'Murcia', 37.99, -1.13, 'Región de Murcia'],
  ['31', 'Navarra', 'Pamplona', 42.82, -1.64, 'Navarra'],
  ['32', 'Ourense', 'Ourense', 42.34, -7.86, 'Galicia'],
  ['33', 'Asturias', 'Oviedo', 43.36, -5.85, 'Asturias'],
  ['34', 'Palencia', 'Palencia', 42.01, -4.53, 'Castilla y León'],
  ['35', 'Las Palmas', 'Las Palmas de Gran Canaria', 28.12, -15.43, 'Canarias'],
  ['36', 'Pontevedra', 'Pontevedra', 42.43, -8.64, 'Galicia'],
  ['37', 'Salamanca', 'Salamanca', 40.97, -5.66, 'Castilla y León'],
  ['38', 'Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 28.47, -16.25, 'Canarias'],
  ['39', 'Cantabria', 'Santander', 43.46, -3.81, 'Cantabria'],
  ['40', 'Segovia', 'Segovia', 40.95, -4.12, 'Castilla y León'],
  ['41', 'Sevilla', 'Sevilla', 37.39, -5.98, 'Andalucía'],
  ['42', 'Soria', 'Soria', 41.76, -2.47, 'Castilla y León'],
  ['43', 'Tarragona', 'Tarragona', 41.12, 1.25, 'Cataluña'],
  ['44', 'Teruel', 'Teruel', 40.34, -1.11, 'Aragón'],
  ['45', 'Toledo', 'Toledo', 39.86, -4.02, 'Castilla-La Mancha'],
  ['46', 'Valencia', 'Valencia', 39.47, -0.38, 'Comunidad Valenciana'],
  ['47', 'Valladolid', 'Valladolid', 41.65, -4.72, 'Castilla y León'],
  ['48', 'Bizkaia', 'Bilbao', 43.26, -2.93, 'País Vasco'],
  ['49', 'Zamora', 'Zamora', 41.50, -5.75, 'Castilla y León'],
  ['50', 'Zaragoza', 'Zaragoza', 41.65, -0.88, 'Aragón'],
  ['51', 'Ceuta', 'Ceuta', 35.89, -5.32, 'Ceuta'],
  ['52', 'Melilla', 'Melilla', 35.29, -2.94, 'Melilla'],
].map(([code, name, capital, lat, lon, ca]) => ({ code, name, capital, lat, lon, ca }));

export const COMMUNITIES = [...new Set(PROVINCES.map((p) => p.ca))].sort((a, b) => a.localeCompare(b, 'es'));

export const provinceLocation = (p) => ({ id: 'p' + p.code, name: p.capital, admin: p.name, ca: p.ca, lat: p.lat, lon: p.lon });

// Códigos de tiempo WMO que devuelve Open-Meteo
export const WMO = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Intervalos nubosos', 3: 'Cubierto',
  45: 'Niebla', 48: 'Niebla con cencellada',
  51: 'Llovizna débil', 53: 'Llovizna', 55: 'Llovizna intensa', 56: 'Llovizna helada', 57: 'Llovizna helada intensa',
  61: 'Lluvia débil', 63: 'Lluvia moderada', 65: 'Lluvia fuerte', 66: 'Lluvia helada', 67: 'Lluvia helada fuerte',
  71: 'Nevada débil', 73: 'Nevada moderada', 75: 'Nevada fuerte', 77: 'Cinarra',
  80: 'Chubascos débiles', 81: 'Chubascos', 82: 'Chubascos fuertes', 85: 'Chubascos de nieve', 86: 'Chubascos de nieve fuertes',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo fuerte',
};

const CARD = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
export const cardinal = (deg) => CARD[Math.round(deg / 45) % 8];
export const windLabel = (v) => (v < 6 ? 'Calma' : v < 20 ? 'Flojo' : v < 40 ? 'Moderado' : v < 62 ? 'Fuerte' : v < 88 ? 'Muy fuerte' : 'Huracanado');
export const uvLabel = (u) => (u < 3 ? 'Bajo' : u < 6 ? 'Moderado' : u < 8 ? 'Alto' : u < 11 ? 'Muy alto' : 'Extremo');
export const pressureLabel = (p) => (p < 1005 ? 'Baja · tiempo inestable' : p <= 1020 ? 'Normal' : 'Alta · tiempo estable');

// Escala de color de temperatura (°C) para el mapa
const STOPS = [[-8, [106, 79, 179]], [0, [63, 127, 217]], [8, [56, 182, 201]], [15, [88, 192, 112]], [22, [242, 199, 68]], [28, [240, 138, 60]], [35, [220, 75, 62]], [42, [155, 28, 58]]];
export function tempColor(t) {
  if (t <= STOPS[0][0]) return `rgb(${STOPS[0][1]})`;
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i]; const [t0, c0] = STOPS[i - 1];
    if (t <= t1) { const k = (t - t0) / (t1 - t0); return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k))})`; }
  }
  return `rgb(${STOPS.at(-1)[1]})`;
}
export const TEMP_STOPS = STOPS.map(([t]) => t);
