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

  /* ---------- Reloj de los regalos ----------
     Cuenta hacia el cierre del ciclo en curso (config: musculo.reloj).
     El ancla es una medianoche de CDMX (UTC-6, Mexico ya no cambia de
     horario), asi que con 24 horas vence cada noche a medianoche. */
  var relojes = document.querySelectorAll(".js-reloj");
  var horas = +((m.reloj || {}).cadaHoras) || 0;
  if (relojes.length && horas > 0) {
    var ancla = Date.parse("2026-01-01T06:00:00Z");
    var ciclo = horas * 36e5;
    var dos = function (n) { return (n < 10 ? "0" : "") + n; };
    var pinta = function () {
      var ahora = Date.now();
      var vence = ancla + (Math.floor((ahora - ancla) / ciclo) + 1) * ciclo;
      var s = Math.floor((vence - ahora) / 1000);
      var txt = dos(Math.floor(s / 3600)) + ":" + dos(Math.floor(s / 60) % 60) + ":" + dos(s % 60);
      relojes.forEach(function (r) { r.querySelector(".js-reloj-t").textContent = txt; });
    };
    pinta();
    relojes.forEach(function (r) { r.hidden = false; });
    setInterval(pinta, 1000);
  }

  /* ---------- Cuenta regresiva al inicio de la generacion ---------- */
  var cuentas = document.querySelectorAll(".js-inicio");
  var inicio = Date.parse(m.inicioISO || "");
  if (cuentas.length && inicio) {
    var pintaInicio = function () {
      var s = Math.floor((inicio - Date.now()) / 1000);
      cuentas.forEach(function (c) {
        if (s <= 0) { c.hidden = true; return; }
        var val = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60 };
        c.querySelectorAll("[data-u]").forEach(function (b) {
          var n = val[b.getAttribute("data-u")];
          b.textContent = (n < 10 ? "0" : "") + n;
        });
        c.hidden = false;
      });
    };
    pintaInicio();
    setInterval(pintaInicio, 20000);
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
