/* ============================================================
   REGISTRO A LA MASTERCLASS  ·  POST /api/registro
   ------------------------------------------------------------
   Esta funcion existe por una razon: la llave de Mailvio NO puede
   vivir en el navegador. Si la pusieramos en js/config.js, cualquiera
   que abra "ver codigo fuente" podria usar la cuenta.

   Entonces el camino es:
     formulario propio  →  /api/registro  →  Mailvio
   La llave se queda aqui, del lado del servidor, en una variable de
   entorno de Vercel. Nunca sale al cliente.

   PARA DEJARLA FUNCIONANDO HACEN FALTA DOS COSAS DE LOS DOCS:
     1. MAILVIO_ENDPOINT  · la URL a la que se crea el suscriptor
     2. MAILVIO_TOKEN     · la llave de la API
     3. MAILVIO_LISTA     · el id de la lista de la masterclass
   Se cargan en Vercel → Settings → Environment Variables.
   Si falta alguna, la funcion responde 503 y lo dice en los logs, en
   vez de tragarse el registro en silencio.

   El armado del cuerpo (abajo, en `cuerpo`) esta con la forma mas comun
   de estas APIs. Si los docs de Mailvio usan otros nombres de campo, es
   lo unico que hay que ajustar.
   ============================================================ */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Solo POST" });
  }

  const { nombre, email, whatsapp } = req.body || {};

  /* Las mismas validaciones que en el navegador, repetidas aqui: lo del
     cliente se puede saltar, lo del servidor no. */
  if (!nombre || !email || !whatsapp) {
    return res.status(400).json({ ok: false, error: "Faltan datos" });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Correo invalido" });
  }
  const tel = String(whatsapp).replace(/\D/g, "");
  if (tel.length < 10) {
    return res.status(400).json({ ok: false, error: "WhatsApp invalido" });
  }

  const { MAILVIO_ENDPOINT, MAILVIO_TOKEN, MAILVIO_LISTA } = process.env;
  if (!MAILVIO_ENDPOINT || !MAILVIO_TOKEN) {
    console.error("[registro] Faltan MAILVIO_ENDPOINT o MAILVIO_TOKEN. Registro NO guardado:", { nombre, email, tel });
    return res.status(503).json({ ok: false, error: "Registro no configurado" });
  }

  const cuerpo = {
    email,
    name: nombre,
    phone: tel,
    list_id: MAILVIO_LISTA,
    /* De donde vino, para poder separar despues por canal */
    source: "masterclass-5-errores",
  };

  try {
    const r = await fetch(MAILVIO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILVIO_TOKEN}`,
      },
      body: JSON.stringify(cuerpo),
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error("[registro] Mailvio respondio", r.status, detalle.slice(0, 500));
      return res.status(502).json({ ok: false, error: "La plataforma rechazo el registro" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[registro] No se pudo hablar con Mailvio:", err);
    return res.status(502).json({ ok: false, error: "No se pudo enviar" });
  }
}
