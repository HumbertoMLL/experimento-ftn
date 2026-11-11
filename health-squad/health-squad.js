/* Health Squad · lo editable está aquí arriba */
var HS = {
  // Link de pago de Hotmart (oferta Health Squad)
  checkoutUrl: "https://pay.hotmart.com/E108409744Y?off=h37ryq9d&checkoutMode=10&bid=1794352087533",
  // Canales: brenvita.shop/health-squad-<canal> agrega &src=<canal> al checkout
  canales: ["influencer", "meta", "webinar", "mail", "whatsapp"],
  // Precio y bonos vencen el lunes 16 de noviembre a las 23:59 (hora del centro de México, UTC-6)
  deadline: "2026-11-16T23:59:00-06:00",
  precio: 4997,
  // Bono de acción rápida: cuántos de los 20 lugares quedan. Actualízalo a mano conforme entren ventas.
  lugaresRestantes: 20
};

(function () {
  var track = function (ev, p) { if (typeof window.ftnTrack === "function") window.ftnTrack(ev, p); };

  // Botón de pago
  var cta = document.getElementById("cta-checkout");
  if (cta) {
    if (HS.checkoutUrl) {
      var m = location.pathname.match(/^\/health-squad-([a-z]+)\/?$/i);
      var src = (m && HS.canales.indexOf(m[1].toLowerCase()) > -1) ? m[1].toLowerCase() : new URLSearchParams(location.search).get("src");
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

  // Lugares del bono de los primeros 20
  var quedan = Math.max(0, Math.min(20, HS.lugaresRestantes));
  ["spots-n", "spots-n2", "spots-n3"].forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = quedan; });
  ["spots-fill", "spots-fill2"].forEach(function (id) { var el = document.getElementById(id); if (el) el.style.width = (quedan / 20 * 100) + "%"; });

  // Cuenta regresiva: se oculta sola cuando pasa la fecha
  var end = new Date(HS.deadline).getTime();
  var box = document.getElementById("timer");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var left = end - Date.now();
    if (!box || left <= 0) { if (box) box.hidden = true; return; }
    box.hidden = false;
    var s = Math.floor(left / 1000);
    document.getElementById("t-d").textContent = Math.floor(s / 86400);
    document.getElementById("t-h").textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById("t-m").textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById("t-s").textContent = pad(s % 60);
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
