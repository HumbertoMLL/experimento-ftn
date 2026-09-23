/* ============================================================
   MASTERCLASS — las cuatro paginas del registro
     /masterclass              opt-in, con el formulario embebido
     /masterclass-gracias      "revisa tu correo"  → Lead
     /masterclass-confirmacion "ya quedaste"       → CompleteRegistration
     /masterclass/oferta       la oferta del webinar
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var mc = cfg.masterclass || {};
  var variante = document.body.getAttribute("data-variante") || "masterclass";

  /* ---------- Fecha, hora y datos del correo salen del config ---------- */
  function pon(id, texto) {
    var el = document.getElementById(id);
    if (el && texto) el.textContent = texto;
  }
  pon("mc-fecha", mc.fechaTexto);
  pon("mc-hora", mc.horaTexto);
  var correo = mc.correo || {};
  pon("correo-de", correo.remitente);
  pon("correo-dir", correo.direccion);
  pon("correo-asunto", correo.asunto);

  /* ---------- Eventos de Meta ----------
     Dos eventos, uno por cada paso del registro:

       Lead                 · al mandar nombre y correo, o sea al caer en
                              /masterclass-gracias.
       CompleteRegistration · al terminar de verdad. Donde se cuenta lo
                              decide masterclass.eventoRegistro en
                              js/config.js: "boton" (clic en unirme al
                              grupo de WhatsApp) o "pagina" (abrir
                              /masterclass-confirmacion).

     El opt-in y la oferta no mandan nada al cargar: ahi solo va el
     PageView del <head>. */
  var porPagina = { "masterclass-gracias": "Lead" };
  if (mc.eventoRegistro !== "boton") porPagina["masterclass-confirmacion"] = "CompleteRegistration";
  if (porPagina[variante]) {
    window.ftnTrack(porPagina[variante], {
      content_name: "Masterclass 10 errores",
      content_category: variante
    });
  }

  /* ---------- Formulario embebido ----------
     El formulario vive en otro dominio, asi que no se puede medir su
     alto desde aqui: se toma de config. El enlace de abajo es la salida
     por si el navegador bloquea el embebido. */
  var propio = document.getElementById("form-propio");
  var cajaIframe = document.getElementById("caja-iframe");
  var iframe = document.getElementById("iframe-form");
  var url = (mc.formUrl || "").trim();
  var modo = mc.formModo === "propio" ? "propio" : "iframe";

  if (modo === "propio" && propio) {
    propio.hidden = false;
    /* La salida "abrelo en otra pestana" solo tiene sentido con el iframe:
       en el formulario propio no hay nada que se pueda bloquear. */
    var linea = document.getElementById("form-directo");
    if (linea && linea.parentNode) linea.parentNode.hidden = true;
    armarFormPropio(propio);
  } else if (cajaIframe && iframe) {
    cajaIframe.hidden = false;
    if (url) {
      iframe.src = url;
      iframe.style.height = (mc.formAlto || 470) + "px";
      var directo = document.getElementById("form-directo");
      if (directo) directo.href = url;
    } else {
      cajaIframe.innerHTML =
        '<p style="padding:24px;text-align:center">Falta conectar el formulario.</p>';
      console.warn("[Masterclass] Falta la URL del formulario. Pegala en js/config.js → masterclass.formUrl");
    }
  }

  /* El formulario propio manda a /api/registro, que es quien tiene la
     llave de Mailvio. Desde aqui nunca sale una llave: lo unico que
     viaja son los tres datos de quien se registra. */
  function armarFormPropio(form) {
    var caja = document.getElementById("error-form");
    var boton = form.querySelector("button[type=submit]");
    var textoBoton = boton ? boton.textContent : "";

    function falla(msg, campo) {
      if (caja) { caja.textContent = msg; caja.hidden = false; }
      if (campo) { campo.setAttribute("aria-invalid", "true"); campo.focus(); }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (caja) caja.hidden = true;
      form.querySelectorAll("input").forEach(function (i) { i.removeAttribute("aria-invalid"); });

      var nombre = form.nombre.value.trim();
      var email = form.email.value.trim();

      /* Las mismas tres validaciones corren otra vez en el servidor:
         lo que se valida en el navegador se puede saltar. */
      if (nombre.length < 2) return falla("Escribe tu nombre.", form.nombre);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return falla("Revisa tu correo: ahi te llega el enlace.", form.email);

      if (boton) { boton.disabled = true; boton.textContent = "Apartando tu lugar..."; }

      fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, email: email })
      }).then(function (r) {
        return r.json().catch(function () { return { ok: r.ok }; });
      }).then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.error) || "sin detalle");
        /* El Lead lo dispara la pagina de gracias, no esta. Aqui solo
           mandamos a quien se registro para alla. */
        location.href = mc.gracias || "/masterclass-gracias";
      }).catch(function (err) {
        console.error("[Masterclass] No se pudo registrar:", err);
        if (boton) { boton.disabled = false; boton.textContent = textoBoton; }
        /* Si algo se rompe del lado nuestro, el registro no se pierde: se
           cambia el formulario bonito por el de Mailvio ahi mismo, sin
           que tenga que ir a ninguna otra parte. Feo, pero funcionando. */
        if (caja) {
          caja.textContent = "Tuvimos un problema. Aparta tu lugar aqui abajo:";
          caja.hidden = false;
        }
        if (cajaIframe && iframe && url) {
          iframe.src = url;
          iframe.style.height = (mc.formAlto || 470) + "px";
          cajaIframe.hidden = false;
          form.querySelectorAll("label, button").forEach(function (e) { e.hidden = true; });
          cajaIframe.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  /* ---------- Grupo de WhatsApp ----------
     Solo en la pagina de confirmacion. Se marca como Contact, que es el
     evento estandar de Meta para este tipo de contacto. */
  var btnGrupo = document.getElementById("btn-grupo");
  if (btnGrupo) {
    var grupo = (mc.grupoWhatsapp || "").trim();
    if (grupo) {
      btnGrupo.href = grupo;
      btnGrupo.hidden = false;
      var nota = document.getElementById("nota-grupo");
      if (nota) nota.hidden = false;
      if (mc.eventoRegistro === "boton") {
        /* Una sola vez aunque le piquen dos: si regresan y vuelven a dar
           clic, Meta contaria dos registros de la misma persona. */
        var yaConto = false;
        btnGrupo.addEventListener("click", function () {
          if (yaConto) return;
          yaConto = true;
          window.ftnTrack("CompleteRegistration", {
            content_name: "Masterclass 10 errores",
            content_category: variante
          });
        });
      }
    } else {
      console.warn("[Masterclass] Falta el enlace del grupo. Pegalo en js/config.js → masterclass.grupoWhatsapp");
    }
  }

  /* ---------- Video de bienvenida ---------- */
  var marco = document.getElementById("video-marco");
  var secVideo = document.getElementById("sec-video");
  var vid = (mc.videoBienvenida || "").trim();
  /* Sin video no se pinta la seccion entera. Un marco vacio que dice
     "VIDEO" no es una promesa que se pueda cumplir. */
  if (marco && vid) {
    if (secVideo) secVideo.hidden = false;
    var ph = document.getElementById("video-ph");
    if (ph) ph.remove();
    var yt = vid.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    var vm = vid.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var el;
    if (yt || vm) {
      el = document.createElement("iframe");
      el.src = yt ? "https://www.youtube.com/embed/" + yt[1] + "?rel=0&modestbranding=1"
                  : "https://player.vimeo.com/video/" + vm[1] + "?badge=0&autopause=0&playsinline=1";
      el.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen";
      el.allowFullscreen = true;
      el.title = "Ale te da la bienvenida";
    } else {
      el = document.createElement("video");
      el.src = vid; el.controls = true; el.playsInline = true;
    }
    marco.appendChild(el);
  }

  /* ---------- Checkout de la oferta ---------- */
  var planes = mc.checkout || {};
  document.querySelectorAll(".js-mc-checkout").forEach(function (btn) {
    var plan = btn.getAttribute("data-plan") || "anual";
    var datos = planes[plan] || {};
    var u = (datos.url || "").trim();
    if (u) btn.href = u;
    btn.addEventListener("click", function (e) {
      if (!u) e.preventDefault();
      window.ftnTrack("InitiateCheckout", {
        content_name: datos.nombre || "FTN Masterclass",
        content_category: variante,
        content_ids: [plan],
        value: datos.precio || 0,
        currency: "MXN"
      });
    });
  });

  /* ---------- Cuenta regresiva al cierre de carrito ---------- */
  var cuenta = document.getElementById("cuenta");
  if (cuenta && mc.cierreISO) {
    var finC = new Date(mc.cierreISO).getTime();
    var pintar = function () {
      var falta = finC - Date.now();
      if (falta <= 0) { cuenta.innerHTML = "<div><b>0</b><span>cerrado</span></div>"; return; }
      var s = Math.floor(falta / 1000);
      var partes = [
        [Math.floor(s / 86400), "días"], [Math.floor(s / 3600) % 24, "horas"],
        [Math.floor(s / 60) % 60, "min"], [s % 60, "seg"]
      ];
      cuenta.innerHTML = partes.map(function (p) {
        return "<div><b>" + p[0] + "</b><span>" + p[1] + "</span></div>";
      }).join("");
    };
    pintar();
    setInterval(pintar, 1000);
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
