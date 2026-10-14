// NUMMEROS · PE$O — Widget para iPhone (app Scriptable)
// Este archivo vive en GitHub y lo descarga el "cargador" que está en tu iPhone.
// Lee el resumen que el sistema guarda en Firebase (config/widget) cada vez que un administrador lo abre.

const API_KEY = "AIzaSyDbEjGWrguALpSgMAVh5BroRaAK0FOin6k";
const PROJECT = "nummeros-peso";
const SITIO = "https://nummeros.peso.contaxbolivia.com/";
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const KC = "nummeros_peso_widget";

const C = {
  fondo: new Color("#051F20"), panel: new Color("#0B2B26"), texto: new Color("#DAF1DE"),
  suave: new Color("#8EB69B"), verde: new Color("#8EB69B"), rojo: new Color("#F97066"), linea: new Color("#235347"),
};

// ---------- utilidades ----------
function guardar(o) { Keychain.set(KC, JSON.stringify(o)); }
function leer() { try { return Keychain.contains(KC) ? JSON.parse(Keychain.get(KC)) : null; } catch (e) { return null; } }

async function http(url, method, body, token) {
  const r = new Request(url);
  r.method = method || "GET";
  r.headers = { "Content-Type": "application/json" };
  if (token) r.headers["Authorization"] = "Bearer " + token;
  if (body) r.body = JSON.stringify(body);
  let json = null;
  try { json = await r.loadJSON(); } catch (e) { json = null; }
  return { status: (r.response && r.response.statusCode) || 0, json };
}

function valor(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
  if ("mapValue" in v) { const o = {}; const f = v.mapValue.fields || {}; for (const k in f) o[k] = valor(f[k]); return o; }
  return null;
}

function dinero(n) {
  if (n == null || isNaN(n)) return "—";
  const s = n < 0 ? "-" : ""; const a = Math.abs(n);
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e4) return s + "$" + (a / 1e3).toFixed(0) + "K";
  if (a >= 1e3) return s + "$" + (a / 1e3).toFixed(1) + "K";
  return s + "$" + a.toFixed(0);
}

// ---------- acceso (correo + clave del sistema) ----------
async function pedirAcceso() {
  const a = new Alert();
  a.title = "NUMMEROS · PE$O";
  a.message = "Escribe el correo y la clave con los que entras al sistema.";
  a.addTextField("correo", "");
  a.addTextField("clave (se ve para que revises que esté bien escrita)", "");
  a.addAction("Guardar");
  a.addCancelAction("Cancelar");
  const i = await a.presentAlert();
  if (i === -1) return null;
  const limpio = t => String(t || "").replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " ").trim();
  const o = { email: limpio(a.textFieldValue(0)).toLowerCase(), clave: limpio(a.textFieldValue(1)) };
  guardar(o);
  return o;
}

async function token(cfg) {
  // usuario anónimo de Firebase (se reutiliza con el refreshToken)
  if (cfg.refresh) {
    const r = new Request(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`);
    r.method = "POST"; r.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    r.body = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(cfg.refresh);
    try { const j = await r.loadJSON(); if (j && j.id_token) { cfg.refresh = j.refresh_token; cfg.uid = j.user_id; guardar(cfg); return j.id_token; } } catch (e) {}
  }
  const s = await http(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, "POST", { returnSecureToken: true });
  if (!s.json || !s.json.idToken) throw new Error("No se pudo conectar con Firebase.");
  cfg.refresh = s.json.refreshToken; cfg.uid = s.json.localId; cfg.sesion = false; guardar(cfg);
  return s.json.idToken;
}

async function abrirSesion(cfg, tk) {
  const intento = clave => http(`${FS}/sesiones/${cfg.uid}`, "PATCH", { fields: { email: { stringValue: cfg.email }, clave: { stringValue: clave }, desde: { stringValue: new Date().toISOString() }, navegador: { stringValue: "Widget Scriptable" } } }, tk);
  let r = await intento(cfg.clave);
  // el iPhone a veces pone en mayúscula la primera letra: se prueba también en minúscula
  if (r.status !== 200 && cfg.clave && cfg.clave[0] !== cfg.clave[0].toLowerCase()) {
    const alt = cfg.clave[0].toLowerCase() + cfg.clave.slice(1); const r2 = await intento(alt);
    if (r2.status === 200) { cfg.clave = alt; r = r2; } }
  if (r.status !== 200) {
    const det = (r.json && r.json.error && (r.json.error.status || r.json.error.message)) || "";
    const e = new Error("No se pudo entrar con " + cfg.email + " (código " + r.status + (det ? " · " + det : "") + "). Revisa el correo y la clave: abre el script en la app y elige «Cambiar correo / clave».");
    e.acceso = true; throw e;
  }
  cfg.sesion = true; guardar(cfg);
}

async function datos() {
  let cfg = leer();
  if (!cfg || !cfg.email || !cfg.clave) {
    if (config.runsInWidget) throw new Error("Abre Scriptable y toca este script para escribir tu correo y clave.");
    cfg = await pedirAcceso(); if (!cfg) throw new Error("Sin acceso.");
  }
  let tk = await token(cfg);
  if (!cfg.sesion) {
    try { await abrirSesion(cfg, tk); }
    catch (e) { if (!e.acceso || config.runsInWidget) throw e;
      const n = await pedirAcceso(); if (!n) throw e; cfg = Object.assign(leer() || {}, n); cfg.sesion = false; guardar(cfg); tk = await token(cfg); await abrirSesion(cfg, tk); }
  }
  let r = await http(`${FS}/config/widget`, "GET", null, tk);
  if (r.status === 403 || r.status === 401) { await abrirSesion(cfg, tk); r = await http(`${FS}/config/widget`, "GET", null, tk); }
  if (r.status === 403 && !config.runsInWidget) { cfg = await pedirAcceso(); tk = await token(cfg); await abrirSesion(cfg, tk); r = await http(`${FS}/config/widget`, "GET", null, tk); }
  if (r.status !== 200 || !r.json) throw new Error(r.status === 404 ? "Aún no hay resumen: abre el sistema una vez en la compu." : "No se pudo leer el resumen (" + r.status + ").");
  return valor({ mapValue: { fields: r.json.fields || {} } });
}

// ---------- dibujo ----------
function txt(st, t, size, color, bold) {
  const x = st.addText(String(t)); x.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  x.textColor = color || C.texto; x.lineLimit = 1; x.minimumScaleFactor = 0.6; return x;
}
function dato(st, etiqueta, val, color, size) {
  const v = st.addStack(); v.layoutVertically();
  txt(v, etiqueta, 10, C.suave);
  txt(v, val, size || 16, color || C.texto, true);
  return v;
}
function grafico(serie, w, h) {
  const d = new DrawContext(); d.size = new Size(w, h); d.opaque = false; d.respectScreenScale = true;
  const max = Math.max(1, ...serie.map(s => Math.max(s.i || 0, s.e || 0)));
  const n = serie.length, bw = w / n, barra = Math.max(3, bw / 3.2), base = h - 14;
  serie.forEach((s, i) => {
    const x = i * bw + bw / 2;
    const hi = (s.i || 0) / max * (base - 4), he = (s.e || 0) / max * (base - 4);
    d.setFillColor(C.verde); d.fillRect(new Rect(x - barra - 1, base - hi, barra, hi));
    d.setFillColor(C.rojo); d.fillRect(new Rect(x + 1, base - he, barra, he));
    d.setTextColor(C.suave); d.setFont(Font.systemFont(9)); d.setTextAlignedCenter();
    d.drawTextInRect(s.m || "", new Rect(x - bw / 2, base + 2, bw, 12));
  });
  return d.getImage();
}
function hora(iso) { try { const d = new Date(iso); return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } }

function armar(D, fam) {
  const w = new ListWidget(); w.backgroundColor = C.fondo; w.url = SITIO; w.setPadding(14, 14, 12, 14);
  w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  const cab = w.addStack(); cab.centerAlignContent();
  txt(cab, "PE$O", 13, C.texto, true); cab.addSpacer(6); txt(cab, D.mesNombre || "", 11, C.suave); cab.addSpacer();
  if (fam !== "small") txt(cab, "NUMMEROS", 9, C.suave, true);
  w.addSpacer(8);
  const resColor = (D.mesRes || 0) >= 0 ? C.verde : C.rojo;

  if (fam === "small") {
    txt(w, "Resultado del mes", 10, C.suave);
    txt(w, dinero(D.mesRes), 26, resColor, true);
    w.addSpacer(6);
    const f = w.addStack(); dato(f, "Ingresos", dinero(D.mesIng), C.verde, 13); f.addSpacer(); dato(f, "Egresos", dinero(D.mesEg), C.rojo, 13);
    w.addSpacer();
    txt(w, "Caja " + dinero(D.caja) + (D.runway ? " · " + D.runway + " m" : ""), 10, C.suave);
    return w;
  }

  const fila = w.addStack();
  const izq = fila.addStack(); izq.layoutVertically();
  txt(izq, "Resultado del mes", 10, C.suave); txt(izq, dinero(D.mesRes), 24, resColor, true);
  izq.addSpacer(4);
  const ie = izq.addStack(); dato(ie, "Ingresos", dinero(D.mesIng), C.verde, 13); ie.addSpacer(10); dato(ie, "Egresos", dinero(D.mesEg), C.rojo, 13);
  fila.addSpacer();
  const der = fila.addStack(); der.layoutVertically();
  dato(der, "Caja estimada", dinero(D.caja), C.texto, 14);
  der.addSpacer(3);
  dato(der, "Por pagar", dinero(D.cxp) + (D.nCxp ? " (" + D.nCxp + ")" : ""), C.rojo, 14);

  if (fam === "large") {
    w.addSpacer(10);
    const f2 = w.addStack();
    dato(f2, "Runway", D.runway ? D.runway + " meses" : "—", C.texto, 15); f2.addSpacer();
    dato(f2, "Gasto prom./mes", dinero(D.burn), C.texto, 15); f2.addSpacer();
    dato(f2, "TC venta", D.tc ? "Bs " + Number(D.tc).toFixed(2) : "—", C.texto, 15);
    w.addSpacer(8);
    const f3 = w.addStack();
    dato(f3, "Mes anterior", dinero(D.antRes), (D.antRes || 0) >= 0 ? C.verde : C.rojo, 14); f3.addSpacer();
    dato(f3, "Ingresos del año", dinero(D.anioIng), C.verde, 14); f3.addSpacer();
    dato(f3, "Resultado del año", dinero(D.anioRes), (D.anioRes || 0) >= 0 ? C.verde : C.rojo, 14);
    w.addSpacer(10);
    if (Array.isArray(D.serie) && D.serie.length) { const im = w.addImage(grafico(D.serie, 300, 90)); im.imageSize = new Size(300, 90); im.centerAlignImage(); }
  } else {
    w.addSpacer(6);
    if (Array.isArray(D.serie) && D.serie.length) { const im = w.addImage(grafico(D.serie, 300, 44)); im.imageSize = new Size(300, 44); }
  }
  w.addSpacer();
  txt(w, "Actualizado " + hora(D.actualizado) + " · TC " + (D.tc ? Number(D.tc).toFixed(2) : "—"), 9, C.suave);
  return w;
}

function error(msg) {
  const w = new ListWidget(); w.backgroundColor = C.fondo; w.url = SITIO; w.setPadding(14, 14, 14, 14);
  txt(w, "PE$O", 13, C.texto, true); w.addSpacer(6);
  const t = w.addText(msg); t.font = Font.systemFont(11); t.textColor = C.suave;
  return w;
}

async function run() {
  const fam = config.widgetFamily || "medium";
  let w;
  try { w = armar(await datos(), fam); } catch (e) { w = error(e.message || String(e)); }
  if (config.runsInWidget) Script.setWidget(w);
  else {
    const a = new Alert(); a.title = "Widget PE$O"; a.message = "¿Qué quieres hacer?";
    a.addAction("Ver widget mediano"); a.addAction("Ver widget grande"); a.addAction("Cambiar correo / clave"); a.addCancelAction("Cerrar");
    const i = await a.presentAlert();
    if (i === 2) { await pedirAcceso(); const c = leer(); if (c) { c.sesion = false; guardar(c); } }
    if (i === 0 || i === 2) { let x; try { x = armar(await datos(), "medium"); } catch (e) { x = error(e.message); } await x.presentMedium(); }
    if (i === 1) { let x; try { x = armar(await datos(), "large"); } catch (e) { x = error(e.message); } await x.presentLarge(); }
  }
  Script.complete();
}

module.exports = { run };
