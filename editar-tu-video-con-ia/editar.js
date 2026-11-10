/* ============================================================
   EDITA TU PRIMER REEL CON CLAUDE · lógica de la página
   Todo el contenido editable está en DATOS (arriba). El resto es el motor:
   armador del prompt, chat animado, frases copiables y FAQ.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- DATOS ---------------- */
  var PROMPT = [
    "Eres editor de reels. Te adjunto mi video: soy yo hablándole a la cámara. Edítalo y entrégamelo como MP4 vertical (1080×1920), listo para Instagram y TikTok.",
    "",
    "Lo que quiero:",
    "1. Quita los silencios largos. Si repetí una frase porque me equivoqué, deja solo la última vez que la dije.",
    "2. Pon mi hook en pantalla los primeros 3 segundos: letras grandes, centrado, justo arriba de mi cabeza.",
    "3. Pon subtítulos de todo lo que digo: de 2 a 4 palabras a la vez, centrados, debajo de mi barbilla y sin taparme la cara. La palabra que estoy diciendo va en mi color de acento.",
    "4. Elige tú de 5 a 8 palabras clave de mi guion (las que cargan la idea) y hazlas un poco más grandes, en mi color de acento.",
    "5. Agrega de 3 a 5 emojis grandes junto al subtítulo, solo donde refuercen la idea. Si no puedes dibujar emojis a color, no pongas ninguno.",
    "6. En los últimos 2 segundos pon mi CTA en pantalla.",
    "7. Limpia el ruido y nivela el volumen de mi voz.",
    "",
    "Zonas seguras: nada importante en los primeros 270 px de arriba, después de los 1500 px de abajo ni a la derecha de los 900 px. Ahí van los botones de Instagram y TikTok.",
    "",
    "Antes de empezar, escríbeme en 3 o 4 líneas tu plan: qué vas a cortar, qué palabras clave y qué emojis vas a usar. Luego sigue de inmediato, sin esperar mi respuesta y sin enseñarme imágenes de prueba. Hazlo en un solo script de Python con ffmpeg y no me expliques el código. Usa mi guion para que los subtítulos salgan sin errores; si no puedes transcribir el audio, acomódalo con mi guion y los silencios. Revisa que el MP4 abra bien antes de dármelo. Respóndeme en español, con frases cortas."
  ].join("\n");

  var CAMPOS = [
    { id: "guion", label: "Tu guion", key: "Guion", corto: "Guion", tipo: "textarea", filas: 6, palabras: [50, 160],
      placeholder: "Pégalo tal cual lo dijiste: hook, cuerpo y CTA.", vacio: "[pega aquí tu guion completo]" },
    { id: "hook", label: "Tu hook en pantalla", key: "Hook en pantalla", corto: "Hook", tipo: "text",
      placeholder: "¿Antojo de dulce a las 5 p. m.?", vacio: "[máximo 8 palabras]",
      pista: "Máximo 8 palabras. Sale arriba de tu cabeza los primeros 3 segundos.",
      rapidas: ["usa la primera frase de mi guion"] },
    { id: "cta", label: "Tu CTA final", key: "CTA final", corto: "CTA", tipo: "text",
      placeholder: "Agenda tu consulta · link en mi perfil", vacio: "[ej. Agenda tu consulta · link en mi perfil]",
      rapidas: ["Agenda tu consulta · link en mi perfil", "Guárdalo y compártelo", "Escríbeme por DM"] },
    { id: "color", label: "Color de acento", key: "Color de acento", corto: "Color", tipo: "text", opcional: true,
      placeholder: "rosa #FF6392", vacio: "elige uno que destaque sobre mi video",
      pista: "Un color que destaque. Si no tienes uno, déjalo vacío y la IA lo elige.",
      rapidas: ["rosa #FF6392", "azul cielo #7FC8F8", "verde menta #3DDC97", "amarillo #FFD60A"] }
  ];

  var EJEMPLO = {
    guion: "¿Te pasa que a las cinco de la tarde te comerías todo el chocolate de la casa? No es falta de fuerza de voluntad. Muchas veces comiste poco al mediodía o te saltaste la proteína, y tu cuerpo llega a la tarde con hambre real y te pide lo más rápido: azúcar. Prueba esto: en tu comida agrega una porción de proteína y una de fibra, y lleva un snack a la oficina, como yogur griego con nueces. Si quieres mi lista de snacks para la tarde, escríbeme DULCE por DM.",
    hook: "¿Antojo de dulce a las 5 p. m.?",
    cta: "Escríbeme DULCE por DM",
    color: "rosa #FF6392"
  };

  var FRASES = [
    ["Subtítulos más arriba", "sube los subtítulos un poco, que no tapen mi barbilla"],
    ["Subtítulos más grandes", "haz los subtítulos un 15% más grandes"],
    ["Cambiar el hook", "cambia el hook por: "],
    ["Quitar un pedazo", "quita la parte del segundo 12 al 15"],
    ["Menos cortes", "no cortes tanto los silencios, deja pausas de 0.3 segundos"],
    ["Corregir una palabra", "en los subtítulos corrige la palabra «insulina», está mal escrita"],
    ["Sin emojis", "quita los emojis"],
    ["Otro color", "cambia el color de acento a azul cielo #7FC8F8"]
  ];

  var FAQ = [
    ["No me deja subir el video", "Revisa que dure máximo 60 segundos y que no esté en 4K. Si desde el celular no sube, prueba desde la compu."],
    ["Me dice que me quedé sin mensajes", "Pasa en las versiones gratuitas. Espera a la hora que te indica y vuelve a intentar en el mismo chat."],
    ["Solo me explica y no edita el video", "Activa la opción de crear archivos (ejecución de código) en la configuración, o hazlo en Cowork. Luego empieza un chat nuevo."],
    ["Los subtítulos tienen errores", "Revisa que tu guion esté completo en el prompt. Para corregir una palabra, pídele: “en los subtítulos corrige la palabra…”."],
    ["Los subtítulos tapan mi cara", "Pídele: “sube los subtítulos un poco, que no tapen mi barbilla” o “bájalos un poco”."],
    ["Los emojis salen como cuadritos", "Pídele: “quita los emojis”. Pasa cuando no tiene cómo dibujarlos a color."],
    ["Se oye brincado o me cortó palabras", "Pídele: “no cortes tanto los silencios, deja pausas de 0.3 segundos”."],
    ["Dice que terminó, pero el video no abre", "Pídele: “revisa que el MP4 abra bien y vuélvemelo a mandar”."]
  ];

  var VIDEO = "mi_reel.mov";
  var CHAT = {
    viejo: "Chat anterior", nuevo: "Chat nuevo", titulo: "Mi primer reel",
    vacio: "¿Qué vamos a crear hoy?", placeholder: "Escribe tu mensaje…",
    intro: "Eres editor de reels. Te adjunto mi video…",
    archivos: ["Guion_dia2.docx", VIDEO, "foto_perfil.jpg"], adjuntar: [VIDEO]
  };

  /* Cada paso trae su escena del chat animado, escrita como línea de tiempo. */
  var PASOS = [
    { t: "Abre un chat nuevo", b: "En Claude o ChatGPT, sin conversaciones anteriores.", ok: "Chat vacío, listo para empezar",
      escena: function (s) { s.estado("viejo").espera(600).nuevoChat().mueve("input", .5, .4).espera(600); } },
    { t: "Sube tu video", b: "Con el <b>clip</b> o el <b>+</b>, elige tu video. Espera a que termine de subir.", ok: "Tu video aparece junto al mensaje",
      escena: function (s) { s.estado("nuevo").espera(500).adjunta().mueve("input", .5, .3); } },
    { t: "Pega tu prompt", b: "El que armaste en el <b>paso 1</b>. Un solo texto, tal cual.", ok: "Tu prompt y tu video en el mismo mensaje",
      liga: ["Ir a mi prompt", "#prompt", "chispas"],
      escena: function (s) { s.estado("adjunto").espera(400).teclea(lineasEjemplo(), 90).espera(800); } },
    { t: "Dale enviar", b: "Te escribe su plan en 3 o 4 líneas y empieza solo. <b>No lo interrumpas.</b>", ok: "Ves su plan: cortes, palabras clave y emojis",
      escena: function (s) {
        s.estado("tecleado").espera(500).envia()
          .responde("<p><b>Mi plan:</b><br>• Quito 6 silencios y una frase repetida.<br>• Palabras clave: dulce, proteína, fibra, snack.<br>• Emojis: 🍫 💪 🥜 💬<br>Empiezo ya.</p>", 2400);
      } },
    { t: "Espera tu video", b: "Tarda unos minutos. Al final te deja tu MP4 <b>listo para descargar</b>.", ok: "Descárgalo, publícalo y manda tu link al grupo",
      escena: function (s) {
        s.estado("trabajando").espera(400).tareas("Editando tu reel:", [
          ["Quitando silencios", "Silencios fuera"],
          ["Poniendo hook y subtítulos", "Hook y subtítulos listos"],
          ["Agregando emojis", "Emojis listos"]
        ], 1000).render("Haciendo tu video final.", "mi_primer_reel.mp4", "9:16 · 42 s · listo").pastilla("Publícalo y manda tu link al grupo");
      } },
    { t: "¿Algo no te gusta? Pídelo", b: "Con una frase concreta y te regresa el video. Te dejo ideas <b>aquí abajo</b>.", ok: "Te regresa tu video con el cambio",
      liga: ["Ver frases para ajustar", "#frases", "comentario"],
      escena: function (s) {
        s.estado("trabajando").espera(400).teclea("haz los subtítulos un 15% más grandes", 30).envia()
          .antesDespues("Hecho. Así quedan los subtítulos más grandes:").pastilla("Tu video nuevo está listo");
      } }
  ];

  /* ---------------- utilidades ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function ico(nombre) { return '<svg class="i"><use href="#i-' + nombre + '"/></svg>'; }
  var SVG = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    chispa: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    archivo: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    video: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    baja: '<svg viewBox="0 0 24 24"><path d="M12 4v11M6 10l6 6 6-6M5 20h14"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>'
  };

  var toastT;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600); }
  function copiar(texto, listo) {
    function respaldo() {
      var t = document.createElement("textarea"); t.value = texto; t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, texto.length);
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(t); listo();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(listo, respaldo); else respaldo();
  }

  /* ---------------- Paso 1 · armador del prompt ---------------- */
  var form = $("form");
  form.innerHTML = CAMPOS.map(function (c, i) {
    var input = c.tipo === "textarea"
      ? '<textarea id="f_' + c.id + '" rows="' + c.filas + '" placeholder="' + esc(c.placeholder) + '"></textarea>'
      : '<input type="text" id="f_' + c.id + '" placeholder="' + esc(c.placeholder) + '">';
    var pista = c.pista || c.palabras ? '<p class="pista" id="p_' + c.id + '">' + esc(c.pista || "") + "</p>" : "";
    var rapidas = c.rapidas ? '<div class="rapidas">' + c.rapidas.map(function (r) { return '<button type="button" data-para="' + c.id + '" data-v="' + esc(r) + '">' + esc(r) + "</button>"; }).join("") + "</div>" : "";
    return '<div class="campo"><label for="f_' + c.id + '">' + (i + 1) + " · " + esc(c.label) + (c.opcional ? "<small>(opcional)</small>" : "") + "</label>" + input + pista + rapidas + "</div>";
  }).join("") + '<button type="button" class="ejemplo" id="ejemplo">Ver un ejemplo</button>';

  function armar() {
    var plano = PROMPT + "\n\nMIS DATOS", html = esc(PROMPT) + '\n\n<span class="hd">MIS DATOS</span>';
    CAMPOS.forEach(function (c) {
      var v = $("f_" + c.id).value.trim();
      plano += "\n- " + c.key + ": " + (v || c.vacio);
      html += "\n- " + esc(c.key) + ": " + (v ? esc(v) : '<span class="ph">' + esc(c.vacio) + "</span>");
      if (c.palabras) {
        var n = v ? v.split(/\s+/).length : 0, p = $("p_" + c.id), lo = c.palabras[0], hi = c.palabras[1];
        if (!n) { p.textContent = "Ideal: de " + lo + " a " + hi + " palabras."; p.className = "pista"; }
        else if (n >= lo && n <= hi) { p.textContent = n + " palabras. Está en el rango ideal."; p.className = "pista bien"; }
        else { p.textContent = n + " palabras. Ideal: de " + lo + " a " + hi + "."; p.className = "pista"; }
      }
    });
    $("prompt-texto").innerHTML = html;
    $("prompt-texto").setAttribute("data-plano", plano);
  }
  form.addEventListener("input", armar);
  form.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.id === "ejemplo") { CAMPOS.forEach(function (c) { $("f_" + c.id).value = EJEMPLO[c.id] || ""; }); return armar(); }
    var para = b.getAttribute("data-para");
    if (para) { $("f_" + para).value = b.getAttribute("data-v"); armar(); }
  });
  $("copiar").addEventListener("click", function () {
    var b = this, s = b.querySelector("span");
    copiar($("prompt-texto").getAttribute("data-plano"), function () {
      b.classList.add("listo"); s.textContent = "¡Copiado!"; toast("Prompt copiado. Ahora pégalo junto con tu video.");
      setTimeout(function () { b.classList.remove("listo"); s.textContent = "Copiar prompt"; }, 1800);
    });
  });
  armar();

  /* ---------------- Frases y FAQ ---------------- */
  FRASES.forEach(function (f) {
    var b = el("button", "frase", '<span><span class="que">' + esc(f[0]) + '</span><span class="q">“' + esc(f[1]) + '”</span></span><span class="cp">' + ico("copiar") + "</span>");
    b.type = "button";
    b.addEventListener("click", function () {
      copiar(f[1], function () {
        b.classList.add("listo"); b.querySelector(".cp").innerHTML = ico("check");
        setTimeout(function () { b.classList.remove("listo"); b.querySelector(".cp").innerHTML = ico("copiar"); }, 1600);
      });
    });
    $("frases-lista").appendChild(b);
  });
  $("faq").innerHTML = FAQ.map(function (q) {
    return "<details><summary>" + esc(q[0]) + '</summary><div class="respuesta"><p>' + esc(q[1]) + "</p></div></details>";
  }).join("");

  /* ---------------- Paso 3 · chat animado ---------------- */
  var WIN = $("win"), MS = $("msgs"), CT = $("ctext"), CH = $("chips"), CUR = $("cur"), DLG = $("dlg"), COMP = $("comp"), TT = $("wtitle");
  var T = { newchat: $("newchat"), clip: $("bclip"), send: $("bsend"), input: CT };

  DLG.innerHTML = '<div class="dh">Adjuntar archivo</div>' + CHAT.archivos.map(function (f) {
    return '<div class="frow' + (CHAT.adjuntar.indexOf(f) > -1 ? "" : " dim") + '">' + (/\.(mov|mp4)$/i.test(f) ? SVG.video : SVG.archivo) + esc(f) + "</div>";
  }).join("");

  function lineasEjemplo() {
    var L = [["", CHAT.intro]];
    CAMPOS.forEach(function (c) { var v = EJEMPLO[c.id] || ""; if (v.length > 90) v = v.slice(0, 87).trim() + "…"; L.push([c.corto, v]); });
    return L;
  }
  function ph() { CT.innerHTML = '<span class="ph">' + esc(CHAT.placeholder) + "</span>"; }
  function limpia() {
    MS.innerHTML = ""; CH.innerHTML = ""; ph(); TT.textContent = CHAT.viejo;
    T.send.classList.remove("listo"); DLG.classList.remove("show"); COMP.classList.remove("focus");
    DLG.querySelectorAll(".frow").forEach(function (r) { r.classList.remove("sel"); });
  }
  function usuario(html, w) { var m = el("div", "m m-user", html); if (w) m.style.width = w; MS.appendChild(m); }
  function claude(html) { var m = el("div", "m m-claude", '<div class="av">' + SVG.chispa + '</div><div class="cb">' + html + "</div>"); MS.appendChild(m); return m.querySelector(".cb"); }
  function esqueleto(ws) { return '<div class="skb">' + ws.map(function (w) { return '<div class="sk w' + w + '"></div>'; }).join("") + "</div>"; }
  function pastilla(txt) { MS.appendChild(el("div", "pastilla", SVG.check + esc(txt))); }
  function chips() { return CHAT.adjuntar.map(function (f) { return '<span class="fchip">' + SVG.video + esc(f) + "</span>"; }).join(""); }
  function vacio() { MS.appendChild(el("div", "vacio", "<span>" + SVG.chispa + "</span>" + esc(CHAT.vacio))); }
  function reel(i) { return '<div class="reel" style="--cw:' + (48 + (i * 17) % 34) + '%">' + (i < 2 ? '<i class="hk"></i>' : "") + '<i class="sb"></i></div>'; }
  function tarea(txt, st) { return '<span class="jic">' + (st === "ok" ? SVG.check : st === "run" ? '<span class="spin"></span>' : "") + "</span>" + esc(txt); }
  function lineasHTML(L, n, caret) {
    var out = "", resta = n;
    for (var i = 0; i < L.length && resta > 0; i++) {
      var k = L[i][0] ? L[i][0] + ": " : "", v = L[i][1];
      var kt = Math.min(resta, k.length); resta -= kt;
      var vt = Math.min(resta, v.length); resta -= vt;
      out += '<span class="ln">' + (kt ? '<span class="k">' + esc(k.slice(0, kt)) + "</span>" : "") + esc(v.slice(0, vt)) + "</span>";
    }
    return out + (caret ? '<span class="caret"></span>' : "");
  }
  function mueveA(e, fx, fy) {
    var w = WIN.getBoundingClientRect(), r = e.getBoundingClientRect();
    CUR.style.transform = "translate(" + (r.left - w.left + r.width * (fx == null ? .5 : fx) - 3) + "px," + (r.top - w.top + r.height * (fy == null ? .55 : fy) - 2) + "px)";
  }
  function cursorInicio() {
    var w = WIN.getBoundingClientRect();
    CUR.style.transition = "none"; CUR.style.transform = "translate(" + (w.width * .72) + "px," + (w.height * .9) + "px)";
    void CUR.offsetWidth; CUR.style.transition = "";
  }
  function clic(e) {
    CUR.classList.remove("clk"); void CUR.offsetWidth; CUR.classList.add("clk");
    if (e) { e.classList.add("press"); setTimeout(function () { e.classList.remove("press"); }, 200); }
  }
  var ESTADOS = {
    viejo: function () { TT.textContent = CHAT.viejo; usuario(esqueleto([60, 40]), "56%"); claude(esqueleto([75, 60, 40])); usuario(esqueleto([40]), "40%"); },
    nuevo: function () { TT.textContent = CHAT.nuevo; vacio(); },
    adjunto: function () { ESTADOS.nuevo(); CH.innerHTML = chips(); },
    tecleado: function () { ESTADOS.adjunto(); CT.innerHTML = lineasHTML(lineasEjemplo(), 1e9, false); T.send.classList.add("listo"); COMP.classList.add("focus"); },
    enviado: function () { TT.textContent = CHAT.titulo; usuario(esqueleto([60, 40]), "56%"); },
    trabajando: function () { ESTADOS.enviado(); claude(esqueleto([75, 45])); }
  };

  /* Constructor de escenas: cada método agenda eventos y avanza el reloj. */
  function Escena() { this.t = 0; this.ev = []; this.inicio = "viejo"; }
  Escena.prototype = {
    en: function (fn) { this.ev.push([this.t, fn]); return this; },
    espera: function (ms) { this.t += ms; return this; },
    estado: function (n) { this.inicio = n; return this; },
    mueve: function (t, fx, fy) { var e = T[t]; return this.en(function () { mueveA(e, fx, fy); }).espera(900); },
    clic: function (t) { var e = T[t]; return this.en(function () { clic(e); }).espera(250); },
    nuevoChat: function () { return this.mueve("newchat").clic("newchat").en(function () { MS.innerHTML = ""; TT.textContent = CHAT.nuevo; vacio(); }).espera(600); },
    adjunta: function () {
      var self = this, filas = function () { return DLG.querySelectorAll(".frow:not(.dim)"); };
      this.mueve("clip").clic("clip").en(function () { DLG.classList.add("show"); }).espera(800);
      CHAT.adjuntar.forEach(function (_, i) {
        self.en(function () { mueveA(filas()[i], .3, .5); }).espera(900)
          .en(function () { filas()[i].classList.add("sel"); clic(filas()[i]); }).espera(400);
      });
      return this.en(function () { DLG.classList.remove("show"); CH.innerHTML = chips(); }).espera(500);
    },
    teclea: function (texto, cps) {
      var L = typeof texto === "string" ? [["", texto]] : texto, self = this;
      var tot = L.reduce(function (n, l) { return n + (l[0] ? l[0].length + 2 : 0) + l[1].length; }, 0);
      var paso = Math.max(1, Math.round((cps || 60) * .04));
      this.mueve("input", .35, .5).en(function () { COMP.classList.add("focus"); CT.innerHTML = '<span class="caret"></span>'; }).espera(300);
      for (var n = 0; n < tot;) { n = Math.min(tot, n + paso); (function (nn) { self.en(function () { CT.innerHTML = lineasHTML(L, nn, nn < tot); }); })(n); this.espera(40); }
      return this.espera(200).en(function () { T.send.classList.add("listo"); });
    },
    envia: function () {
      return this.mueve("send").clic("send").en(function () {
        var conArchivo = !!CH.innerHTML;
        var cuerpo = CT.querySelector(".k") ? CT.innerHTML.replace('<span class="caret"></span>', "") : esc(CT.textContent || "");
        if (MS.querySelector(".vacio")) MS.innerHTML = "";
        CH.innerHTML = ""; ph(); T.send.classList.remove("listo"); COMP.classList.remove("focus");
        TT.textContent = CHAT.titulo; usuario((conArchivo ? chips() : "") + "<div>" + cuerpo + "</div>");
      }).espera(800);
    },
    responde: function (html, ms) { return this.en(function () { claude(html); }).espera(ms || 1800); },
    tareas: function (intro, lista, gap) {
      var js, self = this;
      this.en(function () {
        var cb = claude("<p>" + esc(intro) + "</p>" + lista.map(function () { return '<div class="job"></div>'; }).join(""));
        js = cb.querySelectorAll(".job");
        lista.forEach(function (j, i) { js[i].innerHTML = tarea(j[0], ""); });
        js[0].className = "job run"; js[0].innerHTML = tarea(lista[0][0], "run");
      }).espera(gap);
      lista.forEach(function (j, i) {
        self.en(function () {
          js[i].className = "job ok"; js[i].innerHTML = tarea(j[1], "ok");
          if (js[i + 1]) { js[i + 1].className = "job run"; js[i + 1].innerHTML = tarea(lista[i + 1][0], "run"); }
        }).espera(gap);
      });
      return this;
    },
    antesDespues: function (intro) {
      var ba;
      return this.en(function () {
        var cb = claude("<p>" + esc(intro) + '</p><div class="ba2"><div class="bx">' + reel(2) + '<span class="bt">ANTES</span></div><div class="bx after">' + reel(2) + '<span class="bt">DESPUÉS</span></div></div>');
        ba = cb.querySelector(".ba2");
      }).espera(500).en(function () { ba.classList.add("go"); }).espera(1400);
    },
    render: function (intro, archivo, meta) {
      var caja, barra, pc, N = 22, self = this;
      this.en(function () {
        var cb = claude("<p>" + esc(intro) + '</p><div class="rbox"><div class="rbar"><i></i></div><div class="rlab"><span>Renderizando</span><span class="pc">0%</span></div></div>');
        caja = cb.querySelector(".rbox"); barra = caja.querySelector("i"); pc = caja.querySelector(".pc");
      }).espera(300);
      for (var k = 1; k <= N; k++) (function (k) { self.en(function () { var p = Math.round(k / N * 100); barra.style.width = p + "%"; pc.textContent = p + "%"; }).espera(170); })(k);
      return this.espera(400).en(function () {
        caja.parentNode.innerHTML = '<p>Listo, tu video está terminado.</p><div class="mp4"><div class="vph">' + reel(5) + '</div><div class="inf"><b>' + esc(archivo) + "</b><span>" + esc(meta) + '</span></div><div class="dt">' + SVG.baja + "</div></div>";
      }).espera(700);
    },
    pastilla: function (txt) { return this.en(function () { pastilla(txt); }).espera(500); }
  };

  /* Lista de pasos */
  $("pasos-lista").innerHTML = PASOS.map(function (p, i) {
    var liga = p.liga ? '<a class="mini" href="' + p.liga[1] + '">' + ico(p.liga[2]) + " " + esc(p.liga[0]) + "</a>" : "";
    return '<li class="paso"><button class="paso-cab" type="button"><span class="n">' + (i + 1) + '</span><span class="t">' + esc(p.t) + "</span></button>" +
      '<div class="paso-cuerpo"><div><div><p>' + p.b + '</p><p class="ok">' + ico("check") + esc(p.ok) + "</p>" + liga + '<div class="barra"><i></i></div></div></div></div></li>';
  }).join("");

  /* Reproductor */
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll("#pasos-lista .paso"), barras = [], NP = items.length;
  items.forEach(function (li) { barras.push(li.querySelector(".barra i")); });
  var cur = 0, t = 0, evs = [], ei = 0, dur = 1, tocando = !REDUCE, visible = false, ult = Date.now(), PAUSA = 2200;
  function construye(i) { var s = new Escena(); PASOS[i].escena(s); return s; }
  function pinta() {
    items.forEach(function (li, i) { li.classList.toggle("on", i === cur); li.classList.toggle("hecho", i < cur); li.querySelector(".paso-cab").setAttribute("aria-expanded", i === cur); barras[i].style.width = "0"; });
    $("vcount").textContent = (cur + 1) + " / " + NP;
  }
  function pintaPP() { $("vpp").innerHTML = tocando ? SVG.pausa : SVG.play; $("vpp").setAttribute("aria-label", tocando ? "Pausar" : "Reproducir"); }
  function carga(i) {
    cur = ((i % NP) + NP) % NP; t = 0; ei = 0;
    limpia(); cursorInicio();
    var s = construye(cur); ESTADOS[s.inicio](); evs = s.ev; dur = s.t + 600;
    pinta();
  }
  setInterval(function () {
    var ahora = Date.now(), d = Math.min(ahora - ult, 120); ult = ahora;
    if (!tocando || !visible) return;
    t += d;
    while (ei < evs.length && evs[ei][0] <= t) { try { evs[ei][1](); } catch (e) { console.error(e); } ei++; }
    barras[cur].style.width = (Math.min(1, t / dur) * 100) + "%";
    if (t >= dur + PAUSA) carga(cur + 1);
  }, 40);
  items.forEach(function (li, i) {
    li.querySelector(".paso-cab").addEventListener("click", function () {
      tocando = true; pintaPP(); carga(i);
      if (innerWidth < 860) { var r = WIN.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) WIN.scrollIntoView({ block: "center", behavior: "smooth" }); }
    });
  });
  $("vprev").addEventListener("click", function () { tocando = true; pintaPP(); carga(cur - 1); });
  $("vnext").addEventListener("click", function () { tocando = true; pintaPP(); carga(cur + 1); });
  $("vpp").addEventListener("click", function () { tocando = !tocando; ult = Date.now(); pintaPP(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; ult = Date.now(); }); }, { threshold: .3 }).observe(WIN);
  else visible = true;
  pintaPP(); carga(0);
  window.__visor = { carga: carga, dur: function (i) { return construye(i).t + 600; } };

  /* ---------------- Aviso navegador in-app ---------------- */
  if (/FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|musical_ly|BytedanceWebview|Snapchat|Twitter|LinkedInApp|Line\/|; wv\)/i.test(navigator.userAgent)) {
    $("inapp").classList.add("show");
    $("inappx").addEventListener("click", function () { $("inapp").classList.remove("show"); });
    $("inappcopy").addEventListener("click", function () { copiar(location.href, function () { toast("Enlace copiado. Pégalo en Chrome o Safari."); }); });
  }
})();
