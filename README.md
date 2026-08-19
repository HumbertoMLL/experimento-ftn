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
