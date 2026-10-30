# PESOfinanzas — guía para Claude

## Para qué sirve
Sistema de finanzas interno (tablero) de PE$O. Muestra y organiza egresos, ingresos, bancos, RRHH, costos,
presupuesto, plan de cuentas, tipo de cambio, comprobantes de pago, tareas, calendario, archivos y boletas.
Incluye un widget para iPhone (app Scriptable) con un resumen.

## Para qué empresa
- Cliente: **PE$O** (fintech).
- Desarrollado por **NUMMEROS by CONTAX** (marca de sistemas de CONTAX).

## Cómo está armado (archivos principales)
- `index.html` — TODO el sistema en un solo archivo muy grande (~850 KB, HTML + CSS + JS). Usar `grep`/`sed`
  para buscar; no leerlo entero.
  - La versión está en la constante `APP_VERSION` (ej. `"V198"`); se sube en cada cambio.
  - `window.PESO_API_URL`: URL del Web App de Apps Script (el "servidor de datos").
  - `FIREBASE_CONFIG`: configuración web del proyecto Firebase `nummeros-peso`.
- `firestore.rules` — reglas de seguridad de Firestore (no se aplican solas, ver "Cómo se publica").
- `mudanza.html` — aviso "Nos mudamos" para quien entra por el enlace viejo de Apps Script.
- `widget/cargador.js` — lo que se pega en Scriptable del iPhone; descarga `widget/peso.js` del sitio.
- `widget/peso.js` — el widget; pide correo + clave del sistema y lee `config/widget` de Firestore.
- `marca/` — logos, íconos, fuentes, colores (`nummeros-tokens.css`, `nummeros-marca.js`) y fotos "clásicos".
- `CNAME` — dominio propio.

## Dónde se guardan los datos
- **Google Sheets vía Apps Script** (código NO está en este repo): el sistema llama funciones del servidor
  (`getData`, `getDataParte`, etc.) enviando un PIN. Hojas: Egresos, Ingresos, RRHH, Inversiones, Préstamos,
  Devoluciones, etc. La IA (Gemini), Slack y Google Drive (comprobantes) también se manejan desde Apps Script.
- **Firebase Firestore** (proyecto `nummeros-peso`), colecciones:
  `usuarios` (correo = ID, con clave y rol), `sesiones`, `claves` (formato antiguo), `config/*`
  (apps = PIN del servidor, widget, presupuesto, plan de cuentas, tipo de cambio, históricos `config/h_*`…),
  `tareas`, `asignacionManual`.
- Ingreso: Firebase anónimo + correo y clave validados por las reglas.

## Cómo se publica
- GitHub Pages desde la rama `main`, con dominio **nummeros.peso.contaxbolivia.com** (archivo `CNAME`).
- Pasos aparte, manuales:
  1. Si cambia `firestore.rules`, hay que pegarlo en la consola de Firebase (Firestore → Reglas → Publicar).
  2. Si cambia algo del servidor, se actualiza el proyecto de Apps Script y se publica una nueva
     implementación del Web App (si cambia la URL, actualizar `PESO_API_URL`).
- Convención de commits: `VNNN: descripción en español` (ej. `V198: ...`), igual a `APP_VERSION`.

## Cuidados importantes
- El repositorio es **PÚBLICO**: nunca subir claves, PIN, tokens de Slack, llaves de IA, IDs de hojas ni
  datos reales de la empresa (nombres, montos, sueldos).
- La configuración web de Firebase (apiKey) es pública por diseño; la seguridad depende de `firestore.rules`.
- Las claves de usuario se guardan como texto en `usuarios`; el administrador puede verlas.
- El historial de git contiene datos reales antiguos de egresos (commits de julio 2026, `index_1.html`).
- Al cambiar `index.html`, subir `APP_VERSION` y mantener el respaldo a `getData` si el servidor es antiguo.
- No borrar `mudanza.html` ni `widget/` (los usan enlaces y iPhones ya configurados).
