/* ==========================================================================
   Michal Kučera – osobní web
   Bez knihoven. Obsah je čitelný i bez JS, JS přidává pohyb a interakce.
   Respektuje prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ------------------------------------------------------------------
     1) Česká typografie – pojistka pro texty upravené později:
        jednopísmenné předložky a spojky nezůstanou na konci řádku,
        čísla se nedělí od jednotek a názvy produktů se nerozdělí.
        (V HTML už jsou nezlomitelné mezery doplněné.)
     ------------------------------------------------------------------ */
  function czechTypography(scope) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, [data-no-typo]')) return NodeFilter.FILTER_REJECT;
        return /\s/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const single = /(^|[\s(„ ])([ksvzouaiKSVZOUAI])[ \t\n]+/g;
    nodes.forEach((node) => {
      let text = node.nodeValue;
      text = text.replace(single, '$1$2 ').replace(single, '$1$2 ');
      text = text
        .replace(/(\d+\+?)[ \t\n]+(let|účastníků)/g, '$1 $2')
        .replace(/Microsoft[ \t\n]+(365|Copilot|Certified)/g, 'Microsoft $1')
        .replace(/Power[ \t\n]+(BI|Automate)/g, 'Power $1')
        .replace(/roku[ \t\n]+(\d{4})/g, 'roku $1');
      if (text !== node.nodeValue) node.nodeValue = text;
    });
  }
  if (root.lang === 'cs') czechTypography(document.body);

  /* ------------------------------------------------------------------
     2) Úvodní sekvence: počká na fonty a fotku (max. ~1 s)
     ------------------------------------------------------------------ */
  const heroImg = $('.hero__photo img');
  const waitFor = [];
  if (document.fonts && document.fonts.ready) waitFor.push(document.fonts.ready);
  if (heroImg && heroImg.decode) waitFor.push(heroImg.decode().catch(() => {}));
  Promise.race([
    Promise.all(waitFor),
    new Promise((resolve) => setTimeout(resolve, 1100))
  ]).then(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

  /* ------------------------------------------------------------------
     3) Zvýrazňovač v textu: dotáhne se, když na něj čtenář dojede
     ------------------------------------------------------------------ */
  const markTargets = $$('.hl, .principle__big .mk');
  if ('IntersectionObserver' in window) {
    const markObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-on');
          markObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.6 });
    markTargets.forEach((el) => markObserver.observe(el));
  } else {
    markTargets.forEach((el) => el.classList.add('is-on'));
  }

  /* ------------------------------------------------------------------
     4) Hlavička, průběh čtení, přechod úvodu, obory a kontakt
     ------------------------------------------------------------------ */
  const masthead = $('[data-masthead]');
  const themed = $$('main [data-theme], footer[data-theme]');
  const chapters = $$('[data-chapter]');
  const chapterMarks = $$('[data-chapter-link] .mk-progress');
  const nowLabel = $('[data-now-label]');
  const hero = $('.hero');
  const firstChapter = chapters[0];
  const contact = $('[data-contact]');
  const flood = $('[data-contact-flood]');
  const contactTitle = contact ? $('.contact__title', contact) : null;
  const chapterTitles = chapters.map((ch) => {
    const h = $('.chapter__title', ch);
    return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
  });
  let currentChapter = -1;
  let ticking = false;

  /* úvod je „sticky“: drží se, dokud ho první sekce nepřekryje */
  function measureHero() {
    if (!hero) return;
    hero.style.setProperty('--hero-top', `${Math.min(0, window.innerHeight - hero.offsetHeight)}px`);
  }
  measureHero();

  /* kontakt: zvýrazňovač nejdřív přejede přes nadpis, pak se rozlije přes celou plochu */
  function updateFlood(vh) {
    if (!flood || !contactTitle) return;
    if (reduceMotion.matches) { flood.style.clipPath = ''; return; }
    const a = contact.getBoundingClientRect();
    if (a.top > vh * 1.1 || a.bottom < -vh * 0.1) return;
    const t = contactTitle.getBoundingClientRect();
    const padX = t.height * 0.06;
    const padY = t.height * 0.02;
    const box = {
      top: t.top - a.top - padY,
      right: a.right - t.right - padX,
      bottom: a.bottom - t.bottom - padY,
      left: t.left - a.left - padX
    };
    /* konec animace musí jít dosáhnout i tehdy, když stránka nejde odrolovat tak daleko */
    const maxScroll = document.documentElement.scrollHeight - vh;
    const topAtBottom = a.top - (maxScroll - window.scrollY);
    const start = vh * 0.92;
    const end = Math.min(start - vh * 0.2, Math.max(vh * 0.18, topAtBottom + 2));
    const p = clamp((start - a.top) / (start - end), 0, 1);
    let top; let right; let bottom; let left; let radius = 3;
    if (p >= 1) {
      flood.style.clipPath = 'none';
      return;
    }
    if (p < 0.32) {
      const s = easeOut(p / 0.32);
      top = box.top; bottom = box.bottom; left = box.left;
      right = box.right + (a.width - box.left - box.right) * (1 - s);
    } else {
      const f = easeInOut((p - 0.32) / 0.68);
      top = box.top * (1 - f); right = box.right * (1 - f);
      bottom = box.bottom * (1 - f); left = box.left * (1 - f);
      radius = 3 * (1 - f);
    }
    flood.style.clipPath = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${radius.toFixed(1)}px)`;
  }

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    const headH = masthead.offsetHeight;
    const probe = headH * 0.6;

    let theme = 'ink';
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) theme = el.dataset.theme;
    }
    if (masthead.dataset.on !== theme) masthead.dataset.on = theme;
    masthead.classList.toggle('is-scrolled', window.scrollY > 4);

    const readLine = vh * 0.38;
    let current = -1;
    const progress = chapters.map((ch, i) => {
      const r = ch.getBoundingClientRect();
      const p = clamp((readLine - r.top) / Math.max(1, r.height - vh * 0.3), 0, 1);
      if (chapterMarks[i]) chapterMarks[i].style.setProperty('--p', p.toFixed(4));
      if (r.top <= readLine && r.bottom > readLine) current = i;
      return p;
    });

    const reading = current >= 0 && firstChapter.getBoundingClientRect().top < headH;
    masthead.classList.toggle('is-reading', reading);
    if (current >= 0 && nowLabel) {
      if (current !== currentChapter) {
        currentChapter = current;
        nowLabel.textContent = chapterTitles[current];
        nowLabel.dataset.text = chapterTitles[current];
      }
      nowLabel.style.setProperty('--p', progress[current].toFixed(4));
    }

    if (firstChapter && hero && !reduceMotion.matches) {
      const top = firstChapter.getBoundingClientRect().top;
      if (top > -vh) hero.style.setProperty('--cover', clamp(1 - top / vh, 0, 1).toFixed(3));
    }

    updateFlood(vh);
  }
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => { measureHero(); requestUpdate(); });
  if ('ResizeObserver' in window && hero) new ResizeObserver(() => { measureHero(); requestUpdate(); }).observe(hero);
  update();

  /* ------------------------------------------------------------------
     5) Mobilní menu
     ------------------------------------------------------------------ */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-open]');
  const menuLabel = menuBtn ? $('.masthead__menu-label', menuBtn) : null;
  const mainEl = $('main');
  const footerEl = $('footer');
  let menuTimer;

  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    menu.getBoundingClientRect();
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = menuBtn.dataset.labelClose || 'Zavřít';
    document.body.classList.add('menu-open');
    mainEl.inert = true;
    footerEl.inert = true;
    const first = $('a', menu);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 120);
  }
  function closeMenu(returnFocus = true) {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = menuBtn.dataset.labelOpen || 'Menu';
    document.body.classList.remove('menu-open');
    mainEl.inert = false;
    footerEl.inert = false;
    menuTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion.matches ? 0 : 600);
    if (returnFocus) menuBtn.focus({ preventScroll: true });
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
    $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => {
      closeMenu(false);
      /* fokus přejde na cílovou sekci, aby čtečka i klávesnice pokračovaly tam */
      const target = document.getElementById(a.hash.slice(1));
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        setTimeout(() => target.focus({ preventScroll: true }), 0);
      }
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches && menu.classList.contains('is-open')) closeMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     6) Obory: rozklikávací popis s plynulým otevřením
        (bez JS fungují jako běžné <details>), otevřený je vždy jen jeden
     ------------------------------------------------------------------ */
  const topicItems = $$('.topic__item');
  const topicAnims = new WeakMap();

  function setTopic(item, open) {
    const body = $('.topic__body', item);
    /* výšku změřit dřív, než se zruší rozběhnutá animace – jinak by panel při rychlém přepnutí poskočil */
    const from = item.open ? body.getBoundingClientRect().height : 0;
    const running = topicAnims.get(item);
    if (running) running.cancel();
    if (reduceMotion.matches || !body.animate) {
      item.open = open;
      item.classList.toggle('is-open', open);
      return;
    }
    if (open) {
      item.open = true;
      body.style.height = 'auto';
    }
    const to = open ? body.scrollHeight : 0;
    item.classList.toggle('is-open', open);
    const anim = body.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: open ? 560 : 420, easing: 'cubic-bezier(.16, 1, .3, 1)' }
    );
    topicAnims.set(item, anim);
    anim.onfinish = () => {
      topicAnims.delete(item);
      body.style.height = '';
      if (!open) item.open = false;
      requestUpdate();
    };
    anim.oncancel = () => { body.style.height = ''; };
  }

  topicItems.forEach((item) => {
    if (item.open) item.classList.add('is-open');
    /* obor může otevřít i prohlížeč sám (např. hledání na stránce) – obsah pak musí být vidět */
    item.addEventListener('toggle', () => {
      if (!topicAnims.get(item)) item.classList.toggle('is-open', item.open);
    });
    $('.topic__head', item).addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !item.classList.contains('is-open');
      if (willOpen) topicItems.forEach((other) => { if (other !== item && other.classList.contains('is-open')) setTopic(other, false); });
      setTopic(item, willOpen);
    });
  });

  /* ------------------------------------------------------------------
     7) Drobnosti
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
