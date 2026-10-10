# Gestión de Compras · Alfresco

Sistema de la **Dirección de Compras** montado sobre **Google Sheets + Apps Script + Drive + Gmail**, con costo cero. Mide los 7 indicadores, avisa por correo y deja trazabilidad de la comunicación con proveedores.

| # | Iniciativa | Indicador | Fuente (hoja) | Cálculo |
|---|---|---|---|---|
| 1 | Matriz de proyectos (nuevos desarrollos, cambios MP/ME) | Proyectos concluidos / Total | `Proyectos` | Concluidos ÷ (Total − Cancelados) · alerta de vencidos |
| 2 | OC, rotación, activación/inactivación y presupuesto | Participación Compras / Ventas | `Ordenes Compra`, `Ventas`, `Presupuesto`, `Productos` | Σ OC del mes ÷ Ventas del mes · + ejecución de presupuesto |
| 3 | Licitación anual Pareto MP/ME y proveeduría alterna | Variación de precios, ahorro tras negociación | `Negociaciones`, `Proveedores` | (Ofertado − Negociado) × Volumen anual ÷ 12 |
| 4 | Bodega de rechazos y retroalimentación al proveedor | Costo bodega de rechazos | `Rechazos` (+ evidencias en Drive) | Σ Cantidad × Costo unitario del mes |
| 5 | Cumplimiento de pagos / evitar paro de entregas | % facturas pagadas a tiempo | `Pagos`, `Comunicaciones` | Pagadas ≤ vencimiento ÷ facturas exigibles del mes |
| 6 | OTIF a proveedores | Entregas completas y a tiempo | `Entregas` | Completa (± tolerancia) **y** a tiempo (± días) ÷ entregas |
| 7 | Control de precios listado Pareto | Variación de precios | `Ordenes Compra`, `Productos` (Pareto = Sí) | Precio medio ponderado mes vs mes anterior, ponderado por gasto |

Cada indicador tiene **meta editable** en `Config` y semáforo: 🟢 cumple · 🟡 a ≤10% de la meta · 🔴 fuera.

## El dashboard es la herramienta

Se abre con **🛒 Compras › Abrir dashboard** (o como Web App). Arranca vacío: cada módulo muestra *"Aún no hay información"* y se activa a medida que se **adjunta** la información.

| Pestaña | Uso |
|---|---|
| **Tablero** | 7 módulos (uno por iniciativa de la diapositiva): indicador, meta, semáforo, tendencia 6 meses, fuentes cargadas, botones **📎 Adjuntar información** y **Ver detalle** (gráficas + tablas) |
| **Registros rápidos** | Rechazo con foto (→ Drive) y recepción contra OC (→ OTIF) |
| **Historial de cargas** | Quién adjuntó qué archivo, cuántas filas y enlace al original en Drive |

### Cómo se adjunta la información
1. En el módulo, **📎 Adjuntar información** → elige la tabla (p. ej. *Ordenes Compra*, *Ventas*, *Presupuesto*).
2. **⬇ Descargar plantilla Excel** (opcional) o usa el reporte del ERP tal cual.
3. Arrastra el **Excel (.xlsx/.xls) o CSV**. El sistema detecta la fila de encabezados y reconoce columnas aunque cambien tildes, mayúsculas o nombres típicos (`Razón Social` → Proveedor, `No. Factura` → Factura, `Vencimiento` → Fecha Vencimiento, `SKU` → Código…).
4. Revisa la vista previa: columnas reconocidas, obligatorias faltantes y primeras filas.
5. **Cargar información** en modo *Agregar* o *Reemplazar toda la tabla*. El indicador se recalcula al instante y el archivo original queda en `Drive › Gestión de Compras Alfresco › Adjuntos › <tabla>`.

| Módulo | Archivos que lo alimentan |
|---|---|
| 1 Proyectos | Proyectos |
| 2 Compras / Ventas / Ppto | Ordenes Compra, Ventas, Presupuesto, Productos |
| 3 Licitación y negociación | Negociaciones, Proveedores |
| 4 Bodega de rechazos | Rechazos (o formulario) |
| 5 Pagos | Pagos (cartera de tesorería) |
| 6 OTIF | Entregas (o formulario de recepción), Ordenes Compra |
| 7 Precios Pareto | Ordenes Compra, Productos (columna `Pareto = Sí`) |

## Arquitectura

```
Excel / CSV adjunto ─┐
Formularios web ─────┼─► Apps Script ─► Google Sheet (base de datos) ─► Dashboard (diálogo / Web App)
                     │        ├─► Drive: archivos originales + evidencias de rechazos
                     │        ├─► Gmail: alerta diaria, rechazos, comunicado NS
                     │        └─► KPI Historico ─► Looker Studio (opcional)
```

| Archivo | Rol |
|---|---|
| `Config.gs` | Esquema de hojas, listas desplegables, parámetros y metas por defecto |
| `Setup.gs` | Menú 🛒 Compras, creación de estructura, disparador diario, datos demo |
| `Indicadores.gs` | Cálculo de los 7 KPI, hoja Dashboard, histórico mensual |
| `Operaciones.gs` | Reglas OTIF, pagos, ahorro y columnas calculadas |
| `Alertas.gs` | Correo diario, notificación de rechazos, comunicado de Paro de Entregas / NS |
| `Importar.gs` | Carga de Excel/CSV: mapeo de columnas, conversión de tipos, archivo en Drive, historial |
| `WebApp.gs` + `Dashboard.html` | Dashboard (Chart.js), adjuntar información (SheetJS), formularios |

## Instalación (10 minutos)

**Opción A · Copiar y pegar**
1. Crea una Google Sheet nueva → `Extensiones › Apps Script`.
2. Crea un archivo por cada `.gs` de `apps-script/` (mismo nombre) y pega su contenido. Crea el HTML `Dashboard` y pega `Dashboard.html`.
3. En ⚙️ *Configuración del proyecto* marca **Mostrar archivo de manifiesto** y reemplaza `appsscript.json`.
4. Recarga la hoja → menú **🛒 Compras › Inicializar estructura** (autoriza permisos).
5. **🛒 Compras › Activar automatizaciones** (alerta diaria 7:00 a.m.).
6. Opcional: **🛒 Compras › Cargar datos demo** para verlo funcionando, luego borra las filas demo.

**Opción B · clasp (desde este repo)**
```bash
npm i -g @google/clasp && clasp login
cp .clasp.json.example .clasp.json   # pega el scriptId del proyecto de la hoja
clasp push
```

## Operación diaria

| Quién | Qué hace | Dónde |
|---|---|---|
| Compras | Adjunta OC, negociaciones, proyectos, proveedores | Dashboard › 📎 Adjuntar |
| Bodega / Calidad | Registra recepciones (OTIF) y rechazos con foto | Dashboard › Registros rápidos |
| Tesorería | Adjunta la cartera (facturas y fecha de pago) | Dashboard › módulo 5 |
| Finanzas | Adjunta ventas y presupuesto mensual (`Periodo` = `2026-10`) | Dashboard › módulo 2 |
| Sistema | Recalcula, guarda histórico y envía alerta | Automático 7:00 a.m. |

Acciones del menú:
- **✉️ Notificar rechazos**: envía a cada proveedor sus rechazos `Abierto` con la evidencia de Drive, pide causa raíz y los marca `Notificado`.
- **📢 Comunicado Paro de Entregas / NS**: a los proveedores con `Paro Entregas = Sí`, informa su cartera vencida real y la afectación al nivel de servicio. Todo queda en `Comunicaciones`.

## Compartir el dashboard como Web App
`Implementar › Nueva implementación › Aplicación web`. Por defecto `appsscript.json` la deja en **Solo yo**; para el equipo cambia *Quién tiene acceso* a tu dominio. Quien tenga edición sobre la hoja ya lo usa desde **🛒 Compras › Abrir dashboard** sin publicar nada.

## Looker Studio (opcional, gratis)
Conecta `lookerstudio.google.com` a la hoja `KPI Historico` → serie temporal por `Indicador` con `Meta` como línea de referencia.

## Límites de cuenta gratuita
Gmail consumer: 100 correos/día desde Apps Script · disparadores: 90 min/día · Sheets: 10 M celdas. Suficiente para una dirección de compras; con Google Workspace los límites suben a 1.500 correos/día.
