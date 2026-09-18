/* ============================================================
   TIKTOK PIXEL
   Se carga en el <head> después de config.js y pixel.js, solo en
   las landings de músculo. Manda PageView al cargar y repite hacia
   TikTok cada evento que pasa por window.ftnTrack (ViewContent,
   InitiateCheckout), con los mismos datos que van a Meta.
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var pixelId = (cfg.tiktokPixelId || "").trim();
  if (!pixelId) return;

  /* Código base oficial de TikTok */
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e }, ttq.load = function (e, n) { var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.partner; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = r, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; n = document.createElement("script"); n.type = "text/javascript", n.async = !0, n.src = r + "?sdkid=" + e + "&lib=" + t; e = document.getElementsByTagName("script")[0]; e.parentNode.insertBefore(n, e) };
    ttq.load(pixelId);
    ttq.page();
  }(window, document, "ttq");

  /* Espejo: lo que ftnTrack manda a Meta, también sale a TikTok.
     ViewContent lleva la variante como content_id; InitiateCheckout
     lleva el plan (mensual/trimestral), el valor y la moneda. */
  var base = window.ftnTrack;
  window.ftnTrack = function (eventName, params) {
    if (typeof base === "function") base(eventName, params);
    params = params || {};
    var ids = params.content_ids || [];
    var datos = {
      content_type: "product",
      contents: [{
        content_id: ids[0] || params.content_category || "reto-mas-musculo",
        content_name: params.content_name || "Reto Mas Musculo Menos Grasa",
        quantity: 1,
        price: params.value || 0
      }],
      currency: params.currency || "MXN"
    };
    if (params.value) datos.value = params.value;
    try { window.ttq.track(eventName, datos); console.info("[TikTok Pixel] " + eventName, datos); }
    catch (e) { console.warn("[TikTok Pixel] no se pudo enviar " + eventName, e); }
  };
})();
