/* ============================================================
   RETO MÁS MÚSCULO, MENOS GRASA — video, checkout y eventos
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var variante = document.body.getAttribute("data-variante") || "musculo";
  var m = (cfg.musculo || {});

  /* ---------- Video (si hay URL en config) ---------- */
  var marco = document.getElementById("video-marco");
  var url = (m.videoUrl || "").trim();
  if (marco && url) {
    var ph = document.getElementById("video-ph");
    if (ph) ph.remove();
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var el;
    if (yt || vm) {
      el = document.createElement("iframe");
      el.src = yt ? "https://www.youtube.com/embed/" + yt[1] + "?rel=0&modestbranding=1"
                  : "https://player.vimeo.com/video/" + vm[1] + "?badge=0&autopause=0&playsinline=1";
      el.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen";
      el.allowFullscreen = true;
      el.title = "Reto Más Músculo, Menos Grasa";
    } else {
      el = document.createElement("video");
      el.src = url; el.controls = true; el.playsInline = true;
    }
    marco.appendChild(el);
  }

  /* ---------- Checkout ---------- */
  var checkout = (m.checkoutUrl || "").trim();
  document.querySelectorAll(".js-checkout").forEach(function (btn) {
    if (checkout) btn.href = checkout;
    btn.addEventListener("click", function (e) {
      if (!checkout) e.preventDefault();     // sin URL todavía, no manda a ningún lado
      window.ftnTrack("InitiateCheckout", {
        content_name: "Reto Mas Musculo Menos Grasa",
        content_category: variante,
        currency: "MXN"
      });
    });
  });

  /* ---------- ViewContent al llegar a la oferta ---------- */
  var oferta = document.getElementById("oferta");
  if (oferta && "IntersectionObserver" in window) {
    var vc = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) {
        window.ftnTrack("ViewContent", {
          content_name: "Reto Mas Musculo - Oferta",
          content_category: variante,
          currency: "MXN"
        });
        vc.disconnect();
      }
    }, { threshold: 0.3 });
    vc.observe(oferta);
  }

  /* ---------- Reveal a prueba de fallos ---------- */
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
