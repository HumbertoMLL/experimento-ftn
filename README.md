# Experimento FTN — Landing Reto 2%

Landing page estática (HTML + CSS + JS puro, cero dependencias, cero build) para el Reto 2% de FTN. Pensada para vivir en su propio repo y su propio proyecto de Vercel.

## Estructura

```
experimento-ftn/
├── index.html        # Toda la landing
├── css/styles.css    # Estilos (portados del diseño original)
├── js/config.js      # ⚙️ TODO lo editable: pixel, checkouts, imágenes, fechas
├── js/pixel.js       # Meta Pixel (base code + PageView + helper ftnTrack)
├── js/app.js         # Countdown, reveal, sticky, eventos de checkout
└── vercel.json       # Config mínima de Vercel
```

## Antes de publicar (checklist)

Todo se edita en **`js/config.js`**:

1. **`metaPixelId`** — pega el Pixel ID de Meta. Sin él, el pixel no se carga y la consola lo avisa.
2. **`checkout.trimestral.url`** y **`checkout.mensual.url`** — URLs reales del checkout.
3. **`imagenes`** — URLs de logo, chats, fotos de cambios y foto de Bren. El banner ya apunta al S3 público de FTN. Cualquier imagen vacía se oculta sola sin romper la página.
4. **`deadlineRegalo`** — si el deadline ya pasó, el aviso rojo y el countdown se ocultan solos.
5. (Opcional) En `index.html`, descomenta el bloque `<noscript>` del pixel y pon el ID para cubrir navegadores sin JS.

## Eventos de Meta que dispara

| Evento | Cuándo |
|---|---|
| `PageView` | Al cargar la página (desde el `<head>`, lo antes posible) |
| `ViewContent` | Cuando la sección de planes entra a pantalla (una sola vez) |
| `InitiateCheckout` | Click en "Quiero la trimestral" / "Quiero la mensual", con `value`, `currency: MXN` y `content_name` |

Todos los eventos pasan por el helper `window.ftnTrack(evento, params)` y se registran en la consola del navegador, así puedes verificar en vivo (además del Test Events de Meta Events Manager).

## Deploy en Vercel

En Vercel: **Add New → Project → importa este repo (`experimento-ftn`)**.
Framework preset: **Other**. Sin build command, sin output directory. Listo.

Cada push a `main` redeploya automáticamente.

## Probar en local

```bash
npx serve .
# o
python3 -m http.server 8080
```

Abre la consola del navegador: verás cada evento del pixel (o el aviso de que falta el ID).

## Reto Más Músculo, Menos Grasa

Landing madre: **`/reto-mas-musculo`** (antes `/musculo-v1`, que redirige). Variantes de prueba: `/musculo-v5` y `/musculo-v6`.

Variantes de una sola oferta: **`/reto-mas-musculo-m`** (solo mensual, $599) y **`/reto-mas-musculo-t`** (solo trimestral, $1,197). Son copia de la madre con una sola tarjeta de precio; los eventos salen como `reto-mas-musculo-m` / `-t` y aceptan los mismos canales (`/reto-mas-musculo-m/meta`, etc.).

`/reto-mas-musculo/influencer`, `/email` y `/whatsapp` ya no muestran la madre: `vercel.json` los manda a **`/reto-mas-musculo-dos`**, que es el diseño de -m/-t con las dos ofertas. Los eventos salen como `reto-mas-musculo-dos` y el canal se sigue leyendo de la URL. `/meta`, `/instagram` y las personas siguen en la madre.

Todos los botones de la página llevan a la oferta (`#oferta`). Los dos botones de la oferta llevan a Hotmart, y la URL del checkout se arma con `&src=<canal>` según el canal con el que se abrió la landing:

| Canal | Link a compartir |
|---|---|
| Meta | `/reto-mas-musculo/meta` (o `?src=meta`) |
| Influencer | `/reto-mas-musculo/influencer` |
| Instagram | `/reto-mas-musculo/instagram` |
| Email | `/reto-mas-musculo/email` |
| WhatsApp | `/reto-mas-musculo/whatsapp` |

Lo mismo funciona en `/musculo-v5/<canal>` y `/musculo-v6/<canal>`. Sin canal, el checkout va sin `src`. Las ofertas de Hotmart (mensual `off=6foo9x9h`, trimestral `off=39iewqaz`) viven en `js/config.js` → `musculo.checkout`.
