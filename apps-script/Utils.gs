/** Utilidades de lectura/escritura sobre Google Sheets. */

function ss_() {
  return SpreadsheetApp.getActive();
}

/** Hoja de una tabla; si no existe (p. ej. tras una actualización del sistema) se crea con su formato. */
function sheet_(key) {
  return ss_().getSheetByName(SHEETS[key].name) || crearHoja_(key);
}

function crearHoja_(key) {
  const def = SHEETS[key];
  const sh = ss_().getSheetByName(def.name) || ss_().insertSheet(def.name);
  if (def.headers.length) {
    sh.getRange(1, 1, 1, def.headers.length).setValues([def.headers])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#c8102e')
      .setWrap(true).setVerticalAlignment('middle');
    sh.setFrozenRows(1);
    formatColumns_(sh, def);
  }
  return sh;
}

/** Caché por ejecución: cada llamada del dashboard lee cada hoja una sola vez. */
let TABLE_CACHE_ = {};
function invalidate_(key) {
  delete TABLE_CACHE_[key];
  if (key === 'CONFIG') CONFIG_CACHE_ = null;
}

/** Devuelve las filas de una hoja como objetos {encabezado: valor, _row}. */
function readTable_(key) {
  if (TABLE_CACHE_[key]) return TABLE_CACHE_[key];
  const headers = SHEETS[key].headers;
  const values = sheet_(key).getDataRange().getValues();
  return TABLE_CACHE_[key] = values.slice(1)
    .map((r, i) => {
      const o = { _row: i + 2 };
      headers.forEach((h, j) => { o[h] = r[j] === undefined ? '' : r[j]; });
      return o;
    })
    .filter(o => headers.some(h => o[h] !== '' && o[h] !== null));
}

function appendRows_(key, objs) {
  if (!objs.length) return;
  const headers = SHEETS[key].headers;
  const sh = sheet_(key);
  const rows = objs.map(o => headers.map(h => celda_(o[h])));
  const start = sh.getLastRow() + 1;
  const falta = start + rows.length - 1 - sh.getMaxRows();
  if (falta > 0) sh.insertRowsAfter(sh.getMaxRows(), falta + 100); // la hoja crece sola
  sh.getRange(start, 1, rows.length, headers.length).setValues(rows);
  invalidate_(key);
}

/** Valor seguro para escribir: vacío si no hay dato; texto que empieza por "=" no se ejecuta como fórmula. */
function celda_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string' && /^[=+@]/.test(v)) return "'" + v;
  return v;
}

function setCell_(key, row, header, value) {
  const col = SHEETS[key].headers.indexOf(header) + 1;
  if (col < 1) throw new Error(`Columna "${header}" no existe en ${SHEETS[key].name}`);
  sheet_(key).getRange(row, col).setValue(value);
  invalidate_(key);
}

let CONFIG_CACHE_ = null;
function getConfig_() {
  if (CONFIG_CACHE_) return CONFIG_CACHE_;
  const cfg = {};
  DEFAULT_CONFIG.forEach(([k, v]) => { cfg[k] = v; });
  readTable_('CONFIG').forEach(r => {
    if (r['Parámetro'] && r['Valor'] !== '') cfg[r['Parámetro']] = r['Valor'];
  });
  CONFIG_CACHE_ = cfg;
  return cfg;
}

function setConfig_(key, value) {
  const row = readTable_('CONFIG').find(r => r['Parámetro'] === key);
  if (row) setCell_('CONFIG', row._row, 'Valor', value);
  else appendRows_('CONFIG', [{ 'Parámetro': key, 'Valor': value }]);
  CONFIG_CACHE_ = null;
}

/* ---------- tipos ---------- */

/**
 * Número desde texto en formato colombiano o internacional:
 * "1.500.000" · "1.500.000,50" · "1,500,000.50" · "$ 2.000" · "7850" → número.
 */
function num_(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v === null || v === undefined || v === '') return 0;
  let s = String(v).replace(/[$\s%\u00a0]/g, '');
  const coma = s.lastIndexOf(','), punto = s.lastIndexOf('.');
  if (coma > -1 && punto > -1) {
    s = coma > punto ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (coma > -1) {
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if (punto > -1 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

/** Fecha desde Date, 'aaaa-mm-dd', 'dd/mm/aaaa' o serial de Excel (siempre en hora local). */
function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  const d = parseFecha_(v);
  return d instanceof Date && !isNaN(d) ? d : null;
}

function parseFecha_(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'number') {
    const utc = new Date(Math.round((v - 25569) * 86400000));
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }
  const t = String(v).trim();
  const crear = (y, mo, d) => {
    const f = new Date(y, mo - 1, d);
    return f.getFullYear() === y && f.getMonth() === mo - 1 && f.getDate() === d ? f : v; // rechaza 31/02, 99/99…
  };
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return crear(+m[1], +m[2], +m[3]);
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:\s.*)?$/);
  if (m) return crear(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  return v;
}

function startOfDay_(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays_(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function daysBetween_(a, b) {
  return Math.round((startOfDay_(b) - startOfDay_(a)) / 86400000);
}

/** 'yyyy-MM' de una fecha. */
function periodOf_(d) {
  return Utilities.formatDate(d, APP.TZ, 'yyyy-MM');
}

/** Normaliza un periodo escrito como texto o convertido en fecha por Sheets. */
function normPeriodo_(v) {
  if (v instanceof Date) return periodOf_(v);
  const s = String(v).trim();
  const m = s.match(/^(\d{4})[-/](\d{1,2})/);
  return m ? `${m[1]}-${('0' + m[2]).slice(-2)}` : s;
}

function prevPeriodo_(p) {
  const [y, m] = p.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${('0' + (m - 1)).slice(-2)}`;
}

function fmtDate_(d) {
  return d ? Utilities.formatDate(d, APP.TZ, 'dd/MM/yyyy') : '';
}

function fmtMoney_(n) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtPct_(n) {
  return n === null || n === undefined ? '—' : (n * 100).toFixed(1).replace('.', ',') + '%';
}

/** "1 rechazo", "3 rechazos" · plural irregular opcional. */
function plural_(n, uno, varios) {
  return `${n} ${n === 1 ? uno : (varios || uno + 's')}`;
}

function sum_(arr, fn) {
  return arr.reduce((a, x) => a + fn(x), 0);
}

function ratio_(a, b) {
  return b ? a / b : null;
}

function escapeHtml_(s) {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function currentUser_() {
  try { return Session.getActiveUser().getEmail() || 'web'; } catch (e) { return 'web'; }
}
