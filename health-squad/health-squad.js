/* Health Squad · lo editable está aquí arriba */
var HS = {
  // Link de pago (Hotmart u otro). Mientras esté vacío, el botón lleva a WhatsApp o se queda en la oferta.
  checkoutUrl: "",
  // Precio y bonos vencen el lunes 16 de noviembre a las 23:59 (hora del centro de México, UTC-6)
  deadline: "2026-11-16T23:59:00-06:00",
  precio: 4997
};

(function () {
  var track = function (ev, p) { if (typeof window.ftnTrack === "function") window.ftnTrack(ev, p); };

  // Botón de pago
  var cta = document.getElementById("cta-checkout");
  if (cta) {
    if (HS.checkoutUrl) {
      var src = new URLSearchParams(location.search).get("src");
      var url = HS.checkoutUrl;
      if (src) url += (url.indexOf("?") > -1 ? "&" : "?") + "src=" + encodeURIComponent(src);
      cta.href = url;
    } else {
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
      cta.textContent = "Inscripciones abren muy pronto";
      cta.style.opacity = ".6";
      cta.style.pointerEvents = "none";
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

  // CTA fijo en móvil: se esconde cuando la oferta está a la vista
  var sticky = document.querySelector(".sticky");
  if (sticky && oferta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      sticky.classList.toggle("is-hidden", es[0].isIntersecting);
    }).observe(oferta);
  }
})();
