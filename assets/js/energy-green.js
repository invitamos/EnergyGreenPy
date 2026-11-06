/* =========================================================
   ENERGY GREEN · Scripts
   ========================================================= */
(function () {
  'use strict';

  const WHATSAPP = '595984154315';
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const num = (n, d = 0) => n.toLocaleString('es-PY', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Año del footer ---------- */
  const anio = $('#anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- Header al hacer scroll + botón arriba ---------- */
  const header = $('#header');
  const arriba = $('#arriba');
  function alScroll() {
    const y = window.scrollY;
    header.classList.toggle('con-sombra', y > 10);
    header.classList.toggle('compacto', y > 140);
    if (arriba) arriba.classList.toggle('ver', y > 600);
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  /* ---------- Menú móvil ---------- */
  const toggle = $('#nav-toggle');
  const nav = $('#nav');
  function cerrarMenu() {
    document.body.classList.remove('nav-abierto');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
  toggle.addEventListener('click', () => {
    const abierto = document.body.classList.toggle('nav-abierto');
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav a').forEach(a => a.addEventListener('click', cerrarMenu));
  document.addEventListener('click', e => {
    if (document.body.classList.contains('nav-abierto') && !nav.contains(e.target) && !toggle.contains(e.target)) cerrarMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  $$('.sub-toggle').forEach(b => b.addEventListener('click', () => {
    const li = b.parentElement;
    const abierto = li.classList.toggle('abierto');
    b.setAttribute('aria-expanded', String(abierto));
  }));

  /* ---------- Menú activo según la sección ---------- */
  const enlaces = $$('#nav a[href^="#"]');
  const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) {
          const id = '#' + en.target.id;
          enlaces.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(s => spy.observe(s));
  }

  /* ---------- Revelado al hacer scroll ---------- */
  const revelables = $$('[data-reveal]');
  if (sinMovimiento || !('IntersectionObserver' in window)) {
    revelables.forEach(el => el.classList.add('visto'));
  } else {
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revelables.forEach(el => io.observe(el));
  }

  /* ---------- Contadores ---------- */
  const contadores = $$('[data-count]');
  function contar(el) {
    const fin = Number(el.dataset.count);
    if (sinMovimiento) { el.textContent = num(fin); return; }
    const dur = 1800; const t0 = performance.now();
    function paso(t) {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = num(Math.round(fin * e));
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  if ('IntersectionObserver' in window && !sinMovimiento) {
    contadores.forEach(el => { el.textContent = '0'; });
    const ioc = new IntersectionObserver(entradas => {
      entradas.forEach(en => { if (en.isIntersecting) { contar(en.target); ioc.unobserve(en.target); } });
    }, { threshold: 0.6 });
    contadores.forEach(el => ioc.observe(el));
  }

  /* ---------- Carrusel del inicio ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.slide', hero);
    const dots = $('.hero-dots', hero);
    const INTERVALO = 6500;
    hero.style.setProperty('--intervalo', INTERVALO + 'ms');
    let actual = 0; let timer = null;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Imagen ' + (i + 1));
      b.addEventListener('click', () => { ir(i); reiniciar(); });
      dots.appendChild(b);
    });
    const botones = $$('button', dots);

    function ir(i) {
      slides[actual].classList.remove('is-active');
      botones[actual].classList.remove('on');
      botones[actual].setAttribute('aria-selected', 'false');
      actual = (i + slides.length) % slides.length;
      slides[actual].classList.add('is-active');
      void botones[actual].offsetWidth;
      botones[actual].classList.add('on');
      botones[actual].setAttribute('aria-selected', 'true');
    }
    function reiniciar() {
      clearInterval(timer);
      if (!sinMovimiento) timer = setInterval(() => ir(actual + 1), INTERVALO);
    }
    botones[0].classList.add('on');
    botones[0].setAttribute('aria-selected', 'true');

    $('.hero-arrow.prev', hero).addEventListener('click', () => { ir(actual - 1); reiniciar(); });
    $('.hero-arrow.next', hero).addEventListener('click', () => { ir(actual + 1); reiniciar(); });

    hero.addEventListener('mouseenter', () => { clearInterval(timer); hero.classList.add('pausado'); });
    hero.addEventListener('mouseleave', () => {
      hero.classList.remove('pausado');
      const b = botones[actual]; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
      reiniciar();
    });

    let x0 = null;
    hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { ir(actual + (dx < 0 ? 1 : -1)); reiniciar(); }
      x0 = null;
    });
    reiniciar();
  }

  /* ---------- Comparador ---------- */
  const comp = $('#comp');
  const rango = $('#comp-range');
  if (comp && rango) {
    let tocado = false;
    const poner = v => comp.style.setProperty('--pos', v + '%');
    rango.addEventListener('input', () => { tocado = true; poner(rango.value); });
    poner(rango.value);

    if (!sinMovimiento && 'IntersectionObserver' in window) {
      const ioComp = new IntersectionObserver(entradas => {
        if (!entradas[0].isIntersecting) return;
        ioComp.disconnect();
        const puntos = [50, 28, 72, 50]; const dur = 2600; const t0 = performance.now() + 500;
        function anim(t) {
          if (tocado) return;
          const p = Math.max(0, Math.min((t - t0) / dur, 1));
          const tramo = Math.min(Math.floor(p * 3), 2);
          const lp = p * 3 - tramo;
          const e = lp < .5 ? 2 * lp * lp : 1 - Math.pow(-2 * lp + 2, 2) / 2;
          const v = puntos[tramo] + (puntos[tramo + 1] - puntos[tramo]) * e;
          poner(v); rango.value = v;
          if (p < 1) requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
      }, { threshold: 0.5 });
      ioComp.observe(comp);
    }
  }

  /* ---------- Parallax suave en Beneficios ---------- */
  const bg = $('.beneficios-bg');
  if (bg && !sinMovimiento) {
    let pend = false;
    function parallax() {
      pend = false;
      if (window.innerWidth < 760) { bg.style.transform = ''; return; }
      const r = bg.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      bg.style.transform = `translate3d(0, ${(p * -50).toFixed(1)}px, 0)`;
    }
    window.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* ---------- Simulador ---------- */
  const checks = $$('#aparatos input[type=checkbox]');
  const tipo = $('#sim-tipo');
  const kwh = $('#sim-kwh');
  if (checks.length && tipo && kwh) {
    const $horas = $('#sim-horas'), $watts = $('#sim-watts'), $util = $('#sim-util');
    const $kit = $('#sim-kit'), $cta = $('#sim-cta'), $barra = $('#sim-barra');
    const EFICIENCIA = 0.9;

    const formatoHoras = h => {
      if (h >= 48) return 'Más de 48 h';
      const horas = Math.floor(h);
      const min = Math.round((h - horas) * 60 / 5) * 5;
      if (horas === 0) return Math.max(min, 5) + ' min';
      if (min === 60) return (horas + 1) + ' h';
      return min > 0 && horas < 10 ? `${horas} h ${min} min` : `${Math.round(h)} h`;
    };
    const kitSugerido = w => w <= 800 ? 'Kit 1 kW' : w <= 2500 ? 'Kit 3 kW' : w <= 4500 ? 'Kit 5 kW' : 'A medida (consultanos)';

    function calcular(animar) {
      let w = 0; const elegidos = [];
      checks.forEach(c => { if (c.checked) { w += Number(c.dataset.w); elegidos.push(c.dataset.n); } });
      const capacidad = Number(kwh.value);
      const util = capacidad * Number(tipo.value);
      const tipoTxt = tipo.options[tipo.selectedIndex].text.toLowerCase();

      $watts.textContent = num(w) + ' W';
      $util.textContent = num(util, 1) + ' kWh';

      let txt = '';
      if (w === 0) {
        $horas.textContent = '—'; $kit.textContent = '—'; $barra.style.width = '0';
      } else {
        const h = (util * 1000 * EFICIENCIA) / w;
        txt = formatoHoras(h);
        $horas.textContent = txt;
        $kit.textContent = kitSugerido(w);
        $barra.style.width = Math.min(h / 24 * 100, 100) + '%';
      }
      if (animar && !sinMovimiento) {
        $horas.classList.remove('salto'); void $horas.offsetWidth; $horas.classList.add('salto');
      }

      const msg = elegidos.length
        ? `Hola Energy Green, usé el simulador de la web. Quiero respaldo para: ${elegidos.join(', ')} (${num(w)} W), con batería de ${tipoTxt} de ${num(capacidad, 1)} kWh (${txt} estimadas). ¿Me pueden asesorar?`
        : 'Hola Energy Green, quiero información sobre sistemas de respaldo para cortes.';
      $cta.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }
    checks.forEach(c => c.addEventListener('change', () => calcular(true)));
    tipo.addEventListener('change', () => calcular(true));
    kwh.addEventListener('change', () => calcular(true));
    calcular(false);
  }

  /* ---------- Filtros del catálogo ---------- */
  const filtros = $$('.filtros button');
  const items = $$('#galeria .item');
  filtros.forEach(b => b.addEventListener('click', () => {
    filtros.forEach(x => x.classList.toggle('is-on', x === b));
    const f = b.dataset.filtro;
    items.forEach(it => {
      const ver = f === '*' || it.dataset.cat === f;
      it.classList.toggle('oculto', !ver);
      if (ver && !sinMovimiento) { it.classList.remove('entra'); void it.offsetWidth; it.classList.add('entra'); }
    });
  }));

  /* ---------- Galería / video ---------- */
  if (window.GLightbox) GLightbox({ selector: '.glightbox' });

  /* ---------- Formulario de contacto (EmailJS) ---------- */
  const EMAILJS_PUBLIC_KEY = 'RunIpMyxWojmuvFvG';
  const EMAILJS_SERVICE_ID = 'service_y2xbcyt';
  const EMAILJS_TEMPLATE_ID = 'template_z734vv8';

  const form = $('#contact-form');
  if (form) {
    const cargando = $('.f-cargando', form), ok = $('.f-ok', form), err = $('.f-error', form);
    if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      ok.hidden = true; err.hidden = true;
      if (!form.checkValidity()) {
        err.textContent = 'Completá tu nombre, un email válido y el mensaje.';
        err.hidden = false; form.reportValidity(); return;
      }
      $('#time-field').value = new Date().toLocaleString('es-PY');
      cargando.hidden = false;
      try {
        if (!window.emailjs) throw new Error('EmailJS no cargó');
        await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
        cargando.hidden = true; ok.hidden = false; form.reset();
        setTimeout(() => { ok.hidden = true; }, 6000);
      } catch (ex) {
        cargando.hidden = true;
        err.textContent = 'No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.';
        err.hidden = false;
        console.error(ex);
      }
    });
  }

  /* ---------- Reseñas (se guardan en este navegador) ---------- */
  const rsForm = $('#rs-form');
  if (rsForm) {
    const CLAVE = 'reviews_energygreen_v2';
    const $lista = $('#rs-lista'), $prom = $('#rs-prom'), $promEst = $('#rs-prom-est'), $cant = $('#rs-cant');
    const $ok = $('#rs-ok'), $err = $('#rs-error');

    const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; } };
    const guardar = l => { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) { /* sin almacenamiento */ } };
    const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    const estrellas = n => { const r = Math.round(n); let h = ''; for (let i = 1; i <= 5; i++) h += `<span class="${i <= r ? 'on' : ''}">★</span>`; return h; };
    const fecha = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }); };

    let resenas = leer();
    function pintar() {
      const n = resenas.length;
      const prom = n ? resenas.reduce((a, b) => a + b.rating, 0) / n : 0;
      $prom.textContent = num(prom, 1);
      $promEst.innerHTML = estrellas(prom);
      $cant.textContent = n;
      $lista.innerHTML = n
        ? resenas.map(r => `
          <li>
            <div class="rs-cab"><span class="rs-nombre">${esc(r.name)}</span><span class="rs-fecha">${fecha(r.date)}</span></div>
            <div class="rs-item-est" aria-label="${r.rating} de 5 estrellas">${estrellas(r.rating)}</div>
            <p>${esc(r.text)}</p>
          </li>`).join('')
        : '<li class="rs-vacio">Todavía no hay reseñas. ¡Sé el primero en contarnos tu experiencia!</li>';
    }
    pintar();

    rsForm.addEventListener('submit', e => {
      e.preventDefault();
      $ok.hidden = true; $err.hidden = true;
      const name = rsForm.name.value.trim();
      const rating = Number(rsForm.rating.value || 0);
      const text = rsForm.text.value.trim();
      if (!name || !rating || !text) { $err.textContent = 'Completá nombre, calificación y comentario.'; $err.hidden = false; return; }
      if (text.length < 6) { $err.textContent = 'El comentario es muy corto.'; $err.hidden = false; return; }
      resenas = [{ name, rating, text, date: new Date().toISOString() }, ...resenas].slice(0, 150);
      guardar(resenas); pintar(); rsForm.reset();
      $ok.hidden = false; setTimeout(() => { $ok.hidden = true; }, 4000);
    });
  }
})();
