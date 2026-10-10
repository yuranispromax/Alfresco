/** Dashboard web (diálogo en la hoja o Web App) y formularios de captura. */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle(APP.NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function abrirDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard').setWidth(1280).setHeight(820);
  SpreadsheetApp.getUi().showModalDialog(html, APP.NAME);
}

function getDashboardData(periodo) {
  return calcularIndicadores(periodo);
}

function getCatalogos() {
  return {
    proveedores: readTable_('PROVEEDORES').filter(p => p.Estado !== 'Inactivo').map(p => p.Proveedor),
    productos: readTable_('PRODUCTOS').filter(p => p.Estado !== 'Inactivo')
      .map(p => ({ codigo: p['Código'], nombre: p.Producto, precio: num_(p['Precio Base']) })),
    motivos: LISTAS.MOTIVO_RECHAZO,
    ordenesAbiertas: readTable_('ORDENES').filter(o => o.Estado === 'Abierta' || o.Estado === 'Recibida parcial')
      .map(o => ({ oc: o.OC, proveedor: o.Proveedor, codigo: o['Código'], producto: o.Producto, cantidad: num_(o.Cantidad), pactada: fmtDate_(toDate_(o['Fecha Entrega Pactada'])) })),
  };
}

/** Rechazo desde el formulario: guarda la evidencia en Drive y registra la fila. */
function registrarRechazo(f) {
  if (!f.proveedor || !f.codigo || !(num_(f.cantidad) > 0)) throw new Error('Proveedor, código y cantidad son obligatorios.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rows = readTable_('RECHAZOS');
    const next = rows.reduce((m, r) => Math.max(m, Number(String(r.ID).replace(/\D/g, '')) || 0), 0) + 1;
    const id = 'RCH-' + ('000' + next).slice(-4);

    let costoUnit = num_(f.costoUnitario);
    if (!costoUnit) {
      const prod = readTable_('PRODUCTOS').find(p => p['Código'] === f.codigo);
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
      ID: id, Fecha: f.fecha ? new Date(f.fecha + 'T00:00:00') : new Date(), Proveedor: f.proveedor, 'Código': f.codigo,
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
  const oc = readTable_('ORDENES').find(o => o.OC === f.oc);
  if (!oc) throw new Error('OC no encontrada: ' + f.oc);
  const recibida = num_(f.cantidadRecibida);
  if (!(recibida >= 0)) throw new Error('Cantidad recibida inválida.');
  const real = f.fechaReal ? new Date(f.fechaReal + 'T00:00:00') : startOfDay_(new Date());
  const row = entregaRow_(oc.OC, oc.Proveedor, oc['Código'], num_(oc.Cantidad), recibida, toDate_(oc['Fecha Entrega Pactada']), real, currentUser_());
  appendRows_('ENTREGAS', [row]);

  const totalRecibido = sum_(readTable_('ENTREGAS').filter(e => e.OC === oc.OC), e => num_(e['Cantidad Recibida']));
  setCell_('ORDENES', oc._row, 'Estado', totalRecibido >= num_(oc.Cantidad) ? 'Recibida' : 'Recibida parcial');
  return { otif: row.OTIF, aTiempo: row['A Tiempo'], completa: row.Completa };
}
