/** Reglas de negocio por registro y columnas calculadas. */

function entregaRow_(oc, proveedor, codigo, pedida, recibida, pactada, real, usuario) {
  const r = evalEntrega_(pedida, recibida, pactada, real);
  return {
    OC: oc, Proveedor: proveedor, 'Código': codigo, 'Cantidad Pedida': pedida, 'Cantidad Recibida': recibida,
    'Fecha Pactada': pactada, 'Fecha Real': real,
    'A Tiempo': r.aTiempo, Completa: r.completa, OTIF: r.otif, 'Registrado Por': usuario,
  };
}

/** OTIF = entrega completa (dentro de la tolerancia) Y a tiempo (dentro de los días de gracia). */
function evalEntrega_(pedida, recibida, pactada, real) {
  const cfg = getConfig_();
  const p = toDate_(pactada), r = toDate_(real);
  if (!p || !r) return { aTiempo: '', completa: '', otif: '' };
  const aTiempo = daysBetween_(p, r) <= num_(cfg.OTIF_TOLERANCIA_DIAS);
  const completa = num_(recibida) >= num_(pedida) * (1 - num_(cfg.OTIF_TOLERANCIA_CANTIDAD));
  const sn = b => (b ? 'Sí' : 'No');
  return { aTiempo: sn(aTiempo), completa: sn(completa), otif: sn(aTiempo && completa) };
}

/** Ahorro mensual = (precio ofertado − negociado) × volumen anual / 12. Variación = negociado vs anterior. */
function evalNegociacion_(r) {
  const ant = num_(r['Precio Anterior']), ofe = num_(r['Precio Ofertado']), neg = num_(r['Precio Negociado']);
  return {
    Ahorro: Math.max(0, (ofe || ant) - neg) * num_(r['Volumen Anual']) / 12,
    'Variación %': ant ? (neg - ant) / ant : '',
  };
}

function pagoRow_(factura, proveedor, fechaFactura, vencimiento, valor, fechaPago) {
  const e = evalPago_(vencimiento, fechaPago);
  return {
    Factura: factura, Proveedor: proveedor, 'Fecha Factura': fechaFactura, 'Fecha Vencimiento': vencimiento,
    Valor: valor, 'Fecha Pago': fechaPago, 'Días Mora': e.mora, Estado: e.estado,
  };
}

function evalPago_(vencimiento, fechaPago, hoy) {
  hoy = hoy || startOfDay_(new Date());
  const v = toDate_(vencimiento), p = toDate_(fechaPago);
  if (!v) return { mora: '', estado: '' };
  if (p) {
    const mora = Math.max(0, daysBetween_(v, p));
    return { mora, estado: mora ? 'Pagada tarde' : 'Pagada a tiempo' };
  }
  const mora = daysBetween_(v, hoy);
  return mora > 0 ? { mora, estado: 'Vencida' } : { mora: 0, estado: 'Por vencer' };
}

/**
 * Recalcula columnas derivadas en bloque (para filas digitadas a mano en la hoja).
 * Una sola escritura por columna para no agotar cuotas.
 */
function recalcularColumnas_() {
  const updates = {
    ORDENES: r => ({ Total: num_(r.Cantidad) * num_(r['Precio Unitario']) }),
    RECHAZOS: r => ({ 'Costo Total': num_(r.Cantidad) * num_(r['Costo Unitario']) }),
    NEGOCIACIONES: r => evalNegociacion_(r),
    ENTREGAS: r => {
      const e = evalEntrega_(r['Cantidad Pedida'], r['Cantidad Recibida'], r['Fecha Pactada'], r['Fecha Real']);
      return { 'A Tiempo': e.aTiempo, Completa: e.completa, OTIF: e.otif };
    },
    PAGOS: r => {
      const e = evalPago_(r['Fecha Vencimiento'], r['Fecha Pago']);
      return { 'Días Mora': e.mora, Estado: e.estado };
    },
  };
  Object.keys(updates).forEach(key => {
    const rows = readTable_(key);
    if (!rows.length) return;
    const headers = SHEETS[key].headers;
    const computed = rows.map(updates[key]);
    const sh = sheet_(key);
    const lastRow = rows[rows.length - 1]._row;
    Object.keys(computed[0]).forEach(h => {
      const col = headers.indexOf(h) + 1;
      const current = sh.getRange(2, col, lastRow - 1, 1).getValues();
      rows.forEach((r, i) => { current[r._row - 2][0] = computed[i][h]; });
      sh.getRange(2, col, lastRow - 1, 1).setValues(current);
    });
  });
}
