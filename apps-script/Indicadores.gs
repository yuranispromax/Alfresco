/**
 * Cálculo de los 7 indicadores de la Dirección de Compras.
 * Todo el resultado es serializable (sin Date) para google.script.run.
 */

function calcularIndicadores(periodo) {
  const cfg = getConfig_();
  periodo = periodo ? normPeriodo_(periodo) : periodOf_(new Date());
  const hoy = startOfDay_(new Date());
  const enPeriodo = v => { const d = toDate_(v); return !!d && periodOf_(d) === periodo; };
  const kpis = [];

  /* 1. Proyectos concluidos / total (acumulado, excluye cancelados) */
  const proyectos = readTable_('PROYECTOS').filter(p => p.Estado !== 'Cancelado');
  const concluidos = proyectos.filter(p => p.Estado === 'Concluido').length;
  const proyVencidos = proyectos
    .filter(p => p.Estado !== 'Concluido' && toDate_(p['Fecha Compromiso']) && toDate_(p['Fecha Compromiso']) < hoy)
    .map(p => ({ id: p.ID, proyecto: p.Proyecto, compromiso: fmtDate_(toDate_(p['Fecha Compromiso'])), avance: num_(p['Avance %']) }));
  const proyectosEstado = {};
  LISTAS.ESTADO_PROYECTO.forEach(e => { proyectosEstado[e] = 0; });
  readTable_('PROYECTOS').forEach(p => { if (p.Estado in proyectosEstado) proyectosEstado[p.Estado]++; });
  kpis.push(kpi_('proyectos', 'Proyectos concluidos / Total', ratio_(concluidos, proyectos.length),
    cfg.META_PROYECTOS, 'pct', true, `${concluidos} de ${proyectos.length} · ${proyVencidos.length} vencidos`));

  /* 2. Participación Compras / Ventas + ejecución de presupuesto */
  const ocs = readTable_('ORDENES').filter(o => o.Estado !== 'Cancelada' && enPeriodo(o.Fecha));
  const compras = sum_(ocs, o => num_(o.Cantidad) * num_(o['Precio Unitario']));
  const ventas = sum_(readTable_('VENTAS').filter(v => normPeriodo_(v.Periodo) === periodo), v => num_(v.Ventas));
  const ppto = sum_(readTable_('PRESUPUESTO').filter(p => normPeriodo_(p.Periodo) === periodo), p => num_(p.Presupuesto));
  kpis.push(Object.assign(kpi_('compras_ventas', 'Participación Compras / Ventas', ratio_(compras, ventas),
    cfg.META_COMPRAS_VENTAS, 'pct', false,
    `Compras ${fmtMoney_(compras)} · Ventas ${fmtMoney_(ventas)} · Ejecución ppto ${fmtPct_(ratio_(compras, ppto))}`),
  { extra: { compras, ventas, ppto } }));

  /* 3. Ahorro por negociación y variación de precio negociada */
  const negs = readTable_('NEGOCIACIONES').filter(n => enPeriodo(n.Fecha));
  const ahorro = sum_(negs, n => evalNegociacion_(n).Ahorro);
  const baseNeg = sum_(negs, n => num_(n['Precio Anterior']) * num_(n['Volumen Anual']));
  const varNeg = ratio_(sum_(negs, n => (num_(n['Precio Negociado']) - num_(n['Precio Anterior'])) * num_(n['Volumen Anual'])), baseNeg);
  kpis.push(kpi_('ahorro', 'Ahorro tras negociación', readTable_('NEGOCIACIONES').length ? ahorro : null, cfg.META_AHORRO, 'money', true,
    `${negs.length} negociaciones · variación ponderada ${fmtPct_(varNeg)}`));

  /* 4. Costo bodega de rechazos */
  const rechazos = readTable_('RECHAZOS');
  const rechPeriodo = rechazos.filter(r => enPeriodo(r.Fecha));
  const costoRech = sum_(rechPeriodo, r => num_(r.Cantidad) * num_(r['Costo Unitario']));
  const rechAbiertos = rechazos
    .filter(r => r.Estado === 'Abierto' || r.Estado === 'Notificado')
    .map(r => ({ id: r.ID, proveedor: r.Proveedor, codigo: r['Código'], costo: num_(r.Cantidad) * num_(r['Costo Unitario']), estado: r.Estado, dias: toDate_(r.Fecha) ? daysBetween_(toDate_(r.Fecha), hoy) : 0 }))
    .sort((a, b) => b.dias - a.dias);
  kpis.push(kpi_('rechazos', 'Costo bodega de rechazos', rechazos.length ? costoRech : null, cfg.META_COSTO_RECHAZOS, 'money', false,
    `${rechPeriodo.length} rechazos en el mes · ${rechAbiertos.length} sin cerrar (${fmtMoney_(sum_(rechAbiertos, r => r.costo))})`));

  /* 5. Cumplimiento de pagos a proveedores */
  const pagos = readTable_('PAGOS');
  const exigibles = pagos.filter(p => enPeriodo(p['Fecha Vencimiento']) && toDate_(p['Fecha Vencimiento']) <= hoy);
  const aTiempo = exigibles.filter(p => evalPago_(p['Fecha Vencimiento'], p['Fecha Pago'], hoy).estado === 'Pagada a tiempo').length;
  const pagosCriticos = pagos
    .map(p => ({ factura: p.Factura, proveedor: p.Proveedor, valor: num_(p.Valor), vence: toDate_(p['Fecha Vencimiento']), ...evalPago_(p['Fecha Vencimiento'], p['Fecha Pago'], hoy) }))
    .filter(p => p.estado === 'Vencida' || (p.estado === 'Por vencer' && p.vence && daysBetween_(hoy, p.vence) <= num_(cfg.PAGOS_DIAS_ALERTA)))
    .sort((a, b) => b.mora - a.mora)
    .map(p => ({ ...p, vence: fmtDate_(p.vence) }));
  const carteraVencida = sum_(pagosCriticos.filter(p => p.estado === 'Vencida'), p => p.valor);
  kpis.push(kpi_('pagos', 'Cumplimiento de pagos a proveedores', ratio_(aTiempo, exigibles.length), cfg.META_PAGOS, 'pct', true,
    `${aTiempo} de ${exigibles.length} facturas a tiempo · cartera vencida ${fmtMoney_(carteraVencida)}`));

  /* 6. OTIF por proveedor */
  const entregas = readTable_('ENTREGAS').filter(e => enPeriodo(e['Fecha Pactada']) && toDate_(e['Fecha Real']));
  const porProv = {};
  entregas.forEach(e => {
    const r = evalEntrega_(e['Cantidad Pedida'], e['Cantidad Recibida'], e['Fecha Pactada'], e['Fecha Real']);
    const p = porProv[e.Proveedor] = porProv[e.Proveedor] || { proveedor: e.Proveedor, entregas: 0, aTiempo: 0, completas: 0, otif: 0 };
    p.entregas++;
    if (r.aTiempo === 'Sí') p.aTiempo++;
    if (r.completa === 'Sí') p.completas++;
    if (r.otif === 'Sí') p.otif++;
  });
  const otifProveedores = Object.values(porProv)
    .map(p => ({ ...p, pct: p.otif / p.entregas }))
    .sort((a, b) => a.pct - b.pct);
  const otifTotal = sum_(otifProveedores, p => p.otif);
  kpis.push(kpi_('otif', 'OTIF proveedores', ratio_(otifTotal, entregas.length), cfg.META_OTIF, 'pct', true,
    `${otifTotal} de ${entregas.length} entregas completas y a tiempo`));

  /* 7. Variación de precios listado Pareto (precio medio ponderado de OC vs mes anterior) */
  const pareto = {};
  readTable_('PRODUCTOS').filter(p => p.Pareto === 'Sí').forEach(p => { pareto[p['Código']] = p.Producto; });
  const prev = prevPeriodo_(periodo);
  const precios = {};
  readTable_('ORDENES').forEach(o => {
    const d = toDate_(o.Fecha);
    if (!d || o.Estado === 'Cancelada' || !(o['Código'] in pareto)) return;
    const per = periodOf_(d);
    if (per !== periodo && per !== prev) return;
    const k = precios[o['Código']] = precios[o['Código']] || { [periodo]: { q: 0, v: 0 }, [prev]: { q: 0, v: 0 } };
    k[per].q += num_(o.Cantidad);
    k[per].v += num_(o.Cantidad) * num_(o['Precio Unitario']);
  });
  const variaciones = Object.keys(precios)
    .filter(c => precios[c][periodo].q && precios[c][prev].q)
    .map(c => {
      const actual = precios[c][periodo].v / precios[c][periodo].q;
      const anterior = precios[c][prev].v / precios[c][prev].q;
      return { codigo: c, producto: pareto[c], anterior, actual, variacion: (actual - anterior) / anterior, gasto: precios[c][periodo].v };
    })
    .sort((a, b) => b.variacion - a.variacion);
  const gastoPareto = sum_(variaciones, v => v.gasto);
  const varPareto = ratio_(sum_(variaciones, v => v.variacion * v.gasto), gastoPareto);
  const umbral = num_(cfg.UMBRAL_VARIACION_PRECIO);
  const alertasPrecios = variaciones.filter(v => v.variacion > umbral);
  kpis.push(kpi_('precios_pareto', 'Variación de precios Pareto', varPareto, cfg.META_VAR_PRECIOS, 'pct', false,
    `${variaciones.length} productos comparados vs ${prev} · ${alertasPrecios.length} sobre umbral ${fmtPct_(umbral)}`));

  return {
    periodo,
    generado: Utilities.formatDate(new Date(), APP.TZ, 'dd/MM/yyyy HH:mm'),
    kpis,
    otifProveedores,
    variaciones,
    alertasPrecios,
    proyVencidos,
    proyectosEstado,
    rechAbiertos,
    pagosCriticos,
  };
}

/** Construye un indicador con semáforo: verde cumple, amarillo a ≤10% de la meta, rojo fuera. */
function kpi_(id, nombre, valor, meta, formato, mayorEsMejor, detalle) {
  meta = meta === '' || meta === null || meta === undefined ? null : num_(meta);
  let semaforo = 'gris';
  if (valor !== null && meta !== null) {
    const cumple = mayorEsMejor ? valor >= meta : valor <= meta;
    const cerca = mayorEsMejor ? valor >= meta * 0.9 : valor <= meta * 1.1;
    semaforo = cumple ? 'verde' : cerca ? 'amarillo' : 'rojo';
  }
  const fmt = v => (v === null ? '—' : formato === 'money' ? fmtMoney_(v) : fmtPct_(v));
  return {
    id, nombre, valor, meta, formato, mayorEsMejor, detalle, semaforo,
    valorTxt: fmt(valor),
    metaTxt: meta === null ? '—' : (mayorEsMejor ? '≥ ' : '≤ ') + fmt(meta),
  };
}

/** Recalcula, pinta la hoja Dashboard y guarda el histórico del periodo. */
function actualizarDashboard(periodo) {
  CONFIG_CACHE_ = null;
  recalcularColumnas_();
  const data = calcularIndicadores(periodo);
  pintarDashboard_(data);
  guardarHistorico_(data);
  return data;
}

function actualizarDashboardMenu() {
  const data = actualizarDashboard();
  ss_().setActiveSheet(sheet_('DASHBOARD'));
  ss_().toast(`Indicadores ${data.periodo} actualizados`, APP.NAME, 4);
}

const COLORES_SEMAFORO = { verde: '#d9f2dd', amarillo: '#fff4c2', rojo: '#fbd5d5', gris: '#eeeeee' };

function pintarDashboard_(data) {
  const sh = sheet_('DASHBOARD');
  sh.clear();
  sh.getRange('A1').setValue('GESTIÓN DE COMPRAS · DIRECCIÓN').setFontSize(16).setFontWeight('bold').setFontColor('#c8102e');
  sh.getRange('A2').setValue(`Periodo ${data.periodo} · actualizado ${data.generado}`).setFontColor('#666666');

  const rows = [['Indicador', 'Resultado', 'Meta', 'Semáforo', 'Detalle']]
    .concat(data.kpis.map(k => [k.nombre, k.valorTxt, k.metaTxt, k.semaforo.toUpperCase(), k.detalle]));
  sh.getRange(4, 1, rows.length, 5).setValues(rows);
  sh.getRange(4, 1, 1, 5).setFontWeight('bold').setFontColor('#ffffff').setBackground('#c8102e');
  data.kpis.forEach((k, i) => sh.getRange(5 + i, 1, 1, 5).setBackground(COLORES_SEMAFORO[k.semaforo]));

  let r = 6 + rows.length;
  r = bloque_(sh, r, 'OTIF por proveedor', ['Proveedor', 'Entregas', 'A tiempo', 'Completas', 'OTIF %'],
    data.otifProveedores.map(p => [p.proveedor, p.entregas, p.aTiempo, p.completas, fmtPct_(p.pct)]));
  r = bloque_(sh, r, 'Precios Pareto vs mes anterior', ['Código', 'Producto', 'Precio anterior', 'Precio actual', 'Variación'],
    data.variaciones.map(v => [v.codigo, v.producto, fmtMoney_(v.anterior), fmtMoney_(v.actual), fmtPct_(v.variacion)]));
  r = bloque_(sh, r, 'Pagos críticos (vencidos / por vencer)', ['Factura', 'Proveedor', 'Valor', 'Vence', 'Estado / mora'],
    data.pagosCriticos.map(p => [p.factura, p.proveedor, fmtMoney_(p.valor), p.vence, `${p.estado}${p.mora ? ' · ' + p.mora + ' d' : ''}`]));
  r = bloque_(sh, r, 'Rechazos sin cerrar', ['ID', 'Proveedor', 'Código', 'Costo', 'Estado / días'],
    data.rechAbiertos.map(x => [x.id, x.proveedor, x.codigo, fmtMoney_(x.costo), `${x.estado} · ${x.dias} d`]));
  bloque_(sh, r, 'Proyectos vencidos', ['ID', 'Proyecto', 'Compromiso', 'Avance', ''],
    data.proyVencidos.map(p => [p.id, p.proyecto, p.compromiso, fmtPct_(p.avance), '']));

  sh.setColumnWidth(1, 300).setColumnWidth(2, 200).setColumnWidth(3, 140).setColumnWidth(4, 140).setColumnWidth(5, 520);
}

function bloque_(sh, r, titulo, headers, rows) {
  sh.getRange(r, 1).setValue(titulo).setFontWeight('bold').setFontColor('#2e7d32');
  sh.getRange(r + 1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f1f1f1');
  if (rows.length) sh.getRange(r + 2, 1, rows.length, headers.length).setValues(rows);
  else sh.getRange(r + 2, 1).setValue('Sin registros').setFontColor('#999999');
  return r + 3 + Math.max(rows.length, 1);
}

/** Upsert por (Periodo, Indicador): alimenta Looker Studio y la tendencia. */
function guardarHistorico_(data) {
  const sh = sheet_('HISTORICO');
  const existentes = readTable_('HISTORICO');
  const ahora = new Date();
  const nuevos = [];
  data.kpis.forEach(k => {
    const fila = [data.periodo, k.nombre, k.valor === null ? '' : k.valor, k.meta === null ? '' : k.meta, k.semaforo, ahora];
    const ex = existentes.find(e => normPeriodo_(e.Periodo) === data.periodo && e.Indicador === k.nombre);
    if (ex) sh.getRange(ex._row, 1, 1, fila.length).setValues([fila]);
    else nuevos.push(fila);
  });
  if (nuevos.length) sh.getRange(sh.getLastRow() + 1, 1, nuevos.length, nuevos[0].length).setValues(nuevos);
  invalidate_('HISTORICO');
}

/** Serie de los últimos n periodos por indicador (para las tendencias del dashboard). */
function tendencia_(periodo, n) {
  const periodos = [periodo];
  while (periodos.length < n) periodos.unshift(prevPeriodo_(periodos[0]));
  const serie = {};
  periodos.forEach(p => {
    calcularIndicadores(p).kpis.forEach(k => {
      (serie[k.id] = serie[k.id] || []).push({ periodo: p, valor: k.valor, meta: k.meta, extra: k.extra || null });
    });
  });
  return { periodos, serie };
}
