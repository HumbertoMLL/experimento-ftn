/* ============================================================
   MASTERCLASS — registro, oferta y cuenta regresiva
   ============================================================ */
(function () {
  var cfg = window.FTN_CONFIG || {};
  var mc = cfg.masterclass || {};
  var variante = document.body.getAttribute("data-variante") || "masterclass";

  /* ---------- La fecha y la hora salen del config ---------- */
  function pon(id, texto) {
    var el = document.getElementById(id);
    if (el && texto) el.textContent = texto;
  }
  pon("mc-fecha", mc.fechaTexto);
  pon("mc-hora", mc.horaTexto);

  /* ---------- Formulario de registro ----------
     El opt-in NO dispara el evento principal de Meta: el Lead vive en la
     pagina de gracias, para no contar como registro a quien solo abrio
     la pagina. */
  var form = document.getElementById("form-registro");
  var recado = document.getElementById("recado");

  function aviso(texto, mal) {
    if (!recado) return;
    recado.textContent = texto || "";
    recado.className = "recado" + (mal ? " mal" : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var datos = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        evento: "masterclass-10-errores",
        variante: variante,
        origen: location.href
      };

      if (!datos.nombre || !datos.email || !datos.whatsapp) {
        aviso("Falta llenar un campo.", true);
        return;
      }
      /* Validacion de correo a proposito floja: solo descarta lo que
         claramente no es un correo. Ser mas estricto rebota direcciones
         validas y cuesta registros. */
      if (datos.email.indexOf("@") < 1 || datos.email.indexOf(".") < 0) {
        aviso("Revisa tu correo, parece que le falta algo.", true);
        return;
      }
      /* Diez digitos es un celular en Mexico; se admiten mas por si viene
         con lada de pais. */
      if (datos.whatsapp.replace(/\D/g, "").length < 10) {
        aviso("Tu WhatsApp necesita 10 dígitos.", true);
        return;
      }

      var destino = (mc.formAction || "").trim();
      if (!destino) {
        aviso("El formulario todavía no está conectado. Avísale al equipo.", true);
        console.warn(
          "[Masterclass] Falta la URL del formulario. Pegala en " +
          "js/config.js → masterclass.formAction. Este registro NO se guardo:", datos
        );
        return;
      }

      var boton = form.querySelector("button[type=submit]");
      if (boton) { boton.disabled = true; boton.textContent = "Apartando tu lugar…"; }
      aviso("");

      fetch(destino, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("respuesta " + r.status);
          location.href = mc.gracias || "/masterclass/gracias/";
        })
        .catch(function (err) {
          console.error("[Masterclass] No se pudo enviar el registro:", err);
          aviso("No se pudo enviar. Inténtalo otra vez en un momento.", true);
          if (boton) { boton.disabled = false; boton.textContent = "Quiero mi lugar"; }
        });
    });
  }

  /* ---------- Checkout de la oferta ---------- */
  var planes = mc.checkout || {};
  document.querySelectorAll(".js-mc-checkout").forEach(function (btn) {
    var plan = btn.getAttribute("data-plan") || "anual";
    var datos = planes[plan] || {};
    var url = (datos.url || "").trim();
    if (url) btn.href = url;
    btn.addEventListener("click", function (e) {
      if (!url) e.preventDefault();
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
    var fin = new Date(mc.cierreISO).getTime();
    var pintar = function () {
      var falta = fin - Date.now();
      if (falta <= 0) { cuenta.innerHTML = "<div><b>0</b><span>cerrado</span></div>"; return; }
      var s = Math.floor(falta / 1000);
      var partes = [
        [Math.floor(s / 86400), "días"],
        [Math.floor(s / 3600) % 24, "horas"],
        [Math.floor(s / 60) % 60, "min"],
        [s % 60, "seg"]
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
