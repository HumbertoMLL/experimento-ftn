/* Health Squad · lo editable está aquí arriba */
var HS = {
  // Link de pago de Hotmart (oferta Health Squad)
  checkoutUrl: "https://pay.hotmart.com/E108409744Y?off=xgn9rqus&checkoutMode=10",
  // Canales: brenvita.shop/health-squad-<canal> agrega &src=<canal> al checkout (faq = la página /health-squad-faq)
  canales: ["influencer", "meta", "webinar", "mail", "whatsapp", "faq"],
  // Sin canal en la URL (brenvita.shop/health-squad, la del QR) el checkout sale con este src
  srcDefault: "meta",
  // Black Friday: cierran inscripciones el sábado 28 de noviembre a las 23:59 (hora del centro de México, UTC-6)
  deadline: "2026-11-28T23:59:00-06:00",
  precio: 5997,
  // Si el precio de Black Friday es menor, pon aquí el precio anterior (ej. "$7,997") y sale tachado junto al precio
  precioAntes: ""
};

(function () {
  var track = function (ev, p) { if (typeof window.ftnTrack === "function") window.ftnTrack(ev, p); };

  // Botón de pago
  var cta = document.getElementById("cta-checkout");
  if (cta) {
    if (HS.checkoutUrl) {
      var m = location.pathname.match(/^\/health-squad-([a-z]+)\/?$/i);
      var src = (m && HS.canales.indexOf(m[1].toLowerCase()) > -1) ? m[1].toLowerCase() : (new URLSearchParams(location.search).get("src") || HS.srcDefault);
      var url = HS.checkoutUrl;
      if (src) url += (url.indexOf("?") > -1 ? "&" : "?") + "src=" + encodeURIComponent(src);
      cta.href = url;
    } else {
      // Sin link de pago todavía: el botón no lleva a ningún lado
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
    }
    cta.addEventListener("click", function () {
      track("InitiateCheckout", { value: HS.precio, currency: "MXN", content_name: "Health Squad" });
    });
  }

  // ViewContent cuando la oferta entra en pantalla (una vez)
  var oferta = document.getElementById("inscripcion");
  if (oferta && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { track("ViewContent", { content_name: "Health Squad", value: HS.precio, currency: "MXN" }); io.disconnect(); }
    }, { threshold: .3 });
    io.observe(oferta);
  }

  // Precio anterior tachado (opcional)
  if (HS.precioAntes) {
    document.querySelectorAll(".price-before").forEach(function (el) { el.textContent = HS.precioAntes; el.hidden = false; });
  }

  // Cuenta regresiva: barra roja de arriba + reloj de la oferta (.js-cierre / data-u).
  // También mueve el reloj viejo por id (#timer, #t-d…) que usa /health-squad-faq. Todo se oculta al pasar la fecha.
  var end = new Date(HS.deadline).getTime();
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".js-cierre, #timer"));
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function set(u, v) {
    document.querySelectorAll('[data-u="' + u + '"]').forEach(function (el) { el.textContent = v; });
    var old = document.getElementById("t-" + u);
    if (old) old.textContent = v;
  }
  function tick() {
    var left = end - Date.now();
    if (left <= 0) {
      boxes.forEach(function (b) { b.hidden = true; });
      document.body.classList.remove("bf-on");
      return;
    }
    boxes.forEach(function (b) { b.hidden = false; });
    document.body.classList.add("bf-on");
    var s = Math.floor(left / 1000);
    set("d", Math.floor(s / 86400));
    set("h", pad(Math.floor(s % 86400 / 3600)));
    set("m", pad(Math.floor(s % 3600 / 60)));
    set("s", pad(s % 60));
    setTimeout(tick, 1000);
  }
  tick();

  // CTA fijo en móvil: se esconde si hay cualquier otro botón a la vista o la oferta está en pantalla.
  // Regla: nunca botón sobre botón.
  var sticky = document.querySelector(".sticky");
  if (sticky) {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".btn"));
    var check = function () {
      var vh = window.innerHeight, margen = 110; // alto del sticky + aire
      var choca = targets.some(function (t) {
        var r = t.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh + margen;
      });
      if (oferta) {
        var o = oferta.getBoundingClientRect();
        if (o.top < vh && o.bottom > 0) choca = true;
      }
      sticky.classList.toggle("is-hidden", choca);
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  }
})();
