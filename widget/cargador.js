// NUMMEROS · PE$O — CARGADOR del widget (pega SOLO esto en Scriptable).
// Descarga siempre la última versión del widget desde el sistema, así se actualiza solo.
// Si no hay internet, usa la última copia guardada en el iPhone.
const URL_WIDGET = "https://nummeros.peso.contaxbolivia.com/widget/peso.js";
const fm = FileManager.local();
const ruta = fm.joinPath(fm.documentsDirectory(), "nummeros-peso-widget.js");
try {
  const r = new Request(URL_WIDGET + "?t=" + Date.now());
  const codigo = await r.loadString();
  if (r.response && r.response.statusCode === 200 && codigo.indexOf("module.exports") >= 0) fm.writeString(ruta, codigo);
} catch (e) { /* sin internet: se usa la copia guardada */ }
if (!fm.fileExists(ruta)) {
  const w = new ListWidget(); w.addText("PE$O: no se pudo descargar el widget. Revisa tu internet.");
  Script.setWidget(w); Script.complete();
} else {
  const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
  const mod = { exports: {} };
  await new AsyncFn("module", fm.readString(ruta) + "\nawait module.exports.run();")(mod);
}
