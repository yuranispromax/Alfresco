/**
 * Carga de información adjunta (Excel / CSV) desde el dashboard.
 * El navegador lee el archivo (SheetJS) y envía una matriz; aquí se mapean
 * columnas, se convierten tipos, se escribe la tabla y se archiva el original en Drive.
 */

function tablasCargables_() {
  return Object.keys(REQUERIDOS);
}

function normHeader_(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Encabezado del archivo → columna del sistema (o null si no se reconoce).
 * Primero los nombres exactos y luego los sinónimos, para que un sinónimo no
 * le quite la columna a un encabezado que coincide exactamente.
 */
function mapearColumnas_(key, encabezados) {
  const destino = SHEETS[key].headers;
  const norm = encabezados.map(normHeader_);
  const mapa = encabezados.map(() => null);
  const usados = new Set();
  norm.forEach((n, i) => {
    const col = n && destino.find(d => normHeader_(d) === n);
    if (col && !usados.has(col)) { mapa[i] = col; usados.add(col); }
  });
  norm.forEach((n, i) => {
    if (mapa[i] || !n) return;
    const col = destino.find(d => !usados.has(d) && (ALIAS[d] || []).includes(n));
    if (col) { mapa[i] = col; usados.add(col); }
  });
  return mapa;
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
  exigirAdmin_();
  if (!tablasCargables_().includes(key)) throw new Error('Tabla no válida: ' + key);
  const mapa = mapearColumnas_(key, encabezados);
  const mapeadas = mapa.filter(Boolean);
  return {
    mapa,
    faltantes: REQUERIDOS[key].filter(r => !mapeadas.includes(r)),
    ignoradas: encabezados.filter((h, i) => h !== '' && !mapa[i]),
  };
}

const COLUMNAS_TEXTO = ['OC', 'Código', 'Factura', 'NIT', 'Lote', 'ID', 'Proveedor', 'Proveedor Principal', 'Proveedor Alterno'];

function convertirValor_(key, header, v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') v = v.trim();
  if (v === '') return '';
  if (header === 'Periodo') return normPeriodo_(v);
  if (/^Fecha|Licitación$/.test(header)) return parseFecha_(v);
  if (COLUMNAS_TEXTO.includes(header)) return String(v).trim();
  if (header === 'Avance %') { const n = num_(v); return n > 1 ? n / 100 : n; }
  if (/Cantidad|Precio|Costo|Valor$|^Total|Presupuesto|^Ventas|Volumen|Stock|Rotación|Ahorro/.test(header)) return num_(v);
  if (header === 'Pareto' || header === 'Paro Entregas') return /^(s|si|sí|x|1|true|yes)$/i.test(String(v)) ? 'Sí' : 'No';
  const lista = SHEETS[key].lists && SHEETS[key].lists[header];
  if (lista) {
    const n = normHeader_(v);
    return lista.find(x => normHeader_(x) === n) || v; // "CONCLUIDO" → "Concluido"
  }
  return v;
}

/**
 * payload = { tabla, modo: 'agregar'|'reemplazar', encabezados: [], filas: [[]], archivo: {nombre, tipo, data}, modulo }
 */
function cargarDatos(payload) {
  exigirAdmin_();
  const key = payload.tabla;
  const prev = previsualizarCarga(key, payload.encabezados);
  if (prev.faltantes.length) throw new Error('Faltan columnas obligatorias: ' + prev.faltantes.join(', '));

  const objs = payload.filas
    .map(fila => {
      const o = {};
      prev.mapa.forEach((col, i) => { if (col) o[col] = convertirValor_(key, col, fila[i]); });
      return o;
    })
    .filter(o => REQUERIDOS[key].some(r => o[r] !== '' && o[r] !== undefined));
  if (!objs.length) throw new Error('El archivo no tiene filas con datos.');

  // Avisos: filas sin datos obligatorios o con fechas que no se pudieron leer
  const avisos = [];
  const incompletas = objs.filter(o => REQUERIDOS[key].some(r => o[r] === '' || o[r] === undefined)).length;
  if (incompletas) avisos.push(`${incompletas} fila(s) con columnas obligatorias vacías`);
  const fechasMal = objs.filter(o => Object.keys(o).some(h => /^Fecha/.test(h) && o[h] !== '' && !(o[h] instanceof Date))).length;
  if (fechasMal) avisos.push(`${fechasMal} fila(s) con fechas que no se reconocieron (usa dd/mm/aaaa)`);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_(key);
    if (payload.modo === 'reemplazar' && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, SHEETS[key].headers.length).clearContent();
      invalidate_(key);
    }
    asignarIds_(key, objs);
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
  return { filas: objs.length, ignoradas: prev.ignoradas, tabla: SHEETS[key].name, avisos };
}

/** Rechazos y proyectos sin ID reciben uno consecutivo (RCH-0001, PRY-1…). */
function asignarIds_(key, objs) {
  const pref = { RECHAZOS: ['RCH-', 4], PROYECTOS: ['PRY-', 0] }[key];
  if (!pref) return;
  let n = readTable_(key).concat(objs).reduce((m, r) => Math.max(m, Number(String(r.ID || '').replace(/\D/g, '')) || 0), 0);
  objs.forEach(o => {
    if (!o.ID) o.ID = pref[0] + (pref[1] ? String(++n).padStart(pref[1], '0') : String(++n));
  });
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
  exigirAdmin_();
  return readTable_('CARGAS').slice(-30).reverse().map(c => ({
    fecha: Utilities.formatDate(toDate_(c.Fecha) || new Date(), APP.TZ, 'dd/MM/yyyy HH:mm'),
    modulo: c['Módulo'], tabla: c.Tabla, archivo: c.Archivo, filas: c.Filas, modo: c.Modo, usuario: c.Usuario, drive: c.Drive,
  }));
}
