/* ============================================================
   CONFIGURACIÓN — Todo lo que se edita vive en este archivo.
   ============================================================ */
window.FTN_CONFIG = {
  /* --- Meta Pixel ---------------------------------------------------
     Pixel ID (solo números, como string).
     Si queda vacío, el pixel NO se carga y verás un aviso
     en la consola del navegador. */
  metaPixelId: "1645815772229731",

  /* --- Microsoft Clarity --------------------------------------------
     Si queda vacío, Clarity no se carga. */
  clarityId: "wrmiia5ld3",

  /* --- Checkout -----------------------------------------------------
     URLs a las que mandan los botones de compra.
     Si un plan tiene url vacía (""), su tarjeta se oculta sola. */
  checkout: {
    trimestral: {
      url: "https://pay.hotmart.com/T76408466K?checkoutMode=10&off=eg1lsunr&src=meta",
      nombre: "Reto 2% - Suscripción Trimestral",
      precio: 1197,
      moneda: "MXN",
    },
    mensual: {
      url: "",
      nombre: "Reto 2% - Suscripción Mensual",
      precio: 599,
      moneda: "MXN",
    },
  },

  /* El video de /reto-vsl es un embed de Vimeo en el HTML de esa pagina. */

  /* Checkout de /reto-vsl. Un plan sin url oculta su tarjeta. */
  checkoutVsl: {
    unico: {
      url: "https://pay.hotmart.com/T76408466K?checkoutMode=10&off=eg1lsunr&src=meta",
      nombre: "Reto 2% - Suscripcion Trimestral",
      precio: 1197,
      moneda: "MXN",
    },
    mensual: {
      url: "",
      nombre: "Reto 2% - Plan Full Mensual",
      precio: 599,
      moneda: "MXN",
    },
  },

  /* --- Reto Más Músculo, Menos Grasa (/musculo-v1 … v5) ---
     videoUrl: YouTube, Vimeo o un .mp4 directo.
     checkoutUrl: mientras esté vacía, los botones de compra no navegan. */
  musculo: {
    videoUrl: "",
    /* Los dos tickets del Reto Mas Musculo, Menos Grasa.
       Pega aqui el link de Hotmart de cada uno. Mientras esten vacios,
       el boton no manda a ningun lado pero el evento de Meta si se
       dispara, para no perder la senal de quien intento comprar. */
    checkout: {
      mensual:    { url: "", nombre: "Reto Mas Musculo - Mensual",    precio: 599 },
      trimestral: { url: "", nombre: "Reto Mas Musculo - Trimestral", precio: 1197 }
    }
  },

  /* --- Landings por persona (/reto-mas-musculo/<Nombre>) -------------
     Una sola pagina sirve a todas. El nombre sale de la URL, se valida
     contra esta lista y se pega como src= al checkout de Hotmart, para
     que la venta quede atribuida.

     Para dar de alta a alguien mas: agregala a `personas` y listo. No
     hace falta crear un archivo nuevo.

     >>> POR CONFIRMAR: cual codigo de oferta corresponde a cada plan.
     Los dos links que llegaron son estos, y no traen nada que diga cual
     es cual. Si estan al reves, alguien va a dar clic en $599 y le va a
     aparecer otro precio en Hotmart. Verificalo antes de mandar los
     links. <<< */
  retoMasMusculo: {
    personas: {
      DaniNajera: { nombre: "Dani N\u00e1jera" },
      AleRivera:  { nombre: "Ale Rivera" }
    },
    checkout: {
      mensual: {
        base: "https://pay.hotmart.com/T76408466K?off=6foo9x9h&checkoutMode=10&bid=1789422390667",
        nombre: "Reto Mas Musculo - Mensual",
        precio: 599
      },
      trimestral: {
        base: "https://pay.hotmart.com/T76408466K?off=39iewqaz&checkoutMode=10&bid=1789422393380",
        nombre: "Reto Mas Musculo - Trimestral",
        precio: 1197
      }
    },
    /* A donde cae quien llegue sin nombre valido en la URL. */
    srcPorDefecto: "organico"
  },

  /* --- Masterclass (/masterclass) ------------------------------------
     Webinar de venta directa con Ale Rivera. Toda la fecha del evento se
     edita aqui: la landing, la pagina de oferta y la cuenta regresiva
     leen de estos campos. */
  masterclass: {
    fechaTexto: "Jueves 24 de septiembre",
    horaTexto: "7:00 PM, hora CDMX",
    /* Inicio del webinar en UTC: 24 sep 2026, 19:00 CDMX (UTC-6). */
    inicioISO: "2026-09-25T01:00:00Z",
    /* Cierre de carrito: domingo 27 sep, 23:59 CDMX. */
    cierreISO: "2026-09-28T05:59:00Z",

    /* A donde manda el formulario de registro. Acepta cualquier webhook
       que reciba JSON (Make, Zapier, n8n, tu backend). Mientras este
       vacio el formulario NO envia y avisa en consola, para no perder
       registros en silencio. */
    formAction: "",
    /* A donde se manda a la persona despues de registrarse. El evento
       Lead de Meta se dispara ahi, nunca en el opt-in. */
    gracias: "/masterclass/gracias/",

    /* La oferta que se abre DENTRO del webinar. Los precios de arriba no
       se muestran en la landing de registro a proposito. */
    checkout: {
      anual:   { url: "", nombre: "FTN Anual - Masterclass", precio: 3696 },
      mensual: { url: "", nombre: "FTN Mensual",             precio: 599  }
    },
    /* 12 meses al precio publico de $599. Es el ancla del anual. */
    anclaAnual: 7188,
    /* Cupos de la mentoria 1 a 1 con Ale. */
    cuposMentoria: 10
  },

  /* --- Fechas -------------------------------------------------------
     Deadline del regalo: 16 de agosto 2026, 11:59 PM CDMX (UTC-6).
     Si ya pasó, el countdown y el aviso rojo se ocultan solos. */
  deadlineRegalo: "2026-08-17T05:59:00Z",

  /* --- WhatsApp ----------------------------------------------------- */
  whatsapp: "https://api.whatsapp.com/send?phone=5214491440238",

  /* --- Imágenes ------------------------------------------------------
     Pega la URL de cada imagen. Si una queda vacía (""), ese bloque
     se oculta solo y la página sigue funcionando. */
  imagenes: {
    logo: "",
    /* Versiones optimizadas (webp, ~90% más ligeras) de las originales
       en el S3 de FTN (bren_landings/hero_banner_two.png, etc.) */
    banner: "/assets/hero-banner.webp",
    /* Mockup del producto (pantallas + menú + lista): se muestra
       arriba de "Esto recibes al unirte al Reto 2%". */
    mockup: "/assets/mockup.webp",
    /* Una sola imagen con TODAS las transformaciones (el grid 3x3).
       Si tiene URL, se usa en lugar de las fotos individuales de abajo. */
    cambiosGrid: "/assets/transformaciones.webp",
    /* Logo de Reto 2% para el hero de /reto-vsl. Vacio = se usa el texto. */
    logoReto2: "/assets/logo-reto-2.svg",
    /* Fotos de Emma en /reto-vsl (antes / después). Vacías = se oculta el par. */
    emmaAntes: "/assets/historia-antes.webp",
    emmaDespues: "/assets/historia-despues.webp",
    chatRecibido: "",
    chatEnviado: "",
    bren: "",
    cambios: [
      { url: "", alt: "Mamá de 3 hijos, trabaja más de 8 horas" },
      { url: "", alt: "Casada y trabaja tiempo completo en una oficina" },
      { url: "", alt: "Mamá soltera de un bebé y emprendedora" },
      { url: "", alt: "Profesionista con agenda apretada y dos adolescentes" },
      { url: "", alt: "Muchas reuniones y poco tiempo para ella" },
      { url: "", alt: "Más de 40 y dos negocios propios" },
    ],
  },
};
