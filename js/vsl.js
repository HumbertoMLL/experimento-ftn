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
      /* Declarar el tamano evita que la pagina brinque al cargar la imagen
         (y que un salto de ancla aterrice en el lugar equivocado). */
      var medidas = { logoReto2: [900, 506], emmaAntes: [634, 828], emmaDespues: [644, 832] }[key];
      if (medidas && !img.getAttribute("width")) {
        img.setAttribute("width", medidas[0]);
        img.setAttribute("height", medidas[1]);
      }
      img.src = src;
    } else if (!img.getAttribute("src")) {
      var wrap = img.closest("[data-img-wrap='" + key + "']") || img;
      wrap.style.display = "none";
    }
  });
  /* Si ninguna foto de Emma tiene URL, se oculta el par completo */
  var emma = document.getElementById("emma-fotos");
  if (emma && !emma.querySelector("figure:not([style*='none'])")) emma.style.display = "none";

  /* ---------- Logo del hero (si hay URL sustituye al texto) ---------- */
  var logo = document.querySelector("[data-cfg-img='logoReto2']");
  if (logo && logo.getAttribute("src")) {
    logo.hidden = false;
    var marca = document.getElementById("marca");
    marca.classList.add("con-logo");
    marca.querySelector(".badge-txt").remove();
  }

  /* ---------- WhatsApp ---------- */
  var wa = document.getElementById("wa-link");
  if (wa && cfg.whatsapp) wa.href = cfg.whatsapp;

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

  /* ---------- Barra fija: aparece al pasar el hero ---------- */
  var sticky = document.querySelector(".sticky");
  var hero = document.querySelector(".hero");
  if (sticky && hero) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        sticky.classList.toggle("visible", !e[0].isIntersecting);
      }, { threshold: 0 }).observe(hero);
    } else {
      sticky.classList.add("visible");
    }
  }

  /* ---------- Reveal al hacer scroll ----------
     Con scroll rapido el observer puede no alcanzar a disparar, asi que:
     margen amplio para adelantarlo + un plazo de gracia que revela lo que
     quede pendiente. El contenido nunca se queda invisible. */
  var rev = document.querySelectorAll(".reveal");
  function revelarTodo() { rev.forEach(function (el) { el.classList.add("on"); }); }
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js");
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); ro.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: "400px 0px 400px 0px" });
    rev.forEach(function (el) { ro.observe(el); });
    setTimeout(revelarTodo, 2500);
    window.addEventListener("load", function () { setTimeout(revelarTodo, 1200); });
  }

})();
