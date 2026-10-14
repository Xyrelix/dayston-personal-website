const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== NETWORK MESH BACKGROUND ===== */
function initMesh() {
  const canvas = document.querySelector('.mesh-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const LINK_DIST = 140;
  const POINTER_DIST = 180;
  const pointer = { x: -9999, y: -9999 };
  let nodes = [];
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.round((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
    }));
  }

  function draw() {
    const light = document.body.dataset.theme === 'light';
    const rgb = light ? '91, 33, 182' : '167, 139, 250';
    const pointerRgb = light ? '8, 145, 178' : '34, 211, 238';
    const boost = light ? 1.6 : 1;
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      if (!prefersReducedMotion) {
        n.x += n.dx;
        n.y += n.dy;
        if (n.x < 0 || n.x > width) n.dx *= -1;
        if (n.y < 0 || n.y > height) n.dy *= -1;

        // Gentle pull toward the cursor
        const px = pointer.x - n.x;
        const py = pointer.y - n.y;
        if (Math.hypot(px, py) < POINTER_DIST) {
          n.x += px * 0.004;
          n.y += py * 0.004;
        }
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${Math.min(0.55 * boost, 0.85)})`;
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(${rgb}, ${(1 - d / LINK_DIST) * 0.22 * boost})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (pd < POINTER_DIST) {
        ctx.strokeStyle = `rgba(${pointerRgb}, ${(1 - pd / POINTER_DIST) * 0.45 * boost})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
  }

  function loop() {
    if (!document.hidden) draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
  window.addEventListener('resize', () => { resize(); if (prefersReducedMotion) draw(); });

  resize();
  if (prefersReducedMotion) {
    draw();
    new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  } else {
    loop();
  }
}

/* ===== THEME ===== */
function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme, persist = true) {
  document.body.dataset.theme = theme;
  if (persist) localStorage.setItem('theme', theme);
}

function initThemeToggle() {
  const switchToggle = document.getElementById('theme-input');
  if (!switchToggle || typeof gsap === 'undefined') return;

  const back = document.getElementById('back');
  const front = document.getElementById('front');
  let isDay = true;

  const syncScenes = () => {
    back?.setAttribute('href', '#' + (isDay ? 'day' : 'night'));
    front?.setAttribute('href', '#' + (isDay ? 'night' : 'day'));
  };

  const duration = 0.4;
  const scale = 30;
  const toNightAnimation = gsap.timeline({ paused: true });

  toNightAnimation
    .to('#night-content', { duration: duration * 0.5, opacity: 1, ease: 'power2.inOut' })
    .to('#circle', {
      duration,
      ease: 'power4.in',
      scaleX: scale,
      scaleY: scale,
      x: 1,
      transformOrigin: '100% 50%',
    }, 0)
    .set('#circle', { scaleX: -scale, onUpdate: syncScenes }, duration)
    .to('#circle', {
      duration,
      ease: 'power4.out',
      scaleX: -1,
      scaleY: 1,
      x: 2,
    }, duration)
    .to('#day-content', { duration: duration * 0.5, opacity: 0.5 }, duration * 1.5);

  // Star twinkling
  document.querySelectorAll('.star').forEach(star =>
    gsap.to(star, { duration: 'random(0.4, 1.5)', repeat: -1, yoyo: true, opacity: 'random(0.2, 0.5)' })
  );

  // Cloud drift
  gsap.to('.clouds-big',    { duration: 15, repeat: -1, x: -74, ease: 'linear' });
  gsap.to('.clouds-medium', { duration: 20, repeat: -1, x: -65, ease: 'linear' });
  gsap.to('.clouds-small',  { duration: 25, repeat: -1, x: -71, ease: 'linear' });

  switchToggle.addEventListener('change', () => {
    isDay = switchToggle.checked;
    setTheme(isDay ? 'light' : 'dark');
    isDay ? toNightAnimation.reverse() : toNightAnimation.play();
  });

  // Initialise to saved/system preference without animating
  const theme = getPreferredTheme();
  if (theme === 'dark') {
    isDay = false;
    switchToggle.checked = false;
    syncScenes();
    toNightAnimation.progress(1).pause();
  } else {
    switchToggle.checked = true;
  }
  setTheme(theme, false);
}

/* ===== ANIMATED NAV TABS ===== */
function initAnimatedNav() {
  const nav = document.getElementById('nav-links');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a'));

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  const hoverBg = document.createElement('span');
  hoverBg.className = 'nav-hover-bg';
  nav.appendChild(indicator);
  nav.appendChild(hoverBg);

  let activeLink = null;

  function relRect(el) {
    const nr = nav.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return { left: er.left - nr.left, top: er.top - nr.top, width: er.width, height: er.height };
  }

  function moveIndicator(link) {
    const r = relRect(link);
    if (r.width === 0) return;
    indicator.style.left  = r.left + 'px';
    indicator.style.width = r.width + 'px';
    indicator.style.opacity = '1';
  }

  function setActive(link) {
    links.forEach(l => l.classList.remove('nav-active'));
    activeLink = link || null;
    if (link) {
      link.classList.add('nav-active');
      moveIndicator(link);
    } else {
      indicator.style.opacity = '0';
    }
  }

  // Hover background follows cursor between tabs
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const r = relRect(link);
      hoverBg.style.left    = r.left   + 'px';
      hoverBg.style.top     = r.top    + 'px';
      hoverBg.style.width   = r.width  + 'px';
      hoverBg.style.height  = r.height + 'px';
      hoverBg.style.opacity = '0.08';
    });
  });
  nav.addEventListener('mouseleave', () => { hoverBg.style.opacity = '0'; });

  // Click sets active immediately
  links.forEach(link => link.addEventListener('click', () => setActive(link)));

  // Scroll-based active tracking via IntersectionObserver
  const sectionIds = links.map(l => l.getAttribute('href')?.replace('#', '')).filter(Boolean);
  const visible = new Set();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id));
    const topId = sectionIds.find(id => visible.has(id));
    setActive(topId ? links.find(l => l.getAttribute('href') === '#' + topId) : null);
  }, { threshold: 0.25 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Reposition indicator when window resizes
  window.addEventListener('resize', () => { if (activeLink) moveIndicator(activeLink); });
}

/* ===== MOBILE NAV ===== */
function initNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  function closeNav() {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      closeNav();
    }
  });
}

/* ===== SCROLL PROGRESS ===== */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ===== ROTATING HERO ROLE ===== */
function initRotator() {
  const el = document.querySelector('.rotator');
  if (!el || prefersReducedMotion) return;
  const words = el.dataset.words.split('|');
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  function tick() {
    let delay = deleting ? 40 : 75;
    if (deleting) {
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 300;
      }
    } else {
      charIndex++;
      if (charIndex === words[wordIndex].length) {
        deleting = true;
        delay = 2200;
      }
    }
    el.textContent = words[wordIndex].slice(0, charIndex);
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2600);
}

/* ===== HERO STATS ===== */
function initStats() {
  const counts = {
    projects: document.querySelectorAll('.project-card').length,
    tech: document.querySelectorAll('.tech-card').length,
  };
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = counts[el.dataset.count];
    if (!target) return;
    el.textContent = target;
    if (prefersReducedMotion) return;

    const duration = 1400;
    el.textContent = '0';
    setTimeout(() => {
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 700);
  });
}

/* ===== STACK ORBIT ===== */
// Builds the orbit + legend from the plain .tech-grid list, which stays as the no-JS fallback.
function initStackOrbit() {
  const grid = document.querySelector('.tech-grid');
  if (!grid) return;

  const palette = ['#8b5cf6', '#22d3ee', '#f472b6', '#f59e0b', '#34d399'];
  const groups = Array.from(grid.querySelectorAll('.tech-group')).map((group, i) => ({
    name: group.querySelector('.tech-category').textContent.trim(),
    color: palette[i % palette.length],
    items: Array.from(group.querySelectorAll('.tech-card')).map(card => ({
      label: card.querySelector(':scope > span:last-child').textContent.trim(),
      icon: card.querySelector('.tech-icon'),
    })),
  }));
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  // Inner ring: first group; middle: next two; outer: the rest
  const rings = [
    { r: 0.18, dur: 60, groups: [] },
    { r: 0.31, dur: 85, groups: [] },
    { r: 0.44, dur: 110, groups: [] },
  ];
  groups.forEach((g, i) => rings[i === 0 ? 0 : i <= 2 ? 1 : 2].groups.push(i));

  const layout = document.createElement('div');
  layout.className = 'stack-orbit-layout';

  const orbit = document.createElement('div');
  orbit.className = 'orbit';
  orbit.setAttribute('aria-hidden', 'true');
  orbit.innerHTML = `<div class="orbit-core"><span class="orbit-core-glyph">&lt;/&gt;</span><strong>${total}</strong><span>technologies</span></div>`;

  const orbitItems = [];
  rings.forEach((ring, ringIndex) => {
    const ringEl = document.createElement('div');
    ringEl.className = 'orbit-ring';
    ringEl.style.setProperty('--r', ring.r);
    ringEl.style.setProperty('--dur', `${ring.dur}s`);
    ringEl.style.setProperty('--dir', ringIndex % 2 ? 'reverse' : 'normal');
    ringEl.style.setProperty('--cdir', ringIndex % 2 ? 'normal' : 'reverse');

    const entries = ring.groups.flatMap(gi => groups[gi].items.map(item => ({ ...item, gi })));
    const offset = ringIndex * 25;
    entries.forEach((entry, idx) => {
      const item = document.createElement('div');
      item.className = 'orbit-item';
      item.dataset.cat = entry.gi;
      item.style.setProperty('--a', `${offset + (idx / entries.length) * 360}deg`);
      item.style.setProperty('--cat', groups[entry.gi].color);

      const chip = document.createElement('div');
      chip.className = 'orbit-chip';
      const face = document.createElement('div');
      face.className = 'orbit-chip-face';
      face.appendChild(entry.icon.cloneNode(true));
      const label = document.createElement('span');
      label.className = 'orbit-label';
      label.textContent = entry.label;
      chip.append(face, label);
      item.appendChild(chip);
      ringEl.appendChild(item);
      orbitItems.push(item);
    });
    orbit.appendChild(ringEl);
  });

  const legend = document.createElement('ul');
  legend.className = 'stack-legend';
  const legendItems = groups.map((g, i) => {
    const li = document.createElement('li');
    li.dataset.cat = i;
    li.style.setProperty('--cat', g.color);
    li.innerHTML = `
      <div class="legend-head"><span class="legend-dot"></span><h3 class="legend-name"></h3><span class="legend-count">${g.items.length}</span></div>
      <p class="legend-items"></p>`;
    li.querySelector('.legend-name').textContent = g.name;
    li.querySelector('.legend-items').textContent = g.items.map(it => it.label).join(' · ');
    legend.appendChild(li);
    return li;
  });

  function focusCategory(cat) {
    orbit.classList.toggle('has-focus', cat != null);
    legend.classList.toggle('has-focus', cat != null);
    orbitItems.forEach(el => el.classList.toggle('is-focus', el.dataset.cat === cat));
    legendItems.forEach(el => el.classList.toggle('is-focus', el.dataset.cat === cat));
  }

  [...legendItems, ...orbitItems].forEach(el => {
    el.addEventListener('mouseenter', () => focusCategory(el.dataset.cat));
    el.addEventListener('mouseleave', () => focusCategory(null));
  });

  layout.append(orbit, legend);
  grid.after(layout);
  grid.hidden = true;
}

/* ===== SCROLL REVEAL ===== */
function initReveal() {
  const groups = [
    ['.section-eyebrow, .section-title, .section-body, .btn-resume, .contact-email', 0],
    ['.tech-category', 0],
    ['.tech-card', 40],
    ['.orbit', 0],
    ['.stack-legend li', 70],
    ['.project-card', 70],
    ['.social-link', 60],
  ];
  const targets = [];
  groups.forEach(([selector, stagger]) => {
    document.querySelectorAll(selector).forEach(el => {
      const siblings = Array.from(el.parentElement.children).filter(c => c.matches(selector));
      el.style.setProperty('--reveal-delay', `${siblings.indexOf(el) * stagger}ms`);
      el.classList.add('reveal');
      targets.push(el);
    });
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => observer.observe(el));
}

/* ===== CARD SPOTLIGHT ===== */
function initSpotlight() {
  document.querySelectorAll('.project-card, .tech-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* ===== INIT ===== */
window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNav();
  initAnimatedNav();
  initMesh();
  initScrollProgress();
  initRotator();
  initStackOrbit();
  initStats();
  initReveal();
  initSpotlight();
});
