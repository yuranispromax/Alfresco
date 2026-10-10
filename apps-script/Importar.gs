/**
 * Carga de información adjunta (Excel / CSV) desde el dashboard.
 * El navegador lee el archivo (SheetJS) y envía una matriz; aquí se mapean
 * columnas, se convierten tipos, se escribe la tabla y se archiva el original en Drive.
 */

function tablasCargables_() {
  return Object.keys(REQUERIDOS);
}

function normHeader_(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Encabezado del archivo → columna del sistema (o null si no se reconoce). */
function mapearColumnas_(key, encabezados) {
  const destino = SHEETS[key].headers;
  const usados = new Set();
  return encabezados.map(h => {
    const n = normHeader_(h);
    if (!n) return null;
    let col = destino.find(d => normHeader_(d) === n);
    if (!col) col = destino.find(d => (ALIAS[d] || []).includes(n));
    if (!col || usados.has(col)) return null;
    usados.add(col);
    return col;
  });
}

function getEsquema() {
  const tablas = {};
  tablasCargables_().forEach(k => {
    tablas[k] = {
      key: k, nombre: SHEETS[k].name, headers: SHEETS[k].headers,
      requeridos: REQUERIDOS[k], listas: SHEETS[k].lists || {}, filas: readTable_(k).length,
    };
  });
  return { modulos: MODULOS, tablas };
}

/** Vista previa: cómo quedarían mapeadas las columnas del archivo. */
function previsualizarCarga(key, encabezados) {
  if (!tablasCargables_().includes(key)) throw new Error('Tabla no válida: ' + key);
  const mapa = mapearColumnas_(key, encabezados);
  const mapeadas = mapa.filter(Boolean);
  return {
    mapa,
    faltantes: REQUERIDOS[key].filter(r => !mapeadas.includes(r)),
    ignoradas: encabezados.filter((h, i) => h !== '' && !mapa[i]),
  };
}

function convertirValor_(header, v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') v = v.trim();
  if (v === '') return '';
  if (header === 'Periodo') return normPeriodo_(v);
  if (/^Fecha|Licitación$/.test(header)) return parseFecha_(v);
  if (/Cantidad|Precio|Costo|Valor$|^Total|Presupuesto|^Ventas|Volumen|Stock|Rotación|Ahorro/.test(header)) return num_(v);
  if (header === 'Avance %') { const n = num_(v); return n > 1 ? n / 100 : n; }
  if (header === 'Pareto' || header === 'Paro Entregas') return /^(s|si|sí|x|1|true|yes)$/i.test(String(v)) ? 'Sí' : 'No';
  return v;
}

/** Acepta 'yyyy-mm-dd' (lo que envía el navegador), 'dd/mm/yyyy' y seriales de Excel. */
function parseFecha_(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400000) + new Date().getTimezoneOffset() * 60000);
  let m = String(v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = String(v).match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1]);
  return v;
}

/**
 * payload = { tabla, modo: 'agregar'|'reemplazar', encabezados: [], filas: [[]], archivo: {nombre, tipo, data}, modulo }
 */
function cargarDatos(payload) {
  const key = payload.tabla;
  const prev = previsualizarCarga(key, payload.encabezados);
  if (prev.faltantes.length) throw new Error('Faltan columnas obligatorias: ' + prev.faltantes.join(', '));

  const objs = payload.filas
    .map(fila => {
      const o = {};
      prev.mapa.forEach((col, i) => { if (col) o[col] = convertirValor_(col, fila[i]); });
      return o;
    })
    .filter(o => REQUERIDOS[key].some(r => o[r] !== '' && o[r] !== undefined));
  if (!objs.length) throw new Error('El archivo no tiene filas con datos.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_(key);
    if (payload.modo === 'reemplazar' && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, SHEETS[key].headers.length).clearContent();
      invalidate_(key);
    }
    appendRows_(key, objs);

    const url = archivarAdjunto_(key, payload.archivo);
    appendRows_('CARGAS', [{
      Fecha: new Date(), 'Módulo': payload.modulo || '', Tabla: SHEETS[key].name,
      Archivo: payload.archivo ? payload.archivo.nombre : '', Filas: objs.length,
      Modo: payload.modo, Usuario: currentUser_(), Drive: url,
    }]);
  } finally {
    lock.releaseLock();
  }

  actualizarDashboard(payload.periodo);
  return { filas: objs.length, ignoradas: prev.ignoradas, tabla: SHEETS[key].name };
}

/** Guarda el archivo original en Drive › Gestión de Compras › Adjuntos › <tabla>. */
function archivarAdjunto_(key, archivo) {
  if (!archivo || !archivo.data) return '';
  ensureDriveFolders_();
  const root = DriveApp.getFolderById(getConfig_().CARPETA_DRIVE_ID);
  const carpeta = subcarpeta_(subcarpeta_(root, 'Adjuntos'), SHEETS[key].name);
  const nombre = Utilities.formatDate(new Date(), APP.TZ, 'yyyyMMdd_HHmm_') + archivo.nombre;
  const blob = Utilities.newBlob(Utilities.base64Decode(archivo.data), archivo.tipo || 'application/octet-stream', nombre);
  return carpeta.createFile(blob).getUrl();
}

function subcarpeta_(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

function getCargas() {
  return readTable_('CARGAS').slice(-30).reverse().map(c => ({
    fecha: Utilities.formatDate(toDate_(c.Fecha) || new Date(), APP.TZ, 'dd/MM/yyyy HH:mm'),
    modulo: c['Módulo'], tabla: c.Tabla, archivo: c.Archivo, filas: c.Filas, modo: c.Modo, usuario: c.Usuario, drive: c.Drive,
  }));
}
