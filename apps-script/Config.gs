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
  ANALISIS: {
    name: 'Analisis',
    headers: ['Periodo', 'Indicador', 'Nombre', 'Análisis', 'Plan de Acción', 'Responsable', 'Fecha Compromiso', 'Autor', 'Actualizado'],
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
