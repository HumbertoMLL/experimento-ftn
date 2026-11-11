/* ============================================================
   Reproductor de las clases del mini reto.
   Controles propios (sin los del navegador): no hay botón de descargar,
   ni menú del clic derecho. Recuerda en qué minuto te quedaste.
   Cada <div class="video" data-src data-poster data-titulo> se vuelve un reproductor.
   ============================================================ */
(function () {
  var VELOCIDADES = [1, 1.25, 1.5, 2];

  var ICONOS = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" fill="currentColor"/></svg>',
    pausa: '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.2" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.2" fill="currentColor"/></svg>',
    atras: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="currentColor" stroke="none">10</text></svg>',
    adelante: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="currentColor" stroke="none">10</text></svg>',
    sonido: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4Z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    mudo: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4Z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/></svg>',
    pantalla: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    salir: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
  };

  function tiempo(s) {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    var mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(x).padStart(2, '0');
  }

  function guarda(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lee(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var todos = [];

  function crea(caja) {
    var src = caja.getAttribute('data-src');
    var clave = 'clase-pos:' + src.split('?')[0].split('/').pop();
    caja.classList.add('rep', 'en-pausa');
    caja.innerHTML =
      '<video playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback" poster="' + caja.getAttribute('data-poster') + '"></video>' +
      '<button type="button" class="rep-grande" aria-label="Reproducir ' + (caja.getAttribute('data-titulo') || 'clase') + '">' + ICONOS.play + '</button>' +
      '<div class="rep-cargando" aria-hidden="true"></div>' +
      '<div class="rep-aviso" hidden></div>' +
      '<div class="rep-barra">' +
        '<div class="rep-linea" role="slider" tabindex="0" aria-label="Avance del video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
          '<div class="rep-cargado"></div><div class="rep-avance"></div><div class="rep-bolita"></div><div class="rep-burbuja" hidden>0:00</div>' +
        '</div>' +
        '<div class="rep-controles">' +
          '<button type="button" class="rep-btn rep-pp" aria-label="Reproducir">' + ICONOS.play + '</button>' +
          '<button type="button" class="rep-btn rep-atras" aria-label="Regresar 10 segundos">' + ICONOS.atras + '</button>' +
          '<button type="button" class="rep-btn rep-adelante" aria-label="Adelantar 10 segundos">' + ICONOS.adelante + '</button>' +
          '<button type="button" class="rep-btn rep-mudo" aria-label="Silenciar">' + ICONOS.sonido + '</button>' +
          '<span class="rep-tiempo"><span class="rep-actual">0:00</span> / <span class="rep-total">0:00</span></span>' +
          '<span class="rep-crece"></span>' +
          '<button type="button" class="rep-vel" aria-label="Velocidad">1x</button>' +
          '<button type="button" class="rep-btn rep-full" aria-label="Pantalla completa">' + ICONOS.pantalla + '</button>' +
        '</div>' +
      '</div>';

    var v = caja.querySelector('video');
    var $ = function (s) { return caja.querySelector(s); };
    var linea = $('.rep-linea'), avance = $('.rep-avance'), bolita = $('.rep-bolita'), cargado = $('.rep-cargado');
    var burbuja = $('.rep-burbuja'), aviso = $('.rep-aviso');
    var pp = $('.rep-pp'), mudo = $('.rep-mudo'), vel = $('.rep-vel'), full = $('.rep-full');
    var empezado = false, arrastrando = false, ocultar = null;

    v.src = src;
    todos.push(v);

    // Sin menú de clic derecho (ahí está "Guardar video como…").
    caja.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function alterna() {
      if (v.paused || v.ended) {
        todos.forEach(function (o) { if (o !== v) o.pause(); });
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else v.pause();
    }

    function pinta() {
      var d = v.duration || 0, t = v.currentTime || 0, pc = d ? (t / d) * 100 : 0;
      avance.style.width = pc + '%';
      bolita.style.left = pc + '%';
      linea.setAttribute('aria-valuenow', Math.round(pc));
      linea.setAttribute('aria-valuetext', tiempo(t) + ' de ' + tiempo(d));
      $('.rep-actual').textContent = tiempo(t);
      if (v.buffered.length && d) cargado.style.width = (v.buffered.end(v.buffered.length - 1) / d) * 100 + '%';
    }

    function muestraControles() {
      caja.classList.add('activa');
      clearTimeout(ocultar);
      if (!v.paused) ocultar = setTimeout(function () { if (!arrastrando) caja.classList.remove('activa'); }, 2600);
    }

    // Reanudar donde te quedaste
    v.addEventListener('loadedmetadata', function () {
      $('.rep-total').textContent = tiempo(v.duration);
      var pos = parseFloat(lee(clave));
      if (pos > 30 && pos < v.duration - 30) {
        aviso.innerHTML = 'Te quedaste en <b>' + tiempo(pos) + '</b> <button type="button" class="rep-seguir">Continuar</button><button type="button" class="rep-cero">Desde el inicio</button>';
        aviso.hidden = false;
        aviso.querySelector('.rep-seguir').onclick = function (e) { e.stopPropagation(); v.currentTime = pos; aviso.hidden = true; alterna(); };
        aviso.querySelector('.rep-cero').onclick = function (e) { e.stopPropagation(); aviso.hidden = true; alterna(); };
      }
      pinta();
    });

    v.addEventListener('play', function () {
      empezado = true; aviso.hidden = true;
      caja.classList.remove('en-pausa'); caja.classList.add('empezado');
      pp.innerHTML = ICONOS.pausa; pp.setAttribute('aria-label', 'Pausar');
      muestraControles();
    });
    v.addEventListener('pause', function () {
      caja.classList.add('en-pausa', 'activa');
      pp.innerHTML = ICONOS.play; pp.setAttribute('aria-label', 'Reproducir');
      guarda(clave, v.currentTime);
    });
    v.addEventListener('timeupdate', function () {
      if (!arrastrando) pinta();
      if (Math.floor(v.currentTime) % 5 === 0) guarda(clave, v.currentTime);
    });
    v.addEventListener('progress', pinta);
    v.addEventListener('ended', function () { guarda(clave, 0); });
    v.addEventListener('waiting', function () { caja.classList.add('cargando'); });
    ['playing', 'canplay', 'seeked'].forEach(function (ev) { v.addEventListener(ev, function () { caja.classList.remove('cargando'); }); });
    v.addEventListener('error', function () {
      aviso.innerHTML = 'No pudimos cargar el video. Revisa tu conexión y recarga la página.';
      aviso.hidden = false;
    });

    $('.rep-grande').addEventListener('click', alterna);
    v.addEventListener('click', function () { if (empezado) alterna(); else alterna(); });
    pp.addEventListener('click', alterna);
    $('.rep-atras').addEventListener('click', function () { v.currentTime = Math.max(0, v.currentTime - 10); muestraControles(); });
    $('.rep-adelante').addEventListener('click', function () { v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); muestraControles(); });
    mudo.addEventListener('click', function () {
      v.muted = !v.muted;
      mudo.innerHTML = v.muted ? ICONOS.mudo : ICONOS.sonido;
      mudo.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
    });
    vel.addEventListener('click', function () {
      var i = (VELOCIDADES.indexOf(v.playbackRate) + 1) % VELOCIDADES.length;
      v.playbackRate = VELOCIDADES[i];
      vel.textContent = VELOCIDADES[i] + 'x';
      muestraControles();
    });

    // Pantalla completa: en iPhone sólo existe la del propio video (sin botón de descarga).
    full.addEventListener('click', function () {
      var dentro = document.fullscreenElement || document.webkitFullscreenElement;
      if (dentro) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else if (caja.requestFullscreen) caja.requestFullscreen();
      else if (caja.webkitRequestFullscreen) caja.webkitRequestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
      document.addEventListener(ev, function () {
        var dentro = (document.fullscreenElement || document.webkitFullscreenElement) === caja;
        full.innerHTML = dentro ? ICONOS.salir : ICONOS.pantalla;
        full.setAttribute('aria-label', dentro ? 'Salir de pantalla completa' : 'Pantalla completa');
      });
    });

    // Barra de avance (mouse y dedo)
    function posDe(e) {
      var r = linea.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return Math.min(1, Math.max(0, x / r.width));
    }
    function mueve(e) {
      var f = posDe(e), d = v.duration || 0;
      avance.style.width = f * 100 + '%'; bolita.style.left = f * 100 + '%';
      burbuja.style.left = f * 100 + '%'; burbuja.textContent = tiempo(f * d); burbuja.hidden = false;
      return f * d;
    }
    function suelta(e) {
      if (!arrastrando) return;
      arrastrando = false; caja.classList.remove('arrastrando'); burbuja.hidden = true;
      var t = mueve(e.changedTouches ? { clientX: e.changedTouches[0].clientX } : e);
      v.currentTime = t; burbuja.hidden = true; muestraControles();
    }
    function empieza(e) { if (!v.duration) return; arrastrando = true; caja.classList.add('arrastrando'); mueve(e); e.preventDefault(); }
    linea.addEventListener('mousedown', empieza);
    linea.addEventListener('touchstart', empieza, { passive: false });
    window.addEventListener('mousemove', function (e) { if (arrastrando) mueve(e); });
    window.addEventListener('touchmove', function (e) { if (arrastrando) mueve(e); }, { passive: true });
    window.addEventListener('mouseup', suelta);
    window.addEventListener('touchend', suelta);
    linea.addEventListener('mousemove', function (e) {
      if (arrastrando || !v.duration) return;
      var r = linea.getBoundingClientRect(), f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      burbuja.style.left = f * 100 + '%'; burbuja.textContent = tiempo(f * v.duration); burbuja.hidden = false;
    });
    linea.addEventListener('mouseleave', function () { if (!arrastrando) burbuja.hidden = true; });
    linea.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { v.currentTime += 10; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { v.currentTime -= 10; e.preventDefault(); }
    });

    // Teclado cuando el reproductor tiene el foco
    caja.tabIndex = -1;
    caja.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
      if (e.key === ' ' || e.key === 'k') { alterna(); e.preventDefault(); }
      if (e.key === 'f') full.click();
      if (e.key === 'm') mudo.click();
    });

    caja.addEventListener('mousemove', muestraControles);
    caja.addEventListener('touchstart', muestraControles, { passive: true });
    caja.addEventListener('mouseleave', function () { if (!v.paused && !arrastrando) caja.classList.remove('activa'); });
  }

  document.querySelectorAll('.video[data-src]').forEach(crea);
})();
