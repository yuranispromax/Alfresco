/** Utilidades de lectura/escritura sobre Google Sheets. */

function ss_() {
  return SpreadsheetApp.getActive();
}

function sheet_(key) {
  const def = SHEETS[key];
  const sh = ss_().getSheetByName(def.name);
  if (!sh) throw new Error(`Falta la hoja "${def.name}". Ejecuta 🛒 Compras › Inicializar estructura.`);
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
  const rows = objs.map(o => headers.map(h => (o[h] === undefined || o[h] === null) ? '' : o[h]));
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  invalidate_(key);
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

function num_(v) {
  if (typeof v === 'number') return v;
  let s = String(v).replace(/[$\s%]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); // formato 1.234,5
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  const d = new Date(v);
  return isNaN(d) ? null : d;
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

function sum_(arr, fn) {
  return arr.reduce((a, x) => a + fn(x), 0);
}

function ratio_(a, b) {
  return b ? a / b : null;
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function currentUser_() {
  try { return Session.getActiveUser().getEmail() || 'web'; } catch (e) { return 'web'; }
}
