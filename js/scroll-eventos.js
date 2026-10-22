/* ============================================================
   EVENTOS DE SCROLL (Meta)
   "Scrolled 25% of page" … "Scrolled 100% of page", con
   percentage y page_path (la ruta sin ?query ni #hash).
   Va con trackSingleCustom: solo le llega al pixel de
   config.js → metaPixelId, no a otros que haya en la página.
   Cada umbral sale una vez por carga y en orden; si la página
   no tiene scroll no manda nada. Al llegar al 100% deja de
   escuchar. Sin datos personales en los parámetros.
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var pixelId = (cfg.metaPixelId || "").trim();
  if (!pixelId) return;

  var UMBRALES = [25, 50, 75, 100];
  var MARGEN = 3; /* px de tolerancia para contar el fondo */
  var enviados = 0;
  var pagePath = location.pathname;
  var pendiente = false;

  function revisar() {
    pendiente = false;
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (alto <= MARGEN) return; /* página sin scroll */
    var y = window.scrollY || window.pageYOffset;
    var pct = y >= alto - MARGEN ? 100 : (y / alto) * 100;
    while (enviados < UMBRALES.length && pct >= UMBRALES[enviados]) {
      var u = UMBRALES[enviados++];
      if (typeof window.fbq === "function") {
        window.fbq("trackSingleCustom", pixelId, "Scrolled " + u + "% of page", {
          percentage: u,
          page_path: pagePath
        });
      }
    }
    if (enviados === UMBRALES.length) window.removeEventListener("scroll", alScroll);
  }

  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(revisar);
  }

  window.addEventListener("scroll", alScroll, { passive: true });
})();
