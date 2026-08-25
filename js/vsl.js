/* ============================================================
   RETO 2% · VSL — video, imágenes, checkout y eventos de Meta
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var vsl = cfg.vsl || {};

  /* ---------- Video ---------- */
  var frame = document.getElementById("vsl-frame");
  var url = (vsl.videoUrl || "").trim();
  if (frame && url) {
    document.getElementById("vsl-ph").remove();
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var el;
    if (yt) {
      el = document.createElement("iframe");
      el.src = "https://www.youtube.com/embed/" + yt[1] + "?rel=0&modestbranding=1";
      el.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
      el.allowFullscreen = true;
      el.title = "Reto 2%";
    } else if (vm) {
      el = document.createElement("iframe");
      el.src = "https://player.vimeo.com/video/" + vm[1];
      el.allow = "autoplay; fullscreen; picture-in-picture";
      el.allowFullscreen = true;
      el.title = "Reto 2%";
    } else {
      el = document.createElement("video");
      el.src = url;
      el.controls = true;
      el.playsInline = true;
      if (vsl.poster) el.poster = vsl.poster;
    }
    frame.appendChild(el);
  }

  /* ---------- Imágenes desde config (las vacías ocultan su bloque) ---------- */
  document.querySelectorAll("[data-cfg-img]").forEach(function (img) {
    var key = img.getAttribute("data-cfg-img");
    var src = ((cfg.imagenes || {})[key] || "").trim();
    if (src) {
      img.src = src;
    } else if (!img.getAttribute("src")) {
      var wrap = img.closest("[data-img-wrap='" + key + "']") || img;
      wrap.style.display = "none";
    }
  });
  /* Si ninguna foto de Emma tiene URL, se oculta el par completo */
  var emma = document.getElementById("emma-fotos");
  if (emma && !emma.querySelector("figure:not([style*='none'])")) emma.style.display = "none";

  /* ---------- WhatsApp ---------- */
  var wa = document.getElementById("wa-link");
  if (wa && cfg.whatsapp) { wa.href = cfg.whatsapp; wa.textContent = cfg.whatsapp; }

  /* ---------- Checkout + InitiateCheckout ---------- */
  var visibles = 0;
  document.querySelectorAll(".js-checkout").forEach(function (btn) {
    var plan = (cfg.checkoutVsl || {})[btn.getAttribute("data-plan")];
    var href = plan ? (plan.url || "").trim() : "";
    if (!href) {
      var card = btn.closest(".plan");
      if (card) card.style.display = "none";
      return;
    }
    visibles++;
    btn.href = href;
    btn.addEventListener("click", function () {
      window.ftnTrack("InitiateCheckout", {
        content_name: plan.nombre,
        content_category: "reto-vsl",
        value: plan.precio,
        currency: plan.moneda,
        num_items: 1
      });
    });
  });
  if (visibles === 1) {
    var g = document.querySelector(".planes");
    if (g) { g.style.gridTemplateColumns = "1fr"; g.style.maxWidth = "460px"; g.style.margin = "30px auto 0"; }
  }

  /* ---------- ViewContent al ver la oferta (una vez) ---------- */
  var oferta = document.getElementById("oferta");
  if (oferta && "IntersectionObserver" in window) {
    var vc = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) {
        window.ftnTrack("ViewContent", {
          content_name: "Reto 2% - Oferta (VSL)",
          content_category: "reto-vsl",
          currency: "MXN"
        });
        vc.disconnect();
      }
    }, { threshold: 0.3 });
    vc.observe(oferta);
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); ro.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rev.forEach(function (el) { ro.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add("on"); });
  }
})();
