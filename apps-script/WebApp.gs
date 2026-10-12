/** Dashboard web (diálogo en la hoja o Web App) y formularios de captura. */

/** Enlace web: consulta para todos; solo la persona administradora puede modificar. */
function doGet() {
  return htmlDashboard_(puedeEditar_() ? 'edicion' : 'lectura')
    .setTitle(APP.NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function abrirDashboard() {
  const html = htmlDashboard_(puedeEditar_() ? 'edicion' : 'lectura').setWidth(1280).setHeight(820);
  SpreadsheetApp.getUi().showModalDialog(html, APP.NAME);
}

function htmlDashboard_(modo) {
  const t = HtmlService.createTemplateFromFile('Dashboard');
  t.modo = modo === 'edicion' ? 'edicion' : 'lectura';
  return t.evaluate();
}

/* ---------- Permisos ---------- */

/** Correo del dueño de la hoja (o de quien ejecuta, si la hoja está en una unidad compartida). */
function correoAdmin_() {
  try {
    const o = ss_().getOwner();
    if (o && o.getEmail()) return o.getEmail().toLowerCase();
  } catch (e) { /* sin dueño visible */ }
  return String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
}

/**
 * ¿Quien usa el tablero puede modificar datos? Solo el dueño de la hoja y los correos de
 * Config › ADMINISTRADORES. En el enlace web, quien no es dueño llega sin correo o con otro
 * correo, así que queda en modo consulta.
 */
function puedeEditar_() {
  let yo = '';
  try { yo = String(Session.getActiveUser().getEmail() || '').toLowerCase(); } catch (e) { /* anónimo */ }
  if (!yo) return false;
  const extra = String(getConfig_().ADMINISTRADORES || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  return yo === correoAdmin_() || extra.includes(yo);
}

function exigirAdmin_() {
  if (!puedeEditar_()) throw new Error('Este tablero es de consulta. Solo la persona administradora puede modificar la información.');
}

/** Tipografía Nourd: archivo HTML opcional "Fuentes" con los @font-face (no se versiona: fuente con licencia). */
function incluirFuentes_() {
  try { return HtmlService.createHtmlOutputFromFile('Fuentes').getContent(); } catch (e) { return ''; }
}

/** Todo lo que pinta el dashboard en una sola llamada. */
function getDashboardData(periodo) {
  const edita = puedeEditar_();
  const data = calcularIndicadores(periodo);
  const conteos = {};
  tablasCargables_().forEach(k => { conteos[k] = readTable_(k).length; });
  return Object.assign(data, {
    tendencia: tendencia_(data.periodo, 6),
    conteos,
    esquema: getEsquema(),
    cargas: edita ? getCargas().slice(0, 10) : [],
    analisis: analisisPeriodo_(data.periodo),
    modo: edita ? 'edicion' : 'lectura',
  });
}

/* ---------- Análisis / observaciones por indicador y periodo ---------- */

function analisisFila_(r) {
  return {
    periodo: normPeriodo_(r.Periodo), indicador: r.Indicador, analisis: String(r['Análisis'] || ''),
    plan: String(r['Plan de Acción'] || ''), responsable: String(r.Responsable || ''),
    compromiso: toDate_(r['Fecha Compromiso']) ? Utilities.formatDate(toDate_(r['Fecha Compromiso']), APP.TZ, 'yyyy-MM-dd') : '',
    autor: String(r.Autor || ''),
    actualizado: toDate_(r.Actualizado) ? Utilities.formatDate(toDate_(r.Actualizado), APP.TZ, 'dd/MM/yyyy HH:mm') : '',
  };
}

/** { idIndicador: análisis } del periodo. */
function analisisPeriodo_(periodo) {
  const out = {};
  readTable_('ANALISIS').filter(r => normPeriodo_(r.Periodo) === periodo).forEach(r => { out[r.Indicador] = analisisFila_(r); });
  return out;
}

/** Historial de análisis de un indicador (más reciente primero). */
function getHistorialAnalisis(indicador) {
  return readTable_('ANALISIS').filter(r => r.Indicador === indicador).map(analisisFila_)
    .sort((a, b) => (a.periodo < b.periodo ? 1 : -1)).slice(0, 12);
}

/** Crea o actualiza el análisis de (periodo, indicador). */
function guardarAnalisis(d) {
  exigirAdmin_();
  const periodo = normPeriodo_(d.periodo);
  const mod = MODULOS.find(m => m.id === d.indicador);
  if (!mod || !/^\d{4}-\d{2}$/.test(periodo)) throw new Error('Indicador o periodo no válido.');
  if (!String(d.analisis || '').trim() && !String(d.plan || '').trim()) throw new Error('Escribe el análisis o el plan de acción.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const fila = {
      Periodo: periodo, Indicador: d.indicador, Nombre: mod.titulo,
      'Análisis': String(d.analisis || '').trim(), 'Plan de Acción': String(d.plan || '').trim(),
      Responsable: String(d.responsable || '').trim(),
      'Fecha Compromiso': d.compromiso ? parseFecha_(d.compromiso) : '',
      Autor: currentUser_(), Actualizado: new Date(),
    };
    const ex = readTable_('ANALISIS').find(r => normPeriodo_(r.Periodo) === periodo && r.Indicador === d.indicador);
    if (ex) {
      sheet_('ANALISIS').getRange(ex._row, 1, 1, SHEETS.ANALISIS.headers.length)
        .setValues([SHEETS.ANALISIS.headers.map(h => celda_(fila[h]))]);
      invalidate_('ANALISIS');
    } else {
      appendRows_('ANALISIS', [fila]);
    }
  } finally {
    lock.releaseLock();
  }
  return analisisPeriodo_(periodo)[d.indicador];
}

function getCatalogos() {
  exigirAdmin_();
  return {
    proveedores: readTable_('PROVEEDORES').filter(p => p.Estado !== 'Inactivo').map(p => p.Proveedor),
    productos: readTable_('PRODUCTOS').filter(p => p.Estado !== 'Inactivo')
      .map(p => ({ codigo: String(p['Código']), nombre: p.Producto, precio: num_(p['Precio Base']) })),
    motivos: LISTAS.MOTIVO_RECHAZO,
    ordenesAbiertas: readTable_('ORDENES').filter(o => o.Estado === 'Abierta' || o.Estado === 'Recibida parcial')
      .map(o => ({ oc: String(o.OC), proveedor: o.Proveedor, codigo: String(o['Código']), producto: o.Producto, cantidad: num_(o.Cantidad), pactada: fmtDate_(toDate_(o['Fecha Entrega Pactada'])) })),
  };
}

/** Rechazo desde el formulario: guarda la evidencia en Drive y registra la fila. */
function registrarRechazo(f) {
  exigirAdmin_();
  if (!f.proveedor || !f.codigo || !(num_(f.cantidad) > 0)) throw new Error('Proveedor, código y cantidad son obligatorios.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rows = readTable_('RECHAZOS');
    const next = rows.reduce((m, r) => Math.max(m, Number(String(r.ID).replace(/\D/g, '')) || 0), 0) + 1;
    const id = 'RCH-' + ('000' + next).slice(-4);

    let costoUnit = num_(f.costoUnitario);
    if (!costoUnit) {
      const prod = readTable_('PRODUCTOS').find(p => String(p['Código']) === String(f.codigo));
      costoUnit = prod ? num_(prod['Precio Base']) : 0;
    }

    let evidencia = '';
    if (f.archivo && f.archivo.data) {
      ensureDriveFolders_();
      const folder = DriveApp.getFolderById(getConfig_().CARPETA_EVIDENCIAS_ID);
      const blob = Utilities.newBlob(Utilities.base64Decode(f.archivo.data), f.archivo.tipo, `${id}_${f.archivo.nombre}`);
      evidencia = folder.createFile(blob).getUrl();
    }

    appendRows_('RECHAZOS', [{
      ID: id, Fecha: f.fecha ? parseFecha_(f.fecha) : startOfDay_(new Date()), Proveedor: f.proveedor, 'Código': f.codigo,
      Lote: f.lote, Cantidad: num_(f.cantidad), 'Costo Unitario': costoUnit, 'Costo Total': num_(f.cantidad) * costoUnit,
      Motivo: f.motivo, 'Descripción NC': f.descripcion, Estado: 'Abierto', Evidencia: evidencia, 'Registrado Por': currentUser_(),
    }]);
    return { id, evidencia };
  } finally {
    lock.releaseLock();
  }
}

/** Recepción en bodega contra OC: alimenta OTIF y actualiza el estado de la OC. */
function registrarRecepcion(f) {
  exigirAdmin_();
  const recibida = num_(f.cantidadRecibida);
  if (!f.oc) throw new Error('Selecciona la orden de compra.');
  if (!(recibida > 0)) throw new Error('La cantidad recibida debe ser mayor que cero.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Una OC puede tener varias líneas (productos): se usa la línea del código elegido, o la primera abierta
    const lineas = readTable_('ORDENES').filter(o => String(o.OC) === String(f.oc));
    const oc = lineas.find(o => f.codigo && String(o['Código']) === String(f.codigo)) || lineas.find(o => o.Estado !== 'Recibida') || lineas[0];
    if (!oc) throw new Error('OC no encontrada: ' + f.oc);
    const real = f.fechaReal ? parseFecha_(f.fechaReal) : startOfDay_(new Date());
    const row = entregaRow_(String(oc.OC), oc.Proveedor, String(oc['Código']), num_(oc.Cantidad), recibida, toDate_(oc['Fecha Entrega Pactada']), real, currentUser_());
    appendRows_('ENTREGAS', [row]);

    const totalRecibido = sum_(readTable_('ENTREGAS')
      .filter(e => String(e.OC) === String(oc.OC) && String(e['Código']) === String(oc['Código'])), e => num_(e['Cantidad Recibida']));
    setCell_('ORDENES', oc._row, 'Estado', totalRecibido >= num_(oc.Cantidad) ? 'Recibida' : 'Recibida parcial');
    return { otif: row.OTIF, aTiempo: row['A Tiempo'], completa: row.Completa };
  } finally {
    lock.releaseLock();
  }
}
