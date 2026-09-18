/* ============================================================
   LANDING POR PERSONA  (/reto-mas-musculo/<Nombre>)
   Una sola pagina para todas. El nombre sale de la URL y se pega como
   src= al checkout, para que Hotmart atribuya la venta.
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var rmm = cfg.retoMasMusculo || {};
  var personas = rmm.personas || {};

  /* ---------- De donde sale el nombre ----------
     Acepta las dos formas: /reto-mas-musculo/AleRivera (lo normal, via el
     rewrite de vercel.json) y ?src=AleRivera, que sirve para probar en
     local y para cuando alguien comparte el link con parametros. */
  function leerSrc() {
    var q = (location.search.match(/[?&]src=([^&]+)/) || [])[1];
    var ruta = location.pathname.replace(/\/+$/, "").split("/").pop();
    var candidatos = [q && decodeURIComponent(q), ruta];
    for (var i = 0; i < candidatos.length; i++) {
      var c = candidatos[i];
      if (!c) continue;
      /* Sin distinguir mayusculas: la gente escribe el link a mano. */
      for (var k in personas) {
        if (k.toLowerCase() === String(c).toLowerCase()) return k;
      }
    }
    return null;
  }

  var src = leerSrc();
  var persona = src ? personas[src] : null;
  var srcParaHotmart = src || rmm.srcPorDefecto || "organico";

  /* La variante de Meta lleva el nombre pegado, para poder separar en el
     Administrador de eventos cuanto trajo cada persona. */
  var variante = (document.body.getAttribute("data-variante") || "reto-mas-musculo") +
                 "-" + srcParaHotmart;
  document.body.setAttribute("data-src", srcParaHotmart);

  /* ---------- "Te invita ..." ---------- */
  if (persona && persona.nombre) {
    var prueba = document.getElementById("prueba-hero");
    if (prueba) {
      var quien = document.createElement("span");
      quien.className = "invita";
      quien.textContent = "Te invita " + persona.nombre;
      prueba.parentNode.insertBefore(quien, prueba);
    }
  }

  /* ---------- Checkout con el src pegado ---------- */
  var planes = rmm.checkout || {};
  document.querySelectorAll(".js-src-checkout").forEach(function (btn) {
    var plan = btn.getAttribute("data-plan") || "trimestral";
    var datos = planes[plan] || {};
    var base = (datos.base || "").trim();
    var url = base ? base + "&src=" + encodeURIComponent(srcParaHotmart) : "";
    if (url) btn.href = url;
    btn.addEventListener("click", function (e) {
      if (!url) e.preventDefault();
      window.ftnTrack("InitiateCheckout", {
        content_name: datos.nombre || "Reto Mas Musculo",
        content_category: variante,
        content_ids: [plan],
        value: datos.precio || 0,
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
