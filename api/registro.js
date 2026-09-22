/* ============================================================
   REGISTRO A LA MASTERCLASS  ·  /api/registro
   ------------------------------------------------------------
   Sirve para que el formulario de la landing sea NUESTRO (nuestra
   tipografia, nuestros colores, nuestro campo de WhatsApp) y aun asi
   el registro termine en Mailvio.

   Hay dos caminos y el codigo escoge solo:

   1. ESPEJO (no necesita llave, es el que funciona desde hoy)
      Esta funcion abre el formulario de Mailvio como lo abriria un
      navegador, ve como se llaman sus campos, los rellena con lo que
      escribio la persona y manda el mismo POST que mandaria el boton
      SUBSCRIBE. Para Mailvio es un registro igual de valido; lo unico
      que cambia es quien pinta los campos.

   2. API (cuando lleguen las llaves)
      Si existen MAILVIO_ENDPOINT y MAILVIO_TOKEN, se usa la API en vez
      del espejo. Es mas estable, porque no depende de como este armado
      el HTML del formulario. La llave vive aqui, del lado del servidor:
      nunca sale al navegador.

   PARA PROBAR SIN REGISTRAR A NADIE:
      abre en el navegador  /api/registro?probar=1
   Devuelve lo que encontro dentro del formulario de Mailvio: a donde
   manda, como se llaman sus campos y cuales cree que son el nombre, el
   correo y el telefono. No registra nada. Si ese JSON se ve bien, el
   espejo va a funcionar.
   ============================================================ */

/* Tiene que ser el mismo de js/config.js → masterclass.formUrl */
const FORM_URL = process.env.MAILVIO_FORM_URL ||
  "https://mptrack.healthyvita.mx/form?am=43289&fid=64051&host=true";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/* ---------- Lectura del formulario de Mailvio ---------- */

function atributos(trozo) {
  const out = {};
  const re = /([a-zA-Z0-9_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(trozo))) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return out;
}

/* Que es cada campo. Se mira el type primero y el name despues, porque
   el type no miente y el name puede llamarse de cualquier forma. */
function clasificar(c) {
  const n = (c.name || "").toLowerCase();
  const t = (c.type || "text").toLowerCase();
  if (t === "hidden") return "oculto";
  if (t === "submit" || t === "button" || t === "reset" || t === "image") return "boton";
  if (t === "checkbox") return "casilla";
  if (t === "email" || /e?-?mail|correo/.test(n)) return "email";
  if (t === "tel" || /phone|tel|whats|movil|mobile|celular/.test(n)) return "telefono";
  if (/name|nombre|fname|first|nom\b/.test(n)) return "nombre";
  return "otro";
}

async function leerFormulario() {
  const r = await fetch(FORM_URL, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!r.ok) throw new Error("El formulario respondio " + r.status);
  const html = await r.text();
  const galleta = r.headers.get("set-cookie") || "";

  /* De todos los <form> de la pagina nos quedamos con el que tenga un
     campo de correo: ese es el de registro y no el buscador ni nada. */
  const formas = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
  if (!formas.length) throw new Error("No hay ningun <form> en la pagina");

  let elegida = null, campos = [];
  for (const f of formas) {
    const dentro = [...f[2].matchAll(/<(input|select|textarea)\b([^>]*?)\/?>/gi)]
      .map((i) => atributos(i[2]))
      .filter((a) => a.name)
      .map((a) => ({ name: a.name, type: a.type || "text", value: a.value || "", clase: clasificar(a) }));
    if (dentro.some((c) => c.clase === "email")) { elegida = f; campos = dentro; break; }
    if (!elegida) { elegida = f; campos = dentro; }
  }

  const attrs = atributos(elegida[1]);
  const action = new URL(attrs.action || "", FORM_URL).toString();
  return { action, metodo: (attrs.method || "POST").toUpperCase(), campos, galleta };
}

/* ---------- Armado del envio ---------- */

function armarCuerpo(campos, datos) {
  const cuerpo = new URLSearchParams();
  let puestos = { email: false, nombre: false, telefono: false };

  for (const c of campos) {
    if (c.clase === "oculto") cuerpo.append(c.name, c.value);          // tokens, ids de lista
    else if (c.clase === "casilla") cuerpo.append(c.name, c.value || "1"); // consentimiento
    else if (c.clase === "email") { cuerpo.append(c.name, datos.email); puestos.email = true; }
    else if (c.clase === "nombre") { cuerpo.append(c.name, datos.nombre); puestos.nombre = true; }
    else if (c.clase === "telefono") { cuerpo.append(c.name, datos.whatsapp); puestos.telefono = true; }
  }
  return { cuerpo, puestos };
}

async function porEspejo(datos) {
  const form = await leerFormulario();
  const { cuerpo, puestos } = armarCuerpo(form.campos, datos);

  /* Sin campo de correo no hay registro que valga: mejor fallar aqui
     que mandar un POST a ciegas y creer que se guardo. */
  if (!puestos.email) throw new Error("No encontre el campo de correo en el formulario de Mailvio");

  const r = await fetch(form.action, {
    method: form.metodo === "GET" ? "POST" : form.metodo,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
      Referer: FORM_URL,
      ...(form.galleta ? { Cookie: form.galleta.split(";")[0] } : {}),
    },
    body: cuerpo.toString(),
    redirect: "manual",
  });

  /* Un 3xx es lo normal aqui: el formulario responde redirigiendo a su
     propia pagina de gracias. */
  if (r.status >= 400) {
    const detalle = await r.text();
    throw new Error("Mailvio respondio " + r.status + " " + detalle.slice(0, 300));
  }
  return { via: "espejo", telefonoGuardado: puestos.telefono };
}

async function porApi(datos, endpoint, token, lista) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      email: datos.email,
      name: datos.nombre,
      phone: datos.whatsapp,
      list_id: lista,
      source: "masterclass-5-errores",
    }),
  });
  if (!r.ok) {
    const detalle = await r.text();
    throw new Error("Mailvio respondio " + r.status + " " + detalle.slice(0, 300));
  }
  return { via: "api", telefonoGuardado: true };
}

/* ---------- La funcion ---------- */

export default async function handler(req, res) {
  const { MAILVIO_ENDPOINT, MAILVIO_TOKEN, MAILVIO_LISTA } = process.env;

  /* Modo prueba: mira el formulario y cuenta que vio. No registra nada. */
  if (req.method === "GET") {
    if (!req.query || req.query.probar !== "1") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Solo POST. Para revisar: /api/registro?probar=1" });
    }
    try {
      const f = await leerFormulario();
      const vistos = (clase) => f.campos.filter((c) => c.clase === clase).map((c) => c.name);
      return res.status(200).json({
        ok: true,
        camino: MAILVIO_ENDPOINT && MAILVIO_TOKEN ? "api" : "espejo",
        formulario: FORM_URL,
        manda_a: f.action,
        metodo: f.metodo,
        detecte: { nombre: vistos("nombre"), email: vistos("email"), telefono: vistos("telefono") },
        ocultos: f.campos.filter((c) => c.clase === "oculto").map((c) => c.name),
        sin_clasificar: f.campos.filter((c) => c.clase === "otro").map((c) => c.name),
        todos: f.campos.map((c) => c.name + " (" + c.type + ")"),
        listo: f.campos.some((c) => c.clase === "email"),
      });
    } catch (err) {
      return res.status(502).json({ ok: false, error: String(err.message || err) });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Solo POST" });
  }

  const { nombre, email, whatsapp } = req.body || {};

  /* Las mismas validaciones que en el navegador, repetidas aqui: lo del
     cliente se puede saltar, lo del servidor no. */
  if (!nombre || !email || !whatsapp) return res.status(400).json({ ok: false, error: "Faltan datos" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: "Correo invalido" });
  const tel = String(whatsapp).replace(/\D/g, "");
  if (tel.length < 10) return res.status(400).json({ ok: false, error: "WhatsApp invalido" });

  const datos = { nombre: String(nombre).trim(), email: String(email).trim(), whatsapp: tel };

  try {
    const r = MAILVIO_ENDPOINT && MAILVIO_TOKEN
      ? await porApi(datos, MAILVIO_ENDPOINT, MAILVIO_TOKEN, MAILVIO_LISTA)
      : await porEspejo(datos);

    /* Si el formulario de Mailvio no tiene campo de telefono, el registro
       si entro pero el WhatsApp se perdio. Queda en el log para no
       enterarse el dia de la masterclass. */
    if (!r.telefonoGuardado) {
      console.warn("[registro] Sin campo de telefono en Mailvio. WhatsApp NO guardado:", datos.email, tel);
    }
    return res.status(200).json({ ok: true, via: r.via });
  } catch (err) {
    /* Nunca se traga un registro en silencio: queda escrito completo en
       los logs de Vercel para poder recuperarlo a mano. */
    console.error("[registro] FALLO. Datos:", JSON.stringify(datos), "·", String(err.message || err));
    return res.status(502).json({ ok: false, error: "No se pudo guardar" });
  }
}
