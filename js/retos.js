/* ============================================================
   RETO 4x4 y PILATES x STRENGTH — checkout, canal y eventos
   Cada landing dice quién es con <body data-variante="...">
   y lee su bloque de window.FTN_CONFIG.retos.
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var variante = document.body.getAttribute("data-variante");
  var reto = (cfg.retos || {})[variante] || {};
  var planes = reto.checkout || {};

  /* ---------- Canal de origen ----------
     ?src=meta o /reto4por4/meta. Solo los canales dados de alta en
     musculo.canales; se guarda en sessionStorage por si navega y vuelve. */
  var canales = (cfg.musculo && cfg.musculo.canales) || [];
  var crudo = ((location.search.match(/[?&]src=([\w-]+)/i) || [])[1]
            || (location.pathname.match(new RegExp("/" + variante + "/([\\w-]+)/?$")) || [])[1] || "").toLowerCase();
  var canal = canales.indexOf(crudo) !== -1 ? crudo : "";
  var llave = "ftn-canal-" + variante;
  if (canal) { try { sessionStorage.setItem(llave, canal); } catch (e) {} }
  else { try { canal = sessionStorage.getItem(llave) || ""; } catch (e) {} }
  if (canal && canales.indexOf(canal) === -1) canal = "";

  /* ---------- Checkout ----------
     .js-checkout con data-plan va directo al pago de ese plan.
     Sin url todavía, el botón se queda en #oferta (baja a los precios). */
  document.querySelectorAll(".js-checkout").forEach(function (btn) {
    var plan = btn.getAttribute("data-plan");
    var datos = planes[plan] || {};
    var url = (datos.url || "").trim();
    if (url && canal) url += (url.indexOf("?") === -1 ? "?" : "&") + "src=" + canal;
    if (url) btn.href = url;
    btn.addEventListener("click", function () {
      if (!url) { console.warn("[" + variante + "] Falta checkout." + plan + ".url en js/config.js"); return; }
      if (window.ftnTrack) window.ftnTrack("InitiateCheckout", {
        content_name: datos.nombre, value: datos.precio || 0, currency: "MXN",
        variante: variante, canal: canal || "directo"
      });
    });
  });

  /* ---------- Videos diferidos ----------
     .js-video-diferido trae sus <source data-src>; se cargan y arrancan
     cuando el video se acerca a la pantalla, para no bajar megas de golpe. */
  var diferidos = document.querySelectorAll("video.js-video-diferido");
  function cargarVideo(v) {
    v.querySelectorAll("source[data-src]").forEach(function (s) { s.src = s.getAttribute("data-src"); s.removeAttribute("data-src"); });
    v.autoplay = true;
    v.load();
  }
  if ("IntersectionObserver" in window) {
    var ioVideo = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { ioVideo.unobserve(e.target); cargarVideo(e.target); } });
    }, { rootMargin: "300px 0px" });
    diferidos.forEach(function (v) { ioVideo.observe(v); });
  } else {
    diferidos.forEach(cargarVideo);
  }

  /* ---------- ViewContent: cuando los precios entran a pantalla ---------- */
  var oferta = document.getElementById("oferta");
  if ("IntersectionObserver" in window && oferta) {
    var io = new IntersectionObserver(function (ents) {
      if (ents[0].isIntersecting) {
        io.disconnect();
        if (window.ftnTrack) window.ftnTrack("ViewContent", { content_name: reto.nombre, variante: variante, canal: canal || "directo" });
      }
    }, { threshold: .2 });
    io.observe(oferta);
  }

  /* ---------- "Estás a N semanas de que termine el año" ----------
     Se calcula con la fecha de hoy en CDMX; si falla, se queda el número
     escrito en el HTML. */
  var finAnio = Date.UTC(new Date().getUTCFullYear() + 1, 0, 1, 6);
  var semanas = Math.floor((finAnio - Date.now()) / (7 * 864e5));
  if (semanas > 0) document.querySelectorAll(".js-semanas").forEach(function (el) { el.textContent = semanas; });

  /* ---------- Reloj de cierre ----------
     Solo aparece cuando faltan 7 días o menos para cerrar inscripciones:
     antes de eso un reloj de semanas no mete urgencia. */
  var cierre = Date.parse(reto.cierreISO || "");
  var relojes = document.querySelectorAll(".js-cierre");
  function dos(n) { return n < 10 ? "0" + n : "" + n; }
  function tic() {
    var falta = cierre - Date.now();
    var mostrar = falta > 0 && falta <= 7 * 864e5;
    relojes.forEach(function (r) { r.hidden = !mostrar; });
    if (!mostrar) return falta > 0;
    var s = Math.floor(falta / 1000);
    var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    document.querySelectorAll(".js-cierre [data-u]").forEach(function (el) {
      var u = el.getAttribute("data-u");
      el.textContent = u === "d" ? v.d : dos(v[u]);
    });
    return true;
  }
  if (tic()) setInterval(tic, 1000);
})();
