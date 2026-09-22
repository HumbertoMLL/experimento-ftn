/* ============================================================
   CONFIGURACIÓN — Todo lo que se edita vive en este archivo.
   ============================================================ */
window.FTN_CONFIG = {
  /* --- Meta Pixel ---------------------------------------------------
     Pixel ID (solo números, como string).
     Si queda vacío, el pixel NO se carga y verás un aviso
     en la consola del navegador. */
  metaPixelId: "1645815772229731",

  /* --- TikTok Pixel ----------------------------------------------
     Solo se carga en las landings de músculo (js/tiktok.js).
     Si queda vacío, no se carga. */
  tiktokPixelId: "D3U0UR3C77U1N95E9TK0",

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

  /* --- Reto Más Músculo, Menos Grasa (/reto-mas-musculo, /musculo-v5, v6) ---
     videoUrl: YouTube, Vimeo o un .mp4 directo.

     Canales: cada landing se abre con ?src=meta (o /reto-mas-musculo/meta)
     y el canal viaja hasta Hotmart como &src=meta en la URL del checkout,
     para que en Hotmart se vea de dónde vino cada venta. Si la página se
     abre sin canal, el checkout va sin src. Los eventos de Meta también
     llevan el canal en el parámetro "canal". */
  musculo: {
    videoUrl: "",
    canales: ["meta", "influencer", "instagram", "email", "whatsapp"],
    /* Personas que reparten su propio link: /reto-mas-musculo/<Nombre>.
       Funcionan igual que un canal, con dos diferencias: el src que
       viaja a Hotmart conserva las mayusculas tal como las pidio
       Hotmart, y la landing saluda con su nombre. La llave va en
       minusculas porque la URL se lee sin distinguir mayusculas.
       Para dar de alta a alguien mas, agrega un renglon aqui. */
    personas: {
      daninajera: { src: "DaniNajera", nombre: "Dani N\u00e1jera" },
      alerivera:  { src: "AleRivera",  nombre: "Ale Rivera" }
    },
    /* Los dos tickets, cada uno con su oferta de Hotmart (off= y bid=).
       El &src=<canal> se agrega solo en js/musculo.js. */
    checkout: {
      mensual: {
        url: "https://pay.hotmart.com/T76408466K?off=6foo9x9h&checkoutMode=10&bid=1789422390667",
        nombre: "Reto Mas Musculo - Mensual", precio: 599
      },
      trimestral: {
        url: "https://pay.hotmart.com/T76408466K?off=39iewqaz&checkoutMode=10&bid=1789422393380",
        nombre: "Reto Mas Musculo - Trimestral", precio: 1197
      }
    }
  },

  /* --- Masterclass (/masterclass) ------------------------------------
     Webinar de venta directa con Ale Rivera. Toda la fecha del evento se
     edita aqui: la landing, la pagina de oferta y la cuenta regresiva
     leen de estos campos. */
  masterclass: {
    fechaTexto: "Miércoles 30 de septiembre",
    horaTexto: "7:00 PM, hora CDMX",
    /* Inicio del webinar en UTC: 30 sep 2026, 19:00 CDMX (UTC-6). */
    inicioISO: "2026-10-01T01:00:00Z",
    /* Cierre de carrito: domingo 27 sep, 23:59 CDMX. */
    cierreISO: "2026-09-28T05:59:00Z",

    /* El formulario de registro vive en la plataforma de Healthyvita y se
       embebe con un iframe: asi es ella la que guarda el registro y la
       que manda el correo de confirmacion. Si algun dia cambia, se
       cambia aqui nada mas.
       Debajo del iframe queda un enlace a la misma URL, por si el
       navegador bloquea el embebido. */
    formUrl: "https://mptrack.healthyvita.mx/form?am=43289&fid=64051&host=true",
    /* Hay dos maneras de captar el registro y esta linea decide cual sale:
         "iframe" · el formulario embebido de Mailvio. Es lo que esta vivo.
                    No se le puede tocar el diseno: vive en otro dominio.
         "propio" · nuestro formulario, con nuestra tipografia, nuestros
                    colores y el campo de WhatsApp. Pega a /api/registro,
                    que es quien habla con Mailvio con la llave guardada
                    del lado del servidor.
       Para pasar a "propio" hacen falta las tres variables de entorno en
       Vercel: MAILVIO_ENDPOINT, MAILVIO_TOKEN y MAILVIO_LISTA. Mientras
       no esten, dejalo en "iframe" o los registros se pierden. */
    formModo: "iframe",
    /* Lada que se pone sola delante del WhatsApp en el formulario propio */
    lada: "+52",
    /* Alto del iframe. El formulario de Mailvio con dos campos mide unos
       190px; si le agregas el campo de WhatsApp, subelo a ~260. */
    formAlto: 200,
    /* El registro es de doble confirmacion, asi que son dos paginas:
       - gracias: cae aqui al mandar el formulario. Dice que revise su
         correo. Aqui se dispara el Lead de Meta.
       - confirmacion: cae aqui al dar clic en el correo. Ya quedo
         registrada. Aqui se dispara CompleteRegistration.
       En el opt-in no se dispara ninguno de los dos, a proposito. */
    /* Grupo de WhatsApp al que entra quien ya confirmo su registro. Si se
       deja vacio, el boton no aparece (no se pinta un enlace muerto). */
    grupoWhatsapp: "https://chat.whatsapp.com/GgNAnoC8ySO2OaGupyz9QY",
    gracias: "/masterclass-gracias",
    confirmacion: "/masterclass-confirmacion",

    /* El correo de confirmacion que le va a llegar. La pagina de gracias
       lo muestra tal cual para que lo reconozca en su bandeja. */
    correo: {
      remitente: "Bren de FTN",
      direccion: "bren@healthyvita.mx",
      asunto: "Te falta un paso para registrarte a la MasterClass."
    },

    /* A donde manda la encuesta de dos preguntas de la pagina de
       confirmacion. Mismo trato que el formulario: si esta vacia, no
       envia y avisa. */
    encuestaAction: "",

    /* Video de bienvenida de Ale en la pagina de confirmacion.
       YouTube, Vimeo o un .mp4 directo. Vacio = se ve el hueco. */
    videoBienvenida: "",

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
