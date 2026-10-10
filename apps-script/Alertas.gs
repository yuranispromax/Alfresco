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
  const html = `<div style="font-family:Arial,sans-serif;color:#222">
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
    const html = `<div style="font-family:Arial,sans-serif">
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
    const html = `<div style="font-family:Arial,sans-serif">
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
