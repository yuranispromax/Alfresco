/**
 * GESTIÓN DE COMPRAS · ALFRESCO — todo el código en un solo archivo.
 * Pega este contenido en Código.gs (reemplaza todo lo que haya).
 */

/* ======================= Config ======================= */

/**
 * Gestión de Compras · Alfresco
 * Esquema de datos, catálogos y parámetros por defecto.
 */

const APP = {
  NAME: 'Gestión de Compras · Alfresco',
  TZ: 'America/Bogota',
  DRIVE_ROOT: 'Gestión de Compras Alfresco',
  DRIVE_EVIDENCIAS: 'Evidencias Rechazos',
};

const LISTAS = {
  ESTADO_PROYECTO: ['Pendiente', 'En curso', 'Concluido', 'Cancelado'],
  TIPO_PROYECTO: ['Nuevo desarrollo', 'Cambio MP', 'Cambio ME', 'Transición'],
  CATEGORIA: ['MP', 'ME'],
  SI_NO: ['Sí', 'No'],
  ESTADO_PRODUCTO: ['Activo', 'Inactivo'],
  TIPO_PROVEEDOR: ['Principal', 'Alterno'],
  ESTADO_PROVEEDOR: ['Activo', 'Inactivo', 'Bloqueado'],
  ESTADO_OC: ['Abierta', 'Recibida parcial', 'Recibida', 'Cancelada'],
  ESTADO_RECHAZO: ['Abierto', 'Notificado', 'Devuelto', 'Cerrado'],
  MOTIVO_RECHAZO: ['Calidad', 'Especificación', 'Empaque dañado', 'Vencimiento', 'Documentación', 'Cantidad', 'Otro'],
};

/** Cada hoja: nombre visible, encabezados y listas desplegables por columna. */
const SHEETS = {
  CONFIG: {
    name: 'Config',
    headers: ['Parámetro', 'Valor', 'Descripción'],
  },
  PROYECTOS: {
    name: 'Proyectos',
    headers: ['ID', 'Proyecto', 'Tipo', 'Categoría', 'Responsable', 'Fecha Inicio', 'Fecha Compromiso', 'Fecha Cierre', 'Estado', 'Avance %', 'Observaciones'],
    lists: { 'Tipo': LISTAS.TIPO_PROYECTO, 'Categoría': LISTAS.CATEGORIA, 'Estado': LISTAS.ESTADO_PROYECTO },
  },
  PRODUCTOS: {
    name: 'Productos',
    headers: ['Código', 'Producto', 'Categoría', 'Unidad', 'Pareto', 'Estado', 'Precio Base', 'Rotación Días', 'Stock', 'Proveedor Principal', 'Proveedor Alterno'],
    lists: { 'Categoría': LISTAS.CATEGORIA, 'Pareto': LISTAS.SI_NO, 'Estado': LISTAS.ESTADO_PRODUCTO },
  },
  PROVEEDORES: {
    name: 'Proveedores',
    headers: ['NIT', 'Proveedor', 'Categoría', 'Tipo', 'Email', 'Contacto', 'Estado', 'Paro Entregas', 'Última Licitación', 'Próxima Licitación'],
    lists: { 'Categoría': LISTAS.CATEGORIA, 'Tipo': LISTAS.TIPO_PROVEEDOR, 'Estado': LISTAS.ESTADO_PROVEEDOR, 'Paro Entregas': LISTAS.SI_NO },
  },
  ORDENES: {
    name: 'Ordenes Compra',
    headers: ['OC', 'Fecha', 'Proveedor', 'Código', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Fecha Entrega Pactada', 'Estado'],
    lists: { 'Estado': LISTAS.ESTADO_OC },
  },
  PRESUPUESTO: {
    name: 'Presupuesto',
    headers: ['Periodo', 'Categoría', 'Presupuesto'],
    lists: { 'Categoría': LISTAS.CATEGORIA },
  },
  VENTAS: {
    name: 'Ventas',
    headers: ['Periodo', 'Ventas'],
  },
  NEGOCIACIONES: {
    name: 'Negociaciones',
    headers: ['Fecha', 'Proveedor', 'Código', 'Precio Anterior', 'Precio Ofertado', 'Precio Negociado', 'Volumen Anual', 'Ahorro', 'Variación %', 'Observaciones'],
  },
  ENTREGAS: {
    name: 'Entregas',
    headers: ['OC', 'Proveedor', 'Código', 'Cantidad Pedida', 'Cantidad Recibida', 'Fecha Pactada', 'Fecha Real', 'A Tiempo', 'Completa', 'OTIF', 'Registrado Por'],
  },
  RECHAZOS: {
    name: 'Rechazos',
    headers: ['ID', 'Fecha', 'Proveedor', 'Código', 'Lote', 'Cantidad', 'Costo Unitario', 'Costo Total', 'Motivo', 'Descripción NC', 'Estado', 'Fecha Notificación', 'Fecha Cierre', 'Evidencia', 'Registrado Por'],
    lists: { 'Motivo': LISTAS.MOTIVO_RECHAZO, 'Estado': LISTAS.ESTADO_RECHAZO },
  },
  PAGOS: {
    name: 'Pagos',
    headers: ['Factura', 'Proveedor', 'Fecha Factura', 'Fecha Vencimiento', 'Valor', 'Fecha Pago', 'Días Mora', 'Estado'],
  },
  COMUNICACIONES: {
    name: 'Comunicaciones',
    headers: ['Fecha', 'Tipo', 'Proveedor', 'Email', 'Asunto', 'Referencia'],
  },
  CARGAS: {
    name: 'Cargas',
    headers: ['Fecha', 'Módulo', 'Tabla', 'Archivo', 'Filas', 'Modo', 'Usuario', 'Drive'],
  },
  HISTORICO: {
    name: 'KPI Historico',
    headers: ['Periodo', 'Indicador', 'Valor', 'Meta', 'Semáforo', 'Actualizado'],
  },
  DASHBOARD: {
    name: 'Dashboard',
    headers: [],
  },
};

/** Parámetros editables desde la hoja Config. */
const DEFAULT_CONFIG = [
  ['EMAIL_RESPONSABLE', '', 'Correo que recibe la alerta diaria (vacío = propietario del archivo)'],
  ['EMPRESA', 'Alfresco', 'Nombre usado en comunicados'],
  ['OTIF_TOLERANCIA_DIAS', 0, 'Días de tolerancia para considerar una entrega "a tiempo"'],
  ['OTIF_TOLERANCIA_CANTIDAD', 0.02, 'Faltante tolerado para considerar una entrega "completa" (0,02 = 2%)'],
  ['PAGOS_DIAS_ALERTA', 5, 'Avisar facturas que vencen en los próximos N días'],
  ['RECHAZO_DIAS_ALERTA', 8, 'Avisar rechazos abiertos con más de N días'],
  ['UMBRAL_VARIACION_PRECIO', 0.05, 'Alerta si un producto Pareto sube más de este % vs mes anterior'],
  ['META_PROYECTOS', 0.9, 'Meta % proyectos concluidos'],
  ['META_COMPRAS_VENTAS', 0.45, 'Máximo % participación Compras / Ventas'],
  ['META_AHORRO', 5000000, 'Ahorro mensual esperado por negociación ($)'],
  ['META_COSTO_RECHAZOS', 2000000, 'Costo máximo mensual de bodega de rechazos ($)'],
  ['META_PAGOS', 0.95, 'Meta % facturas pagadas a tiempo'],
  ['META_OTIF', 0.95, 'Meta % OTIF proveedores'],
  ['META_VAR_PRECIOS', 0.03, 'Variación máxima ponderada de precios Pareto'],
  ['CARPETA_DRIVE_ID', '', 'Se llena automáticamente al inicializar'],
  ['CARPETA_EVIDENCIAS_ID', '', 'Se llena automáticamente al inicializar'],
];

/** Módulos del dashboard = iniciativas de la diapositiva de Dirección de Compras. */
const MODULOS = [
  {
    id: 'proyectos', titulo: 'Proyectos nuevos',
    iniciativa: 'Matriz de seguimiento y control para nuevos desarrollos y cambios o transiciones en materias primas o materiales de empaque.',
    tablas: ['PROYECTOS'],
  },
  {
    id: 'compras_ventas', titulo: 'Compras, rotación y presupuesto',
    iniciativa: 'Conectar órdenes de compra, rotación real, activación e inactivación de productos y aprovisionamiento con el presupuesto. Construcción del ppto de compras.',
    tablas: ['ORDENES', 'VENTAS', 'PRESUPUESTO', 'PRODUCTOS'],
  },
  {
    id: 'ahorro', titulo: 'Licitación anual y negociación',
    iniciativa: 'Licitación anual de proveedores MP y ME del Pareto de ventas. Ampliación de portafolio y proveeduría alterna obligatoria.',
    tablas: ['NEGOCIACIONES', 'PROVEEDORES'],
  },
  {
    id: 'rechazos', titulo: 'Bodega de rechazos',
    iniciativa: 'Gestión de bodega de rechazos, verificación de rechazos y no conformidades, estandarización, comunicación y retroalimentación al proveedor.',
    tablas: ['RECHAZOS'],
  },
  {
    id: 'pagos', titulo: 'Cumplimiento de pagos',
    iniciativa: 'Indicador de cumplimiento de pagos al proveedor y verificación de cartera para evitar paro de entregas; comunicado sobre afectación al NS.',
    tablas: ['PAGOS'],
  },
  {
    id: 'otif', titulo: 'OTIF proveedores',
    iniciativa: 'Implementación de OTIF a proveedores: entregas completas y a tiempo.',
    tablas: ['ENTREGAS', 'ORDENES'],
  },
  {
    id: 'precios_pareto', titulo: 'Precios listado Pareto',
    iniciativa: 'Control y seguimiento a la variación de precios del listado Pareto.',
    tablas: ['ORDENES', 'PRODUCTOS'],
  },
];

/** Columnas mínimas para aceptar un archivo adjunto en cada tabla. */
const REQUERIDOS = {
  PROYECTOS: ['Proyecto', 'Estado'],
  PRODUCTOS: ['Código', 'Producto'],
  PROVEEDORES: ['Proveedor'],
  ORDENES: ['OC', 'Fecha', 'Código', 'Cantidad', 'Precio Unitario'],
  PRESUPUESTO: ['Periodo', 'Presupuesto'],
  VENTAS: ['Periodo', 'Ventas'],
  NEGOCIACIONES: ['Fecha', 'Precio Anterior', 'Precio Negociado'],
  ENTREGAS: ['Proveedor', 'Cantidad Pedida', 'Cantidad Recibida', 'Fecha Pactada', 'Fecha Real'],
  RECHAZOS: ['Fecha', 'Proveedor', 'Cantidad'],
  PAGOS: ['Factura', 'Proveedor', 'Fecha Vencimiento', 'Valor'],
};

/** Sinónimos frecuentes en reportes del ERP → columna del sistema. */
const ALIAS = {
  'OC': ['orden', 'ordencompra', 'ordendecompra', 'nooc', 'numerooc', 'numorden', 'po'],
  'Código': ['codigo', 'cod', 'sku', 'referencia', 'ref', 'item', 'codigoproducto', 'material'],
  'Producto': ['descripcion', 'nombreproducto', 'nombre', 'articulo'],
  'Proveedor': ['razonsocial', 'nombreproveedor', 'tercero', 'vendor'],
  'Cantidad': ['cant', 'unidades', 'qty'],
  'Precio Unitario': ['precio', 'valorunitario', 'costounitario', 'vrunitario', 'preciounit'],
  'Valor': ['monto', 'total', 'valorfactura', 'saldo', 'importe'],
  'Factura': ['nofactura', 'numerofactura', 'documento', 'factura'],
  'Fecha Vencimiento': ['vencimiento', 'fechavto', 'vence'],
  'Fecha Pago': ['pago', 'fechadepago', 'pagado'],
  'Fecha Pactada': ['fechacompromiso', 'fechaentregapactada', 'fechaprogramada'],
  'Fecha Real': ['fecharecepcion', 'fecharecibo', 'fechaentrega', 'fecharecibido'],
  'Cantidad Pedida': ['cantpedida', 'pedida', 'cantidadsolicitada', 'cantidadoc'],
  'Cantidad Recibida': ['cantrecibida', 'recibida', 'cantidadentregada'],
  'Ventas': ['venta', 'ventasnetas', 'ingresos'],
  'Periodo': ['mes', 'periodo', 'fechaperiodo'],
};

/* ======================= Utils ======================= */

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

/* ======================= Operaciones ======================= */

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
    invalidate_(key);
  });
}

/* ======================= Indicadores ======================= */

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

/* ======================= Importar ======================= */

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

/* ======================= Alertas ======================= */

/** Alertas por correo, retroalimentación de rechazos y comunicado de Paro de Entregas. */

/** Disparador diario: recalcula y envía un resumen solo si hay algo que atender. */
function revisionDiaria() {
  const data = actualizarDashboard();
  const cfg = getConfig_();
  const destino = cfg.EMAIL_RESPONSABLE || Session.getEffectiveUser().getEmail();
  const diasRech = num_(cfg.RECHAZO_DIAS_ALERTA);
  const rechViejos = data.rechAbiertos.filter(r => r.dias > diasRech);
  const rojos = data.kpis.filter(k => k.semaforo === 'rojo');

  const secciones = [
    tablaHtml_('🚦 Indicadores en rojo', ['Indicador', 'Resultado', 'Meta'], rojos.map(k => [k.nombre, k.valorTxt, k.metaTxt])),
    tablaHtml_('💸 Pagos vencidos / por vencer (riesgo de paro de entregas)', ['Factura', 'Proveedor', 'Valor', 'Vence', 'Estado'],
      data.pagosCriticos.map(p => [p.factura, p.proveedor, fmtMoney_(p.valor), p.vence, `${p.estado}${p.mora ? ' (' + p.mora + ' d)' : ''}`])),
    tablaHtml_(`📦 Rechazos abiertos > ${diasRech} días`, ['ID', 'Proveedor', 'Costo', 'Estado', 'Días'],
      rechViejos.map(r => [r.id, r.proveedor, fmtMoney_(r.costo), r.estado, r.dias])),
    tablaHtml_('📈 Alzas de precio Pareto sobre umbral', ['Código', 'Producto', 'Anterior', 'Actual', 'Variación'],
      data.alertasPrecios.map(v => [v.codigo, v.producto, fmtMoney_(v.anterior), fmtMoney_(v.actual), fmtPct_(v.variacion)])),
    tablaHtml_('🗂️ Proyectos vencidos', ['ID', 'Proyecto', 'Compromiso', 'Avance'],
      data.proyVencidos.map(p => [p.id, p.proyecto, p.compromiso, fmtPct_(p.avance)])),
  ].filter(Boolean);

  if (!secciones.length) return;
  const html = `<div style="font-family:Nourd,Outfit,Arial,sans-serif;color:#222">
    <h2 style="color:#c8102e;margin:0">Gestión de Compras · alerta diaria</h2>
    <p style="color:#666">Periodo ${data.periodo} · ${data.generado} · <a href="${ss_().getUrl()}">Abrir hoja</a></p>
    ${secciones.join('')}</div>`;
  MailApp.sendEmail({ to: destino, subject: `[Compras] ${rojos.length} indicadores en rojo · ${data.pagosCriticos.length} pagos críticos`, htmlBody: html, name: APP.NAME });
}

function tablaHtml_(titulo, headers, rows) {
  if (!rows.length) return '';
  const th = headers.map(h => `<th style="background:#c8102e;color:#fff;padding:6px;text-align:left">${escapeHtml_(h)}</th>`).join('');
  const tr = rows.map(r => `<tr>${r.map(c => `<td style="border-bottom:1px solid #eee;padding:6px">${escapeHtml_(c)}</td>`).join('')}</tr>`).join('');
  return `<h3 style="margin:18px 0 6px">${titulo}</h3><table style="border-collapse:collapse;font-size:13px">${'<tr>' + th + '</tr>' + tr}</table>`;
}

function emailsProveedores_() {
  const map = {};
  readTable_('PROVEEDORES').forEach(p => { map[p.Proveedor] = p; });
  return map;
}

function registrarComunicacion_(tipo, proveedor, email, asunto, referencia) {
  appendRows_('COMUNICACIONES', [{ Fecha: new Date(), Tipo: tipo, Proveedor: proveedor, Email: email, Asunto: asunto, Referencia: referencia }]);
}

/**
 * Retroalimentación al proveedor: envía cada rechazo "Abierto" sin notificar,
 * con la evidencia de Drive, y lo pasa a "Notificado".
 */
function notificarRechazos() {
  const cfg = getConfig_();
  const provs = emailsProveedores_();
  const pendientes = readTable_('RECHAZOS').filter(r => r.Estado === 'Abierto' && !r['Fecha Notificación']);
  const omitidos = [];
  let enviados = 0;
  pendientes.forEach(r => {
    const prov = provs[r.Proveedor];
    if (!prov || !prov.Email) { omitidos.push(`${r.ID} (${r.Proveedor} sin email)`); return; }
    const asunto = `${cfg.EMPRESA} · No conformidad ${r.ID} · ${r['Código']} lote ${r.Lote}`;
    const html = `<div style="font-family:Nourd,Outfit,Arial,sans-serif">
      <p>Estimado(a) ${escapeHtml_(prov.Contacto || r.Proveedor)}:</p>
      <p>En la inspección de recibo se generó el siguiente rechazo, que se encuentra en nuestra bodega de rechazos:</p>
      <table style="border-collapse:collapse;font-size:13px">
        ${[['Rechazo', r.ID], ['Fecha', fmtDate_(toDate_(r.Fecha))], ['Material', r['Código']], ['Lote', r.Lote],
           ['Cantidad', r.Cantidad], ['Valor', fmtMoney_(num_(r.Cantidad) * num_(r['Costo Unitario']))],
           ['Motivo', r.Motivo], ['Descripción', r['Descripción NC']]]
          .map(([k, v]) => `<tr><td style="padding:4px 10px;background:#f5f5f5"><b>${k}</b></td><td style="padding:4px 10px">${escapeHtml_(v)}</td></tr>`).join('')}
      </table>
      ${r.Evidencia ? `<p>Evidencia: <a href="${r.Evidencia}">ver en Drive</a></p>` : ''}
      <p>Solicitamos: (1) análisis de causa raíz y plan de acción en máximo 5 días hábiles y
      (2) coordinar el retiro o reposición del material.</p>
      <p>Cordialmente,<br>Dirección de Compras · ${escapeHtml_(cfg.EMPRESA)}</p></div>`;
    MailApp.sendEmail({ to: prov.Email, subject: asunto, htmlBody: html, name: `Compras ${cfg.EMPRESA}` });
    setCell_('RECHAZOS', r._row, 'Estado', 'Notificado');
    setCell_('RECHAZOS', r._row, 'Fecha Notificación', new Date());
    registrarComunicacion_('Rechazo', r.Proveedor, prov.Email, asunto, r.ID);
    if (r.Evidencia) compartirEvidencia_(r.Evidencia, prov.Email);
    enviados++;
  });
  return { enviados, omitidos };
}

function compartirEvidencia_(url, email) {
  const m = String(url).match(/[-\w]{25,}/);
  if (!m) return;
  try { DriveApp.getFileById(m[0]).addViewer(email); } catch (e) { /* cuenta sin Google o sin permiso */ }
}

function notificarRechazosMenu() {
  const { enviados, omitidos } = notificarRechazos();
  SpreadsheetApp.getUi().alert(`Rechazos notificados: ${enviados}` + (omitidos.length ? `\nOmitidos: ${omitidos.join(', ')}` : ''));
}

/**
 * Comunicado formal a proveedores marcados con "Paro Entregas = Sí":
 * estado de cartera y afectación al Nivel de Servicio (NS).
 */
function enviarComunicadoNS() {
  const cfg = getConfig_();
  const hoy = startOfDay_(new Date());
  const cartera = {};
  readTable_('PAGOS').forEach(p => {
    const e = evalPago_(p['Fecha Vencimiento'], p['Fecha Pago'], hoy);
    if (e.estado !== 'Vencida') return;
    const c = cartera[p.Proveedor] = cartera[p.Proveedor] || { valor: 0, facturas: [] };
    c.valor += num_(p.Valor);
    c.facturas.push(p.Factura);
  });

  const destinatarios = readTable_('PROVEEDORES').filter(p => p['Paro Entregas'] === 'Sí' && p.Email && p.Estado !== 'Inactivo');
  destinatarios.forEach(p => {
    const c = cartera[p.Proveedor];
    const asunto = `${cfg.EMPRESA} · Continuidad de abastecimiento y nivel de servicio`;
    const html = `<div style="font-family:Nourd,Outfit,Arial,sans-serif">
      <p>Estimado(a) ${escapeHtml_(p.Contacto || p.Proveedor)}:</p>
      <p>Hemos sido informados de la suspensión de entregas a ${escapeHtml_(cfg.EMPRESA)}.
      Nuestro compromiso es mantener al día los pagos a nuestros aliados:
      ${c ? `a la fecha registramos <b>${c.facturas.length} factura(s) vencida(s) por ${fmtMoney_(c.valor)}</b> (${escapeHtml_(c.facturas.join(', '))}), que se encuentran priorizadas en la programación de pagos.`
          : 'según nuestros registros, su cartera se encuentra al día.'}</p>
      <p>Les recordamos que la interrupción de entregas afecta directamente el <b>Nivel de Servicio (NS)</b> a nuestros clientes
      y es un criterio de la evaluación de proveedores, del indicador OTIF y de la próxima licitación anual.
      Si la suspensión persiste, activaremos la proveeduría alterna para los materiales afectados.</p>
      <p>Solicitamos restablecer las entregas programadas y, ante cualquier diferencia de cartera, escribir a este correo para conciliarla.</p>
      <p>Cordialmente,<br>Dirección de Compras · ${escapeHtml_(cfg.EMPRESA)}</p></div>`;
    MailApp.sendEmail({ to: p.Email, subject: asunto, htmlBody: html, name: `Compras ${cfg.EMPRESA}` });
    registrarComunicacion_('Comunicado NS', p.Proveedor, p.Email, asunto, c ? c.facturas.join(', ') : 'cartera al día');
  });
  return destinatarios.length;
}

function enviarComunicadoNSMenu() {
  const ui = SpreadsheetApp.getUi();
  const n = readTable_('PROVEEDORES').filter(p => p['Paro Entregas'] === 'Sí' && p.Email && p.Estado !== 'Inactivo').length;
  if (!n) { ui.alert('No hay proveedores con "Paro Entregas = Sí" y email.'); return; }
  if (ui.alert('Comunicado NS', `Se enviará el comunicado a ${n} proveedor(es) con paro de entregas. ¿Enviar?`, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  ui.alert(`Comunicado enviado a ${enviarComunicadoNS()} proveedor(es). Registro en hoja Comunicaciones.`);
}

/* ======================= WebApp ======================= */

/** Dashboard web (diálogo en la hoja o Web App) y formularios de captura. */

function doGet() {
  return htmlDashboard_()
    .setTitle(APP.NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function abrirDashboard() {
  const html = htmlDashboard_().setWidth(1280).setHeight(820);
  SpreadsheetApp.getUi().showModalDialog(html, APP.NAME);
}

function htmlDashboard_() {
  return HtmlService.createTemplateFromFile('Dashboard').evaluate();
}

/** Tipografía Nourd: archivo HTML opcional "Fuentes" con los @font-face (no se versiona: fuente con licencia). */
function incluirFuentes_() {
  try { return HtmlService.createHtmlOutputFromFile('Fuentes').getContent(); } catch (e) { return ''; }
}

/** Todo lo que pinta el dashboard en una sola llamada. */
function getDashboardData(periodo) {
  const data = calcularIndicadores(periodo);
  const conteos = {};
  tablasCargables_().forEach(k => { conteos[k] = readTable_(k).length; });
  return Object.assign(data, {
    tendencia: tendencia_(data.periodo, 6),
    conteos,
    esquema: getEsquema(),
    cargas: getCargas().slice(0, 10),
  });
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

/* ======================= Setup ======================= */

/** Menú, creación de estructura, automatizaciones y datos demo. */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛒 Compras')
    .addItem('📊 Abrir dashboard', 'abrirDashboard')
    .addItem('🔄 Recalcular indicadores', 'actualizarDashboardMenu')
    .addSeparator()
    .addItem('✉️ Notificar rechazos a proveedores', 'notificarRechazosMenu')
    .addItem('📢 Enviar comunicado Paro de Entregas / NS', 'enviarComunicadoNSMenu')
    .addItem('📨 Enviar alerta diaria ahora', 'revisionDiaria')
    .addSeparator()
    .addItem('⚙️ Inicializar estructura', 'inicializar')
    .addItem('⏰ Activar automatizaciones', 'instalarTriggers')
    .addItem('🧪 Cargar datos demo', 'cargarDatosDemo')
    .addItem('🧹 Borrar todos los datos (dejar en blanco)', 'borrarDatos')
    .addToUi();
}

function inicializar() {
  const ss = ss_();
  Object.keys(SHEETS).forEach(key => {
    const def = SHEETS[key];
    let sh = ss.getSheetByName(def.name);
    if (!sh) sh = ss.insertSheet(def.name);
    if (!def.headers.length) return;
    const hdr = sh.getRange(1, 1, 1, def.headers.length);
    hdr.setValues([def.headers])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#c8102e')
      .setWrap(true).setVerticalAlignment('middle');
    sh.setFrozenRows(1);
    formatColumns_(sh, def);
  });

  // Parámetros por defecto (no sobreescribe los existentes)
  const existentes = readTable_('CONFIG').map(r => r['Parámetro']);
  appendRows_('CONFIG', DEFAULT_CONFIG
    .filter(([k]) => !existentes.includes(k))
    .map(([k, v, d]) => ({ 'Parámetro': k, 'Valor': v, 'Descripción': d })));
  CONFIG_CACHE_ = null;
  sheet_('CONFIG').setColumnWidth(1, 220).setColumnWidth(2, 160).setColumnWidth(3, 480);

  ensureDriveFolders_();

  const dash = ss.getSheetByName(SHEETS.DASHBOARD.name);
  ss.setActiveSheet(dash);
  ss.moveActiveSheet(1);
  const blank = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);

  SpreadsheetApp.getUi().alert('Estructura lista ✅\n\nSiguiente paso: 🛒 Compras › Activar automatizaciones.\nPara probar: 🛒 Compras › Cargar datos demo.');
}

function formatColumns_(sh, def) {
  const rows = Math.max(sh.getMaxRows() - 1, 1);
  def.headers.forEach((h, i) => {
    const rng = sh.getRange(2, i + 1, rows, 1);
    if (h === 'Periodo') rng.setNumberFormat('@');
    else if (/^Fecha|Licitación$|Actualizado/.test(h)) rng.setNumberFormat('dd/MM/yyyy');
    else if (/Precio|Costo|Valor$|^Total|Presupuesto|^Ventas|Ahorro/.test(h)) rng.setNumberFormat('$#,##0');
    else if (/%$/.test(h)) rng.setNumberFormat('0.0%');
    const list = def.lists && def.lists[h];
    if (list) {
      rng.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build());
    }
    sh.setColumnWidth(i + 1, Math.max(110, h.length * 9));
  });
}

function ensureDriveFolders_() {
  const cfg = getConfig_();
  let root = tryFolder_(cfg.CARPETA_DRIVE_ID);
  if (!root) {
    root = DriveApp.createFolder(APP.DRIVE_ROOT);
    // Deja la hoja dentro de la carpeta del sistema
    try { DriveApp.getFileById(ss_().getId()).moveTo(root); } catch (e) { /* sin permiso para mover */ }
    setConfig_('CARPETA_DRIVE_ID', root.getId());
  }
  if (!tryFolder_(getConfig_().CARPETA_EVIDENCIAS_ID)) {
    setConfig_('CARPETA_EVIDENCIAS_ID', root.createFolder(APP.DRIVE_EVIDENCIAS).getId());
  }
}

function tryFolder_(id) {
  if (!id) return null;
  try { return DriveApp.getFolderById(id); } catch (e) { return null; }
}

/**
 * Deja el sistema en blanco: borra las filas de todas las tablas (conserva encabezados,
 * listas desplegables, formatos y la hoja Config con metas y parámetros).
 */
function borrarDatos() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Borrar todos los datos',
    'Se borrarán TODOS los registros (proyectos, OC, ventas, pagos, rechazos, histórico…).\n' +
    'Se conservan encabezados, Config (metas) y archivos en Drive.\n\nEscribe BORRAR para confirmar:',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || r.getResponseText().trim().toUpperCase() !== 'BORRAR') {
    ui.alert('Cancelado. No se borró nada.');
    return;
  }
  Object.keys(SHEETS)
    .filter(k => k !== 'CONFIG' && k !== 'DASHBOARD')
    .forEach(k => {
      const sh = ss_().getSheetByName(SHEETS[k].name);
      if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, SHEETS[k].headers.length).clearContent();
      invalidate_(k);
    });
  actualizarDashboard();
  ui.alert('Listo 🧹 El dashboard quedó en blanco. Empieza a adjuntar información real desde 🛒 Compras › Abrir dashboard.');
}

/** Revisión diaria 7 a.m.: recalcula, guarda histórico y envía alertas. */
function instalarTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'revisionDiaria')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('revisionDiaria').timeBased().everyDays(1).atHour(7).inTimezone(APP.TZ).create();
  const activos = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'revisionDiaria').length;
  avisar_(activos
    ? 'Automatización activa ⏰\nCada día a las 7:00 a.m. se recalculan los indicadores y se envía la alerta de compras.\nVerifícalo en Apps Script › Activadores (revisionDiaria).'
    : 'No se pudo crear el activador. Créalo a mano en Apps Script › Activadores › Añadir activador › revisionDiaria.');
}

/** Alerta en la hoja si hay interfaz; si se ejecuta desde el editor, queda en el registro. */
function avisar_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

/* ------------------------------------------------------------------ */
/* Datos demo: 4 meses de operación para ver el sistema funcionando.  */
/* ------------------------------------------------------------------ */

function cargarDatosDemo() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Cargar datos demo', 'Se agregarán registros de ejemplo a todas las hojas. ¿Continuar?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const hoy = startOfDay_(new Date());
  const mesIni = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);

  const proveedores = [
    { NIT: '900100200', Proveedor: 'Aceites del Valle SAS', Categoría: 'MP', Tipo: 'Principal', Email: 'compras+aceites@example.com', Contacto: 'Laura Gómez', Estado: 'Activo', 'Paro Entregas': 'No' },
    { NIT: '900300400', Proveedor: 'Especias Andinas', Categoría: 'MP', Tipo: 'Principal', Email: 'compras+especias@example.com', Contacto: 'Andrés Ruiz', Estado: 'Activo', 'Paro Entregas': 'Sí' },
    { NIT: '900500600', Proveedor: 'Envases Colombia', Categoría: 'ME', Tipo: 'Principal', Email: 'compras+envases@example.com', Contacto: 'Marta Díaz', Estado: 'Activo', 'Paro Entregas': 'No' },
    { NIT: '900700800', Proveedor: 'Etiquetas Express', Categoría: 'ME', Tipo: 'Alterno', Email: 'compras+etiquetas@example.com', Contacto: 'Jorge Peña', Estado: 'Activo', 'Paro Entregas': 'No' },
  ];
  proveedores.forEach(p => {
    p['Última Licitación'] = new Date(hoy.getFullYear() - 1, 10, 15);
    p['Próxima Licitación'] = new Date(hoy.getFullYear(), 10, 15);
  });

  const productos = [
    ['MP-001', 'Aceite de soya', 'MP', 'kg', 'Sí', 7800, 'Aceites del Valle SAS', 'Especias Andinas'],
    ['MP-002', 'Vinagre blanco', 'MP', 'L', 'Sí', 3200, 'Aceites del Valle SAS', ''],
    ['MP-003', 'Mostaza en polvo', 'MP', 'kg', 'No', 15400, 'Especias Andinas', ''],
    ['MP-004', 'Pasta de tomate', 'MP', 'kg', 'Sí', 6100, 'Especias Andinas', 'Aceites del Valle SAS'],
    ['ME-001', 'Doypack 200 g', 'ME', 'und', 'Sí', 210, 'Envases Colombia', 'Etiquetas Express'],
    ['ME-002', 'Etiqueta frasco 500 g', 'ME', 'und', 'No', 45, 'Etiquetas Express', 'Envases Colombia'],
  ].map(([c, n, cat, u, par, pb, pp, pa]) => ({
    'Código': c, Producto: n, 'Categoría': cat, Unidad: u, Pareto: par, Estado: 'Activo',
    'Precio Base': pb, 'Rotación Días': Math.round(15 + rnd() * 30), Stock: Math.round(500 + rnd() * 5000),
    'Proveedor Principal': pp, 'Proveedor Alterno': pa,
  }));

  const ordenes = [], entregas = [], pagos = [], rechazos = [], negociaciones = [];
  let oc = 1000, fac = 5000, rech = 1;
  for (let m = 0; m < 4; m++) {
    const inflacion = 1 + m * 0.012;
    productos.forEach(p => {
      for (let k = 0; k < 2; k++) {
        const fecha = new Date(mesIni.getFullYear(), mesIni.getMonth() + m, 2 + Math.floor(rnd() * 25));
        if (fecha > hoy) continue;
        const cant = Math.round((p['Categoría'] === 'MP' ? 800 : 20000) * (0.6 + rnd()));
        const precio = Math.round(p['Precio Base'] * inflacion * (0.97 + rnd() * 0.08));
        const pactada = addDays_(fecha, 7);
        const num = 'OC-' + (++oc);
        const total = cant * precio;
        const realDias = rnd() < 0.8 ? 0 : Math.ceil(rnd() * 4);
        const real = addDays_(pactada, realDias);
        const recibida = rnd() < 0.9 ? cant : Math.round(cant * 0.85);
        const recibido = real <= hoy;
        ordenes.push({ OC: num, Fecha: fecha, Proveedor: p['Proveedor Principal'], 'Código': p['Código'], Producto: p.Producto, Cantidad: cant, 'Precio Unitario': precio, Total: total, 'Fecha Entrega Pactada': pactada, Estado: recibido ? (recibida < cant ? 'Recibida parcial' : 'Recibida') : 'Abierta' });
        if (recibido) {
          entregas.push(entregaRow_(num, p['Proveedor Principal'], p['Código'], cant, recibida, pactada, real, 'demo'));
          const venc = addDays_(real, 30);
          const pago = venc > hoy ? (rnd() < 0.2 ? addDays_(venc, -2) : '') : (rnd() < 0.75 ? addDays_(venc, -Math.floor(rnd() * 3)) : (rnd() < 0.5 ? addDays_(venc, 6) : ''));
          pagos.push(pagoRow_('F-' + (++fac), p['Proveedor Principal'], real, venc, total, pago && pago <= hoy ? pago : ''));
          if (rnd() < 0.3) {
            const cr = Math.round(cant * (0.02 + rnd() * 0.05));
            rechazos.push({ ID: 'RCH-' + ('000' + rech++).slice(-4), Fecha: real, Proveedor: p['Proveedor Principal'], 'Código': p['Código'], Lote: 'L' + Math.floor(rnd() * 90000 + 10000), Cantidad: cr, 'Costo Unitario': precio, 'Costo Total': cr * precio, Motivo: pick(LISTAS.MOTIVO_RECHAZO), 'Descripción NC': 'Hallazgo en inspección de recibo', Estado: m < 2 ? 'Cerrado' : 'Abierto', 'Registrado Por': 'demo' });
          }
        }
      }
      if (rnd() < 0.35) {
        const ant = Math.round(p['Precio Base'] * inflacion);
        const ofe = Math.round(ant * (1.04 + rnd() * 0.06));
        const neg = Math.round(ant * (0.98 + rnd() * 0.04));
        const vol = p['Categoría'] === 'MP' ? 18000 : 400000;
        negociaciones.push({ Fecha: new Date(mesIni.getFullYear(), mesIni.getMonth() + m, 10), Proveedor: p['Proveedor Principal'], 'Código': p['Código'], 'Precio Anterior': ant, 'Precio Ofertado': ofe, 'Precio Negociado': neg, 'Volumen Anual': vol, Ahorro: (ofe - neg) * vol / 12, 'Variación %': (neg - ant) / ant });
      }
    });
  }

  const ventas = [], presupuesto = [];
  for (let m = 0; m < 4; m++) {
    const per = periodOf_(new Date(mesIni.getFullYear(), mesIni.getMonth() + m, 1));
    ventas.push({ Periodo: per, Ventas: Math.round(180000000 + rnd() * 40000000) });
    presupuesto.push({ Periodo: per, 'Categoría': 'MP', Presupuesto: 60000000 });
    presupuesto.push({ Periodo: per, 'Categoría': 'ME', Presupuesto: 15000000 });
  }

  const proyectos = [
    ['Nuevo sabor salsa BBQ', 'Nuevo desarrollo', 'MP', 'Concluido', 1],
    ['Cambio proveedor mostaza', 'Cambio MP', 'MP', 'Concluido', 1],
    ['Doypack reciclable', 'Cambio ME', 'ME', 'En curso', 0.6],
    ['Transición etiqueta nueva norma', 'Transición', 'ME', 'En curso', 0.4],
    ['Mayonesa light', 'Nuevo desarrollo', 'MP', 'Pendiente', 0],
  ].map(([n, t, c, e, a], i) => ({
    ID: 'PRY-' + (i + 1), Proyecto: n, Tipo: t, 'Categoría': c, Responsable: 'Compras',
    'Fecha Inicio': addDays_(hoy, -120 + i * 15), 'Fecha Compromiso': addDays_(hoy, [-60, -20, 25, -10, 60][i]),
    'Fecha Cierre': e === 'Concluido' ? addDays_(hoy, [-62, -25][i]) : '', Estado: e, 'Avance %': a,
  }));

  appendRows_('PROVEEDORES', proveedores);
  appendRows_('PRODUCTOS', productos);
  appendRows_('ORDENES', ordenes);
  appendRows_('ENTREGAS', entregas);
  appendRows_('PAGOS', pagos);
  appendRows_('RECHAZOS', rechazos);
  appendRows_('NEGOCIACIONES', negociaciones);
  appendRows_('VENTAS', ventas);
  appendRows_('PRESUPUESTO', presupuesto);
  appendRows_('PROYECTOS', proyectos);

  actualizarDashboard();
  ui.alert('Datos demo cargados ✅ Abre 🛒 Compras › Abrir dashboard.');
}
