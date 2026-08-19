/* ============================================================
   META PIXEL
   Se carga en el <head> (después de config.js) para que el
   PageView se dispare lo antes posible.
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var pixelId = (cfg.metaPixelId || "").trim();

  if (!pixelId) {
    console.warn(
      "[Meta Pixel] Falta el Pixel ID. Pégalo en js/config.js → metaPixelId. " +
        "Ningún evento se está enviando."
    );
    return;
  }

  /* Código base oficial de Meta */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
})();

/* ============================================================
   MICROSOFT CLARITY
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var clarityId = (cfg.clarityId || "").trim();
  if (!clarityId) return;

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", clarityId);
})();

/* Helper central: todos los eventos del sitio pasan por aquí.
   Si el pixel no está configurado, solo lo registra en consola. */
window.ftnTrack = function (eventName, params) {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params || {});
    console.info("[Meta Pixel] " + eventName, params || {});
  } else {
    console.warn("[Meta Pixel] (no configurado) " + eventName, params || {});
  }
};
