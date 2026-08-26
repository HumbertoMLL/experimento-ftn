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
      nombre: "Reto 2% - Pago unico",
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
    logoReto2: "/assets/logo-reto-2.webp",
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
