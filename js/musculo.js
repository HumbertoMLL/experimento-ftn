/* ============================================================
   RETO MÁS MÚSCULO, MENOS GRASA — video, checkout y eventos
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  /* La letra del test de titulos (si la pagina trae uno) viaja pegada a la
     variante, para que en el Administrador de eventos de Meta se puedan
     comparar los titulos sin que se mezclen los datos: reto-mas-musculo-a, -b, -c. */
  var variante = document.body.getAttribute("data-variante") || "musculo";
  if (window.FTN_TITULO) variante = variante + "-" + window.FTN_TITULO;
  var m = (cfg.musculo || {});

  /* ---------- Canal de origen ----------
     Se lee de ?src=meta o del final de la ruta (/reto-mas-musculo/meta),
     se guarda en sessionStorage por si la visitante navega y vuelve, y
     acaba como &src=<canal> en la URL de Hotmart. Solo se aceptan los
     canales de la lista en config: cualquier otra cosa se ignora. */
  var canales = m.canales || [];
  var canal = (location.search.match(/[?&]src=([\w-]+)/i) || [])[1]
           || (location.pathname.match(/\/([\w-]+)\/?$/) || [])[1] || "";
  canal = canal.toLowerCase();
  if (canales.indexOf(canal) === -1) {
    canal = "";
    try { canal = sessionStorage.getItem("ftn-canal") || ""; } catch (e) {}
    if (canales.indexOf(canal) === -1) canal = "";
  } else {
    try { sessionStorage.setItem("ftn-canal", canal); } catch (e) {}
  }
  document.body.setAttribute("data-canal", canal || "directo");

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

  /* ---------- Checkout: un boton por plan ---------- */
  var planes = m.checkout || {};
  document.querySelectorAll(".js-checkout").forEach(function (btn) {
    var plan = btn.getAttribute("data-plan") || "trimestral";
    var datos = planes[plan] || {};
    var url = (datos.url || "").trim();
    if (url && canal) url += (url.indexOf("?") === -1 ? "?" : "&") + "src=" + canal;
    if (url) btn.href = url;
    btn.addEventListener("click", function (e) {
      if (!url) e.preventDefault();          // sin URL todavía, no manda a ningún lado
      window.ftnTrack("InitiateCheckout", {
        content_name: datos.nombre || "Reto Mas Musculo Menos Grasa",
        content_category: variante,
        canal: canal || "directo",
        content_ids: [plan],
        value: datos.precio || 0,            // para que Meta pueda optimizar por valor
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
          canal: canal || "directo",
          currency: "MXN"
        });
        vc.disconnect();
      }
      /* threshold 0 a proposito: la seccion de oferta crece cuando se pegan
         bonos, precio y garantia, y con un porcentaje fijo podria no cumplirse
         nunca en una pantalla de telefono. El margen negativo pide que la
         oferta este de verdad en pantalla, no rozando el borde. */
    }, { threshold: 0, rootMargin: "-120px 0px -120px 0px" });
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
