// Clasificación propia tiempo → Pokémon. PokeAPI no relaciona Pokémon con meteorología:
// aquí se decide qué grupo corresponde a cada situación y qué Pokémon lo representa.
import { WMO } from './data.js';

// Cada grupo: escena visual + Pokémon candidatos [n.º Pokédex, nombre, nota meteorológica]
export const GROUPS = {
  storm: { title: 'Tormenta eléctrica', mons: [
    [25, 'Pikachu', 'Sus mejillas se cargan con cada relámpago: cuanto más truena, más chispea.'],
    [145, 'Zapdos', 'Dicen que aparece entre nubarrones y que su aleteo provoca los rayos.'],
    [243, 'Raikou', 'Lleva nubes de tormenta en el lomo y ruge como un trueno.'],
    [135, 'Jolteon', 'Su pelaje se eriza con la electricidad estática del ambiente.'],
    [642, 'Thundurus', 'Recorre el cielo descargando rayos allá por donde pasa.'],
  ] },
  gale: { title: 'Temporal de viento y lluvia', mons: [
    [130, 'Gyarados', 'Su furia se desata con los temporales: viento y agua a partes iguales.'],
    [230, 'Kingdra', 'Cuando despierta, levanta remolinos capaces de agitar todo el mar.'],
    [321, 'Wailord', 'Sus saltos levantan olas tan grandes como las de un temporal.'],
    [149, 'Dragonite', 'Vuela sin problema entre borrascas, incluso con el mar embravecido.'],
  ] },
  'rain-heavy': { title: 'Lluvia intensa', mons: [
    [249, 'Lugia', 'Un solo aleteo suyo puede provocar una tormenta de varios días.'],
    [382, 'Kyogre', 'Tiene el poder de crear nubes de lluvia que cubren el cielo entero.'],
    [260, 'Swampert', 'Sus aletas detectan los cambios del agua y del aire antes de un aguacero.'],
    [186, 'Politoed', 'Su canto llama a la lluvia: cuando croa, cae con ganas.'],
  ] },
  rain: { title: 'Lluvia', mons: [
    [9, 'Blastoise', 'Sus cañones parecen funcionar a pleno rendimiento ahí fuera.'],
    [272, 'Ludicolo', 'Baila con más energía cuanto más llueve.'],
    [279, 'Pelipper', 'Vuela bajo y trae la lluvia consigo desde el mar.'],
    [134, 'Vaporeon', 'Se dice que cuando sus aletas vibran, la lluvia llega en pocas horas.'],
  ] },
  drizzle: { title: 'Lluvia débil', mons: [
    [7, 'Squirtle', 'Unas gotas no le molestan: es su tiempo favorito para salir.'],
    [270, 'Lotad', 'Usa la hoja de su cabeza como paraguas para los demás.'],
    [54, 'Psyduck', 'Mira al cielo confuso, sin decidir si coger o no el paraguas.'],
    [194, 'Wooper', 'Sale a pasear cuando el suelo está húmedo y refresca.'],
    [704, 'Goomy', 'Necesita humedad para no secarse: la llovizna le viene perfecta.'],
  ] },
  sleet: { title: 'Lluvia helada', mons: [
    [363, 'Spheal', 'Rueda feliz sobre el hielo que deja el agua al congelarse.'],
    [393, 'Piplup', 'Soporta el frío húmedo mejor que nadie.'],
    [364, 'Sealeo', 'Hace girar sobre el hocico los primeros trozos de hielo.'],
    [395, 'Empoleon', 'Corta el aguanieve con las alas como si fueran cuchillas.'],
  ] },
  'snow-heavy': { title: 'Nevada intensa', mons: [
    [144, 'Articuno', 'Cuando bate las alas, el aire se enfría y empieza a nevar.'],
    [460, 'Abomasnow', 'Levanta ventiscas y cubre de blanco todo lo que le rodea.'],
    [473, 'Mamoswine', 'Su pelaje grueso está hecho para las grandes nevadas.'],
    [646, 'Kyurem', 'Genera un frío tan intenso que lo congela todo a su paso.'],
  ] },
  snow: { title: 'Nieve', mons: [
    [361, 'Snorunt', 'Se le ve más cuando nieva: dicen que trae buena suerte a la casa.'],
    [582, 'Vanillite', 'Nació de un carámbano; con la nevada está en su salsa.'],
    [872, 'Snom', 'Se alimenta de la nieve recién caída.'],
    [471, 'Glaceon', 'Enfría el aire a su alrededor hasta hacer caer polvo de nieve.'],
  ] },
  fog: { title: 'Niebla', mons: [
    [94, 'Gengar', 'Se esconde en la niebla; si notas un escalofrío, es él.'],
    [92, 'Gastly', 'Su cuerpo gaseoso se confunde con la bruma.'],
    [200, 'Misdreavus', 'Aprovecha la poca visibilidad para dar sustos.'],
    [425, 'Drifloon', 'Flota a la deriva en los días húmedos y sin viento.'],
    [607, 'Litwick', 'Su llama es lo único que se distingue entre la niebla.'],
  ] },
  wind: { title: 'Viento fuerte', mons: [
    [641, 'Tornadus', 'Surca el cielo a toda velocidad levantando vendavales.'],
    [18, 'Pidgeot', 'Con un par de aleteos crea ráfagas capaces de doblar árboles.'],
    [227, 'Skarmory', 'Sus alas de acero cortan el viento sin esfuerzo.'],
    [275, 'Shiftry', 'Sus abanicos levantan rachas que anuncian el vendaval.'],
    [189, 'Jumpluff', 'Se deja llevar por las corrientes y puede cruzar medio país.'],
  ] },
  'heat-extreme': { title: 'Calor extremo', mons: [
    [6, 'Charizard', 'Su llama arde con más fuerza: hoy el aire quema casi tanto como él.'],
    [383, 'Groudon', 'Su presencia disipa las nubes y hace que el sol apriete sin piedad.'],
    [146, 'Moltres', 'Cada batir de alas deja una estela de aire abrasador.'],
    [637, 'Volcarona', 'Sus alas desprenden un calor comparable al de un pequeño sol.'],
    [324, 'Torkoal', 'Echa humo sin parar: el termómetro está por las nubes.'],
  ] },
  heat: { title: 'Calor', mons: [
    [59, 'Arcanine', 'El calor no le frena; corre como si nada bajo el sol.'],
    [38, 'Ninetales', 'Con su presencia el sol parece brillar con más fuerza.'],
    [695, 'Heliolisk', 'Despliega la gola para absorber toda la energía solar que puede.'],
    [323, 'Camerupt', 'Sus jorobas volcánicas están a gusto con estas temperaturas.'],
  ] },
  sun: { title: 'Día soleado', mons: [
    [791, 'Solgaleo', 'Se le conoce como el emisario del sol; hoy luce a pleno rendimiento.'],
    [196, 'Espeon', 'Absorbe la luz del sol con su pelaje y predice el tiempo.'],
    [192, 'Sunflora', 'Convierte la luz solar en energía: hoy no para quieta.'],
    [421, 'Cherrim', 'Solo abre sus pétalos cuando brilla el sol, como hoy.'],
    [187, 'Hoppip', 'Con sol y brisa suave sale a flotar por el campo.'],
    [182, 'Bellossom', 'Baila cuando hace sol después de días nublados.'],
  ] },
  partly: { title: 'Intervalos nubosos', mons: [
    [351, 'Castform', 'Cambia de forma con el tiempo; hoy duda entre sol y nubes.'],
    [333, 'Swablu', 'Sus alas de algodón se confunden con las nubes sueltas.'],
    [468, 'Togekiss', 'Aparece en días tranquilos, entre claros y nubes.'],
    [12, 'Butterfree', 'Revolotea aprovechando los ratos de sol.'],
  ] },
  cloudy: { title: 'Nublado', mons: [
    [334, 'Altaria', 'Vuela entre las nubes y sus alas parecen parte de ellas.'],
    [426, 'Drifblim', 'Flota bajo el cielo gris sin rumbo fijo.'],
    [179, 'Mareep', 'Su lana recuerda al manto de nubes que cubre el cielo.'],
    [546, 'Cottonee', 'Se junta con otros hasta parecer una nube más.'],
  ] },
  'night-clear': { title: 'Noche despejada', mons: [
    [337, 'Lunatone', 'Se activa con la luna; en noches despejadas flota a sus anchas.'],
    [197, 'Umbreon', 'Los anillos de su cuerpo brillan a la luz de la luna.'],
    [35, 'Clefairy', 'Sale a bailar en las noches claras de luna.'],
    [792, 'Lunala', 'Emisario de la luna: el cielo raso es su territorio.'],
    [163, 'Hoothoot', 'Marca las horas de la noche con precisión de reloj.'],
    [488, 'Cresselia', 'Deja una estela brillante como la luna creciente.'],
  ] },
  'night-cloudy': { title: 'Noche nubosa', mons: [
    [164, 'Noctowl', 'Ve perfectamente aunque las nubes tapen la luna.'],
    [198, 'Murkrow', 'Sale al caer la noche, cuando el cielo está más oscuro.'],
    [41, 'Zubat', 'Sin luna ni estrellas se orienta mejor que nadie.'],
    [430, 'Honchkrow', 'Dirige a su bandada en las noches cerradas.'],
  ] },
  frost: { title: 'Helada', mons: [
    [378, 'Regice', 'Su cuerpo de hielo no se derrite ni con fuego; hoy está en casa.'],
    [362, 'Glalie', 'Congela la humedad del aire a su alrededor.'],
    [478, 'Froslass', 'Aparece con las heladas más duras de la madrugada.'],
    [614, 'Beartic', 'Camina sobre la escarcha como si fuera una alfombra.'],
  ] },
  cold: { title: 'Frío', mons: [
    [220, 'Swinub', 'Su pelo espeso le permite ignorar el frío mientras olfatea el suelo.'],
    [613, 'Cubchoo', 'El frío le sienta bien, aunque siempre va con el moquillo colgando.'],
    [459, 'Snover', 'Baja de la montaña cuando el termómetro se desploma.'],
    [215, 'Sneasel', 'Se mueve con agilidad cuando el frío deja las calles vacías.'],
  ] },
};

// Cómo se pinta cada grupo en la cabecera (ver effects.js y styles.css)
export const SCENE = Object.fromEntries(Object.keys(GROUPS).map((k) => [k, k]));

const RAIN_HEAVY = [65, 82], RAIN_MOD = [63, 81], RAIN_LIGHT = [51, 53, 55, 61, 80];
const SLEET = [56, 57, 66, 67], SNOW_HEAVY = [75, 86], SNOW = [71, 73, 77, 85];
export const isWet = (c) => c >= 51 && c !== 71 && c !== 73 && c !== 75 && c !== 77 && c !== 85 && c !== 86;
export const isSnow = (c) => SNOW.includes(c) || SNOW_HEAVY.includes(c);

/**
 * Clasifica una situación meteorológica real.
 * w = { code, temp, wind, gusts, isDay, uv, humidity, tmin }
 * Prioridad: fenómeno más severo primero; después viento y temperaturas extremas; al final, cielo.
 */
export function classify(w) {
  const c = w.code, wind = w.wind ?? 0, gusts = w.gusts ?? 0, t = w.temp;
  const windy = wind >= 40 || gusts >= 70;
  let key;
  if (c >= 95) key = 'storm';
  else if (SNOW_HEAVY.includes(c)) key = 'snow-heavy';
  else if (SNOW.includes(c)) key = 'snow';
  else if (SLEET.includes(c)) key = 'sleet';
  else if (RAIN_HEAVY.includes(c) || RAIN_MOD.includes(c) || RAIN_LIGHT.includes(c)) {
    if (windy) key = 'gale';
    else key = RAIN_HEAVY.includes(c) ? 'rain-heavy' : RAIN_MOD.includes(c) ? 'rain' : 'drizzle';
  } else if (c === 45 || c === 48) key = 'fog';
  else if (windy || gusts >= 65) key = 'wind';
  else if (t >= 36) key = 'heat-extreme';
  else if (t <= 0) key = 'frost';
  else if (t >= 30 && w.isDay && c <= 2) key = 'heat';
  else if (t <= 5 && c <= 2) key = 'cold';
  else if (!w.isDay) key = c <= 1 ? 'night-clear' : 'night-cloudy';
  else key = c <= 1 ? 'sun' : c === 2 ? 'partly' : 'cloudy';

  const specials = [];
  if (c === 96 || c === 99) specials.push('Granizo');
  if ((w.uv ?? 0) >= 8) specials.push('UV muy alto');
  if (t >= 26 && (w.humidity ?? 0) >= 75) specials.push('Bochorno');
  if (gusts >= 50 && key !== 'wind' && key !== 'gale') specials.push('Rachas fuertes');
  if (t <= -5) specials.push('Frío intenso');
  if (!w.isDay && t >= 25) specials.push('Noche tórrida');
  if (w.tmin != null && w.tmin <= 0 && key !== 'frost') specials.push('Helada nocturna');
  return { key, label: WMO[c] ?? 'Sin datos', title: GROUPS[key].title, specials };
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }

/** Elige un Pokémon del grupo. Misma semilla → mismo Pokémon; semillas distintas (otra ciudad u otro día) varían. */
export function pick(key, seed) {
  const list = GROUPS[key].mons, [id, name, note] = list[hash(seed + '|' + key) % list.length];
  return { id, name, note, group: key };
}

export const artUrl = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const spriteUrl = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
export const dex = (id) => 'N.º ' + String(id).padStart(4, '0');

export const TYPES = {
  normal: ['Normal', '#9099a1'], fire: ['Fuego', '#ff7a3d'], water: ['Agua', '#3d8fe0'], electric: ['Eléctrico', '#e6b800'],
  grass: ['Planta', '#4caf50'], ice: ['Hielo', '#4fc3c9'], fighting: ['Lucha', '#ce4069'], poison: ['Veneno', '#ab6ac8'],
  ground: ['Tierra', '#c97b47'], flying: ['Volador', '#7d9fe0'], psychic: ['Psíquico', '#f25f7a'], bug: ['Bicho', '#8fb820'],
  rock: ['Roca', '#b0a36d'], ghost: ['Fantasma', '#5269ac'], dragon: ['Dragón', '#0a6dc4'], dark: ['Siniestro', '#5a5366'],
  steel: ['Acero', '#5a8ea1'], fairy: ['Hada', '#ec8fe6'],
};

/** Tipos, nombre en español y categoría desde PokeAPI. Se guarda para siempre en el navegador: una petición por Pokémon. */
const infoMem = new Map();
export function pokemonInfo(id) {
  if (infoMem.has(id)) return infoMem.get(id);
  const p = (async () => {
    const k = 'pw:mon2:' + id;
    try { const hit = JSON.parse(localStorage.getItem(k)); if (hit?.types) return hit; } catch {}
    const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error('PokeAPI ' + r.status); return r.json(); };
    const [mon, sp] = await Promise.all([get(`https://pokeapi.co/api/v2/pokemon/${id}`), get(`https://pokeapi.co/api/v2/pokemon-species/${id}`).catch(() => null)]);
    const es = (arr, f) => arr?.find((x) => x.language.name === 'es')?.[f];
    const info = {
      types: mon.types.map((t) => t.type.name),
      art: mon.sprites?.other?.['official-artwork']?.front_default || artUrl(id),
      name: es(sp?.names, 'name') || null, genus: es(sp?.genera, 'genus') || null,
      height: mon.height / 10, weight: mon.weight / 10,
      // Entradas de la Pokédex en español (sin repetidas): son las curiosidades que se muestran
      facts: [...new Set((sp?.flavor_text_entries || []).filter((f) => f.language.name === 'es').map((f) => f.flavor_text.replace(/[\n\f\r­]+/g, ' ').replace(/\s+/g, ' ').trim()))].slice(-8),
    };
    try { localStorage.setItem(k, JSON.stringify(info)); } catch {}
    return info;
  })();
  p.catch(() => infoMem.delete(id));
  infoMem.set(id, p);
  return p;
}

const NOW = {
  storm: 'Hay tormenta eléctrica en la zona', gale: 'Temporal de viento y lluvia', 'rain-heavy': 'Llueve con fuerza',
  rain: 'Está lloviendo', drizzle: 'Caen algunas gotas', sleet: 'Cae lluvia helada', 'snow-heavy': 'Nieva con intensidad',
  snow: 'Está nevando', fog: 'La niebla reduce la visibilidad', wind: 'Sopla viento fuerte', 'heat-extreme': 'Calor extremo',
  heat: 'Hace calor', sun: 'Luce el sol', partly: 'Alternan nubes y claros', cloudy: 'El cielo está cubierto',
  'night-clear': 'Noche despejada', 'night-cloudy': 'Noche con nubes', frost: 'Está helando', cold: 'Hace frío',
};

/**
 * Texto generado por reglas a partir de los datos (sin IA).
 * next = próximas horas: [{ code, temp, prob }]
 */
export function describe({ mon, place, cls, temp, wind, next }) {
  const t = Math.round(temp);
  let now = NOW[cls.key];
  if (cls.key === 'wind' || cls.key === 'gale') now += `, con ${Math.round(wind)} km/h`;
  else now += ` y el termómetro marca ${t}°`;

  const wetNow = ['storm', 'gale', 'rain-heavy', 'rain', 'drizzle', 'sleet'].includes(cls.key);
  const maxProb = Math.max(0, ...next.map((h) => h.prob ?? 0));
  const stormSoon = next.some((h) => h.code >= 95), snowSoon = next.some((h) => isSnow(h.code)), wetSoon = next.some((h) => isWet(h.code));
  const last = next.at(-1), delta = last ? Math.round(last.temp) - t : 0;
  let then;
  if (cls.key === 'storm') then = stormSoon ? 'Se esperan tormentas eléctricas durante las próximas horas' : 'La tormenta tenderá a remitir en las próximas horas';
  else if (stormSoon) then = 'Se esperan tormentas eléctricas durante las próximas horas';
  else if (snowSoon && !cls.key.startsWith('snow')) then = 'Se espera nieve en las próximas horas';
  else if (!wetNow && (wetSoon || maxProb >= 60)) then = `Se espera lluvia en las próximas horas (probabilidad del ${maxProb} %)`;
  else if (wetNow && !wetSoon && maxProb < 30) then = 'La lluvia irá remitiendo en las próximas horas';
  else if (wetNow) then = 'Seguirá lloviendo durante las próximas horas';
  else if (delta >= 4) then = `La temperatura subirá hasta los ${t + delta}° en las próximas horas`;
  else if (delta <= -4) then = `La temperatura bajará hasta los ${t + delta}° en las próximas horas`;
  else then = 'No se esperan cambios importantes en las próximas horas';
  return `${mon.name} ha aparecido en ${place}. ${now}. ${then}.`;
}
