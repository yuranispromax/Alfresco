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
