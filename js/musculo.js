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
  var personas = m.personas || {};
  var crudo = ((location.search.match(/[?&]src=([\w-]+)/i) || [])[1]
            || (location.pathname.match(/\/([\w-]+)\/?$/) || [])[1] || "").toLowerCase();

  /* Una persona es un canal con nombre propio: el src que viaja a Hotmart
     conserva sus mayusculas y la landing la saluda. */
  var persona = personas[crudo] || null;
  var canal = persona ? persona.src : (canales.indexOf(crudo) !== -1 ? crudo : "");

  if (canal) {
    try { sessionStorage.setItem("ftn-canal", canal); } catch (e) {}
  } else {
    try { canal = sessionStorage.getItem("ftn-canal") || ""; } catch (e) {}
    /* Lo guardado tambien se valida: si ya no esta dado de alta, se ignora. */
    if (canal && canales.indexOf(canal.toLowerCase()) === -1 && !personas[canal.toLowerCase()]) canal = "";
  }
  document.body.setAttribute("data-canal", canal || "directo");

  /* ---------- Te invita ... ---------- */
  if (persona && persona.nombre) {
    var anclaPrueba = document.querySelector(".hero .prueba");
    if (anclaPrueba) {
      var chip = document.createElement("span");
      chip.className = "invita";
      chip.textContent = "Te invita " + persona.nombre;
      anclaPrueba.parentNode.insertBefore(chip, anclaPrueba);
    }
  }

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

  /* ---------- Motivo del dia (config: musculo.motivos) ----------
     Por que hoy los regalos son gratis, con la fecha de CDMX (UTC-6). */
  var hoy = new Date(Date.now() - 6 * 36e5).toISOString().slice(0, 10);
  var mot = (m.motivos || {})[hoy];
  if (mot && mot.motivo) {
    var txtMot = (mot.emoji ? mot.emoji + " " : "") + "Hoy tus regalos son gratis por " + mot.motivo;
    document.querySelectorAll(".js-motivo").forEach(function (el) { el.textContent = txtMot; el.hidden = false; });
  }

  /* ---------- Cierre de inscripciones (config: musculo.cierreISO) ----------
     Reloj grande en la oferta y barra fija abajo. La barra se esconde
     mientras el reloj grande o los precios estan en pantalla. Al llegar
     a cero desaparecen los dos. */
  var cierre = Date.parse(m.cierreISO || "");
  var cierres = document.querySelectorAll(".js-cierre");
  var barra = document.querySelector(".sticky-cierre");
  if (cierres.length && cierre) {
    var dos = function (n) { return (n < 10 ? "0" : "") + n; };
    var tic;
    var pintaCierre = function () {
      var s = Math.floor((cierre - Date.now()) / 1000);
      if (s <= 0) {
        cierres.forEach(function (c) { c.hidden = true; });
        document.body.classList.remove("con-sticky");
        clearInterval(tic);
        return;
      }
      var u = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
      document.querySelectorAll(".js-cierre [data-u]").forEach(function (b) { b.textContent = dos(u[b.getAttribute("data-u")]); });
      var corto = (u.d ? u.d + (u.d === 1 ? " día " : " días ") : "") + dos(u.h) + ":" + dos(u.m) + ":" + dos(u.s);
      document.querySelectorAll(".js-cierre-txt").forEach(function (b) { b.textContent = corto; });
      cierres.forEach(function (c) { c.hidden = false; });
    };
    pintaCierre();
    tic = setInterval(pintaCierre, 1000);

    if (barra && Date.now() < cierre) {
      document.body.classList.add("con-sticky");
      var vistos = [document.querySelector(".cierre"), document.getElementById("precio")].filter(Boolean);
      if (vistos.length && "IntersectionObserver" in window) {
        var enPantalla = [];
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { enPantalla[vistos.indexOf(e.target)] = e.isIntersecting; });
          barra.classList.toggle("fuera", enPantalla.some(Boolean));
        }, { threshold: 0 });
        vistos.forEach(function (el) { io.observe(el); });
      }
    }
  }

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
