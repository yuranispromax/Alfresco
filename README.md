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

## Arquitectura

```
Google Sheet (base de datos) ──► Apps Script ──► Dashboard (diálogo / Web App)
        ▲                             │      ├─► Gmail: alerta diaria, rechazos, comunicado NS
        │                             │      ├─► Drive: carpeta del sistema + evidencias de rechazos
 Formularios web (rechazo, recepción) ┘      └─► KPI Historico ──► Looker Studio (opcional)
```

| Archivo | Rol |
|---|---|
| `Config.gs` | Esquema de hojas, listas desplegables, parámetros y metas por defecto |
| `Setup.gs` | Menú 🛒 Compras, creación de estructura, disparador diario, datos demo |
| `Indicadores.gs` | Cálculo de los 7 KPI, hoja Dashboard, histórico mensual |
| `Operaciones.gs` | Reglas OTIF, pagos, ahorro y columnas calculadas |
| `Alertas.gs` | Correo diario, notificación de rechazos, comunicado de Paro de Entregas / NS |
| `WebApp.gs` + `Dashboard.html` | Dashboard y formularios (rechazo con foto a Drive, recepción contra OC) |

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
| Compras | Registra OC, negociaciones, proyectos, proveedores alternos | Hojas directamente |
| Bodega / Calidad | Registra recepciones (OTIF) y rechazos con foto | Dashboard › formularios |
| Tesorería | Registra facturas y fecha de pago | Hoja `Pagos` |
| Finanzas | Carga ventas y presupuesto mensual (`Periodo` = `2026-10`) | `Ventas`, `Presupuesto` |
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
