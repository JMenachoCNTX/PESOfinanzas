/* =====================================================================
   NUMMEROS · elementos de marca para los sistemas
   - Patrón de la N (celdas de dos verdes)
   - Íconos y elementos en relieve (sombra larga en diagonal + filo de luz)
   - Fotografía oficial: "Los clásicos de los números", siempre con su nombre
   Tomado del Manual de identidad visual v1.1.
   ===================================================================== */
(function (global) {
  "use strict";
  var N = "M0 427 L0 728 L136 728 L136 634 Z M410 0 L410 85 L546 292 L546 0 Z M0 0 L148 0 L410 458.5 L410 341 L546 548 L546 728 L401.71 728 L136 263 L136 379 L0 172 Z";
  var V = { 950: "#051F20", 900: "#0B2B26", 800: "#163832", 700: "#235347", 300: "#8EB69B", 100: "#DAF1DE" };
  var BASE = (function () {
    try { var s = document.currentScript && document.currentScript.src; if (s) return s.replace(/nummeros-marca\.js.*$/, ""); } catch (e) {}
    return "marca/";
  })();

  /* ---------- Patrón N ---------- */
  function tiles(cols, rows, cw, ch, scheme, scale) {
    var s = '<svg viewBox="0 0 ' + cols * cw + " " + rows * ch + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    var nh = ch * scale, k = nh / 728, nw = 546 * k;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var sc = scheme[(r + c) % scheme.length], x = c * cw, y = r * ch;
      s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="' + V[sc[0]] + '"/>' +
           '<path fill="' + V[sc[1]] + '" transform="translate(' + (x + (cw - nw) / 2).toFixed(1) + " " + (y + (ch - nh) / 2).toFixed(1) + ") scale(" + k.toFixed(4) + ')" d="' + N + '"/>';
    }
    return s + "</svg>";
  }
  /* Portada de la marca: 4 x 2 celdas */
  function portada() {
    var C = [[700, 100], [100, 700], [800, 300], [300, 950], [300, 800], [800, 100], [700, 300], [100, 800]];
    var t = '<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    C.forEach(function (bf, i) {
      var x = (i % 4) * 120, y = Math.floor(i / 4) * 150;
      t += '<rect x="' + x + '" y="' + y + '" width="120" height="150" fill="' + V[bf[0]] + '"/><path fill="' + V[bf[1]] + '" transform="translate(' + (x + 19.05).toFixed(2) + " " + (y + 20.4).toFixed(2) + ') scale(0.15)" d="' + N + '"/>';
    });
    return t + "</svg>";
  }
  /* Fondo tono sobre tono como imagen CSS */
  function fondoCSS(bg, fg, size) {
    size = size || 120;
    var k = (size * 0.5) / 728, nw = 546 * k, nh = 728 * k;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '"><rect width="100%" height="100%" fill="' + bg + '"/><path fill="' + fg + '" transform="translate(' + ((size - nw) / 2).toFixed(1) + " " + ((size - nh) / 2).toFixed(1) + ") scale(" + k.toFixed(4) + ')" d="' + N + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* ---------- Relieve ---------- */
  var RTH = {
    dark: { bg1: "#163832", bg2: "#051F20", b1: "#1F4A40", b2: "#0B2B26", f1: "#DAF1DE", f2: "#7FAE92", rim: "#FFFFFF", rimO: .75, sh: "#000000", shO: .55, ink: "#DAF1DE", muted: "#8EB69B" },
    light: { bg1: "#FFFFFF", bg2: "#DAF1DE", b1: "#FFFFFF", b2: "#E3F1E7", f1: "#2E6B5B", f2: "#163832", rim: "#FFFFFF", rimO: .95, sh: "#163832", shO: .22, ink: "#163832", muted: "#557363" }
  };
  var RU = 0;
  function defs(id, t) {
    return '<linearGradient id="' + id + 'bg" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.bg1 + '"/><stop offset="1" stop-color="' + t.bg2 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.b1 + '"/><stop offset="1" stop-color="' + t.b2 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'f" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.f1 + '"/><stop offset="1" stop-color="' + t.f2 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.rim + '" stop-opacity="' + t.rimO + '"/><stop offset=".55" stop-color="' + t.rim + '" stop-opacity="0"/></linearGradient>' +
      '<filter id="' + id + 's" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter><filter id="' + id + 'x"><feGaussianBlur stdDeviation="1.6"/></filter>';
  }
  function plate(id, t, kind, x, y, w, h, r) {
    var sh = kind === "c" ? '<circle cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" r="' + w / 2 + '"' : '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '"';
    return {
      clip: '<clipPath id="' + id + 'c">' + sh + "/></clipPath>",
      out: '<g filter="url(#' + id + 's)" opacity="' + t.shO * 1.3 + '" transform="translate(-16 22)">' + sh + ' fill="' + t.sh + '"/></g>' + sh + ' fill="url(#' + id + 'b)"/>' + sh + ' fill="none" stroke="url(#' + id + 'r)" stroke-width="2"/>'
    };
  }
  function extrude(id, t, shp, L) {
    var s = '<g clip-path="url(#' + id + 'c)" filter="url(#' + id + 'x)">';
    for (var k = L; k >= 2; k -= 3) s += '<g transform="translate(' + -k + " " + k + ')" opacity="' + (t.shO * .28 * (1 - k / (L + 6))).toFixed(3) + '">' + shp(t.sh) + "</g>";
    return s + '</g><g transform="translate(-1.6 1.6)">' + shp(t.rim) + '</g><g opacity="' + (1 - t.rimO + .05) + '">' + shp(t.sh) + "</g>" + shp("url(#" + id + "f)");
  }
  var RG = {
    reporte: '<path d="M20 82h60M30 82V58M50 82V36M70 82V20"/>',
    factura: '<path d="M28 14h44v72l-8-6-7 6-7-6-7 6-7-6-8 6z"/><path d="M40 34h20M40 50h20"/>',
    inventario: '<path d="M18 34l32-16 32 16v36l-32 16-32-16z"/><path d="M18 34l32 16 32-16M50 50v36"/>',
    equipo: '<circle cx="50" cy="34" r="14"/><path d="M22 86c3-18 14-26 28-26s25 8 28 26"/>',
    celular: '<rect x="30" y="12" width="40" height="76" rx="9"/><path d="M46 74h8"/>',
    calendario: '<rect x="16" y="24" width="68" height="60" rx="9"/><path d="M16 44h68M34 14v18M66 14v18"/>',
    aprobado: '<path d="M20 52l20 20 40-42"/>',
    seguridad: '<rect x="24" y="46" width="52" height="40" rx="9"/><path d="M34 46V34a16 16 0 0 1 32 0v12"/>',
    banco: '<path d="M14 38l36-20 36 20z"/><path d="M24 44v32M42 44v32M58 44v32M76 44v32M14 84h72"/>',
    ingreso: '<path d="M50 14v52M30 46l20 20 20-20M20 86h60"/>',
    cambio: '<path d="M18 36h58l-14-14M82 64H24l14 14"/>',
    ia: '<path d="M50 14l9 27 27 9-27 9-9 27-9-27-27-9 27-9z"/>',
    archivo: '<path d="M14 32a8 8 0 0 1 8-8h18l8 10h30a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z"/>',
    enlace: '<path d="M42 58l16-16"/><path d="M36 46l-8 8a14 14 0 0 0 20 20l8-8M64 54l8-8a14 14 0 0 0-20-20l-8 8"/>',
    hoja: '<rect x="20" y="16" width="60" height="68" rx="9"/><path d="M20 38h60M20 60h60M44 16v68"/>',
    documento: '<path d="M28 14h30l16 16v56H28z"/><path d="M58 14v16h16M38 50h26M38 64h26"/>'
  };
  /* Ícono circular en relieve. mode: "light" (sobre fondo claro) o "dark". */
  function icono(name, mode, label) {
    var t = RTH[mode || "light"], id = "nmr" + (RU++), P = plate(id, t, "c", 36, 36, 168, 168);
    var shp = function (paint) { return '<g transform="translate(65 65) scale(1.1)" fill="none" stroke="' + paint + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">' + (RG[name] || RG.reporte) + "</g>"; };
    return '<svg viewBox="0 0 240 240" role="img" aria-label="' + (label || name) + '" xmlns="http://www.w3.org/2000/svg"><defs>' + defs(id, t) + P.clip + "</defs>" + P.out + extrude(id, t, shp, 90) + "</svg>";
  }
  /* La N en relieve (placa redondeada) */
  function nRelieve(mode) {
    var t = RTH[mode || "light"], id = "nmr" + (RU++), P = plate(id, t, "r", 50, 40, 140, 160, 34);
    var shp = function (p) { return '<path transform="translate(84 64) scale(.1475)" fill="' + p + '" d="' + N + '"/>'; };
    return '<svg viewBox="0 0 240 240" role="img" aria-label="NUMMEROS" xmlns="http://www.w3.org/2000/svg"><defs>' + defs(id, t) + P.clip + "</defs>" + P.out + extrude(id, t, shp, 110) + "</svg>";
  }
  /* Sello en relieve, ej. "Cuadrado" */
  function sello(texto, mode) {
    var t = RTH[mode || "light"], id = "nmr" + (RU++), w = Math.max(200, 92 + String(texto).length * 19), P = plate(id, t, "r", 30, 32, w, 96, 48);
    var shp = function (p) { return '<g fill="none" stroke="' + p + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M68 80l14 14 26-28"/></g><text x="126" y="94" font-family="Akshar,sans-serif" font-weight="700" font-size="34" fill="' + p + '">' + texto + "</text>"; };
    return '<svg viewBox="0 0 ' + (w + 60) + ' 160" role="img" aria-label="' + texto + '" xmlns="http://www.w3.org/2000/svg"><defs>' + defs(id, t) + P.clip + "</defs>" + P.out + extrude(id, t, shp, 60) + "</svg>";
  }

  /* ---------- Fotografía: Los clásicos de los números ---------- */
  var PER = {
    pitagoras: { n: "Pitágoras", d: "Matemático griego · c. 570 a. C." },
    euclides: { n: "Euclides", d: "Matemático griego · c. 300 a. C." },
    arquimedes: { n: "Arquímedes", d: "Matemático griego · c. 287 a. C." },
    tres: { n: "Los clásicos de los números", d: "Pitágoras · Euclides · Arquímedes" }
  };
  /* [archivo, personaje, qué hace, ancho, alto, foco horizontal] */
  var CLA = [
    ["pitagoras-tablet", "pitagoras", "Mostrando el sistema", 928, 1152, .5],
    ["pitagoras-celular", "pitagoras", "Con el celular", 928, 1152, .7],
    ["pitagoras-inventario", "pitagoras", "Revisando el inventario", 928, 1152, .6],
    ["euclides-laptop", "euclides", "En la laptop", 928, 1152, .5],
    ["euclides-lentes", "euclides", "Revisando facturas", 928, 1152, .6],
    ["arquimedes-balanza", "arquimedes", "La balanza", 928, 1152, .5],
    ["arquimedes-pensando", "arquimedes", "Pensando", 928, 1152, .6],
    ["euclides-compas", "euclides", "Midiendo el crecimiento", 1376, 768, .75],
    ["arquimedes-cafeteria", "arquimedes", "En la caja", 1376, 768, .65],
    ["arquimedes-eureka", "arquimedes", "¡Eureka!", 1376, 768, .7],
    ["pitagoras-senalando", "pitagoras", "Señalando", 768, 1376, .8],
    ["euclides-caminando", "euclides", "Camino a la oficina", 768, 1376, .5],
    ["los-tres-reunion", "tres", "Los tres en reunión", 1376, 768, .5]
  ];
  function fotoUrl(k) { return BASE + "clasicos/" + k + ".jpg"; }
  /* Foto vertical del día (cambia cada día) */
  function fotoDelDia() {
    var OSCURAS = { "arquimedes-pensando": 1, "arquimedes-eureka": 1, "arquimedes-cafeteria": 1 }; /* fondo oscuro: solo para piezas oscuras */
    var verticales = CLA.filter(function (c) { return c[4] > c[3] && c[3] > 900 && !OSCURAS[c[0]]; });
    var d = new Date(), n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    return verticales[n % verticales.length];
  }
  /* <figure> con la foto y la etiqueta del personaje (regla: siempre con nombre) */
  function foto(c, cls) {
    c = c || fotoDelDia();
    var p = PER[c[1]];
    return '<figure class="nm-foto ' + (cls || "") + '"><img src="' + fotoUrl(c[0]) + '" alt="' + p.n + ": " + c[2] + '" style="object-position:' + Math.round(c[5] * 100) + '% 30%" loading="lazy">' +
      '<span class="nm-chip"><b>' + p.n + "</b>" + p.d + "</span></figure>";
  }

  global.NUMMEROS_MARCA = { N: N, V: V, tiles: tiles, portada: portada, fondoCSS: fondoCSS, icono: icono, nRelieve: nRelieve, sello: sello, foto: foto, fotoDelDia: fotoDelDia, fotoUrl: fotoUrl, CLA: CLA, PER: PER };
})(window);
