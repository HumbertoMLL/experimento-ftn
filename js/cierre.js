/* Cuenta regresiva al cierre de inscripciones del MiniReto (config: minireto.cierreISO,
   o el bloque que diga <body data-config="…">, p. ej. miniretoV2).
   Pinta .js-cierre-reloj (cajitas [data-u]) y .js-cierre-txt (texto "1d 05:12:33").
   Mientras corre, <html> lleva la clase .cierre-activo (el CSS esconde "Iniciamos en").
   Al vencer, esconde todo lo que tenga .js-cierre-bloque y quita la clase. */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var mr = cfg[document.body.getAttribute("data-config") || "minireto"] || {};
  var fin = Date.parse(mr.cierreISO || "");
  if (!(fin > 0)) return;
  function dos(n) { return n < 10 ? "0" + n : "" + n; }
  function todos(sel, fn) { document.querySelectorAll(sel).forEach(fn); }
  function tic() {
    var falta = fin - Date.now();
    if (!(falta > 0)) {
      todos(".js-cierre-bloque", function (el) { el.hidden = true; });
      document.documentElement.classList.remove("cierre-activo");
      return false;
    }
    var s = Math.floor(falta / 1000);
    var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    todos(".js-cierre-reloj [data-u]", function (el) {
      var u = el.getAttribute("data-u");
      el.textContent = u === "d" ? v.d : dos(v[u]);
    });
    todos(".js-cierre-txt", function (el) {
      el.textContent = (v.d ? v.d + "d " : "") + dos(v.h) + ":" + dos(v.m) + ":" + dos(v.s);
    });
    return true;
  }
  document.documentElement.classList.add("cierre-activo");
  if (tic()) var t = setInterval(function () { if (!tic()) clearInterval(t); }, 1000);
})();
