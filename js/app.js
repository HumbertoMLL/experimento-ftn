/* ============================================================
   RETO 2% — Lógica de la página
   (imágenes desde config, countdown, checkout + eventos de Meta,
   reveal on scroll, sticky CTA)
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG;

  /* ---------- Imágenes desde config ---------- */
  document.querySelectorAll("[data-cfg-img]").forEach(function (img) {
    var key = img.getAttribute("data-cfg-img");
    var url = (cfg.imagenes[key] || "").trim();
    if (url) {
      img.src = url;
    } else {
      /* Sin URL: se oculta el bloque para que la página no se rompa */
      var wrap = img.closest("[data-img-wrap='" + key + "']") || img;
      wrap.style.display = "none";
    }
  });

  /* Grid de cambios (fotos de transformaciones).
     Si hay imagen compuesta (cambiosGrid), sustituye a las individuales. */
  var grid = document.getElementById("grid-cambios");
  var fotos = (cfg.imagenes.cambios || []).filter(function (c) {
    return (c.url || "").trim();
  });
  if ((cfg.imagenes.cambiosGrid || "").trim()) fotos = [];
  if (fotos.length) {
    fotos.forEach(function (c) {
      var fig = document.createElement("figure");
      fig.className = "r2-foto";
      var im = document.createElement("img");
      im.src = c.url;
      im.alt = c.alt || "";
      im.loading = "lazy";
      fig.appendChild(im);
      grid.appendChild(fig);
    });
  } else {
    grid.style.display = "none";
  }

  /* ---------- WhatsApp ---------- */
  var wa = document.getElementById("link-whatsapp");
  if (wa) wa.href = cfg.whatsapp;

  /* ---------- Checkout + evento InitiateCheckout ----------
     Un plan sin URL oculta su tarjeta completa. */
  var visibles = 0;
  document.querySelectorAll(".js-checkout").forEach(function (btn) {
    var plan = cfg.checkout[btn.getAttribute("data-plan")];
    var url = plan ? (plan.url || "").trim() : "";
    if (!url) {
      var card = btn.closest(".r2-plan");
      if (card) card.style.display = "none";
      return;
    }
    visibles++;
    btn.href = url;
    btn.addEventListener("click", function () {
      /* fbq usa sendBeacon: el evento sale aunque la página navegue */
      window.ftnTrack("InitiateCheckout", {
        content_name: plan.nombre,
        content_category: "suscripcion",
        value: plan.precio,
        currency: plan.moneda,
        num_items: 1,
      });
    });
  });

  /* Con un solo plan visible: tarjeta centrada y sticky con su precio */
  if (visibles === 1) {
    var planesGrid = document.querySelector(".r2-planes");
    if (planesGrid) {
      planesGrid.style.gridTemplateColumns = "1fr";
      planesGrid.style.maxWidth = "480px";
      planesGrid.style.marginLeft = "auto";
      planesGrid.style.marginRight = "auto";
    }
    var stickyPrecio = document.querySelector("#sticky-cta .txt b");
    if (stickyPrecio && !(cfg.checkout.mensual.url || "").trim()) {
      stickyPrecio.textContent = "Desde $1,197 MXN al trimestre";
    }
  }

  /* ViewContent cuando la sección de planes entra a pantalla (una vez) */
  var planes = document.getElementById("planes");
  if (planes && "IntersectionObserver" in window) {
    var vcObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        window.ftnTrack("ViewContent", {
          content_name: "Reto 2% - Planes",
          content_category: "suscripcion",
          currency: "MXN",
        });
        vcObs.disconnect();
      }
    }, { threshold: 0.3 });
    vcObs.observe(planes);
  }

  /* ---------- Countdown del regalo ---------- */
  var deadline = new Date(cfg.deadlineRegalo).getTime();
  var aviso = document.getElementById("aviso-regalo");
  var avisoTxt = document.getElementById("timer-inline-txt");
  var timer = document.getElementById("timer-regalo");
  var boxes = timer
    ? { d: timer.querySelector("[data-t='d']"), h: timer.querySelector("[data-t='h']"), m: timer.querySelector("[data-t='m']"), s: timer.querySelector("[data-t='s']") }
    : null;
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var intervalId = null;

  function tick() {
    var left = Math.max(0, deadline - Date.now());
    if (left <= 0) {
      if (aviso) aviso.hidden = true;
      if (timer) timer.hidden = true;
      if (intervalId) clearInterval(intervalId);
      return;
    }
    var t = Math.floor(left / 1000);
    var d = Math.floor(t / 86400);
    var h = Math.floor((t % 86400) / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = t % 60;
    if (aviso) aviso.hidden = false;
    if (avisoTxt) avisoTxt.textContent = "Cierra en " + d + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
    if (timer) {
      timer.hidden = false;
      boxes.d.textContent = pad(d);
      boxes.h.textContent = pad(h);
      boxes.m.textContent = pad(m);
      boxes.s.textContent = pad(s);
    }
  }
  tick();
  if (deadline - Date.now() > 0) intervalId = setInterval(tick, 1000);

  /* ---------- Reveal on scroll ----------
     Margen amplio + plazo de gracia: con scroll rapido el observer puede no
     alcanzar a disparar y el contenido se quedaria invisible. */
  var reveals = document.querySelectorAll(".reveal");
  function revelarTodo() { reveals.forEach(function (el) { el.classList.add("is-visible"); }); }
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js");
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "400px 0px 400px 0px" });
    reveals.forEach(function (el) { revObs.observe(el); });
    setTimeout(revelarTodo, 2500);
    window.addEventListener("load", function () { setTimeout(revelarTodo, 1200); });
  }

  /* ---------- Sticky CTA (se esconde sobre la oferta) ---------- */
  var sticky = document.getElementById("sticky-cta");
  var oferta = document.getElementById("oferta");
  if (sticky && oferta && "IntersectionObserver" in window) {
    var stObs = new IntersectionObserver(function (entries) {
      sticky.classList.toggle("hide", entries[0].isIntersecting);
    }, { threshold: 0.05 });
    stObs.observe(oferta);
  }
})();
