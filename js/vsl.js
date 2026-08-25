/* ============================================================
   RETO 2% · VSL — video, imágenes, checkout y eventos de Meta
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};

  /* El video (embed de Vimeo) vive directo en el HTML del hero. */

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
