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
