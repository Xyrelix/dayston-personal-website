const techLogos = [
  "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg",
  "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg",
  "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg",
  "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
  "https://upload.wikimedia.org/wikipedia/commons/0/0a/Python.svg",
  "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg"
];

const particleContainer = document.querySelector('.background-tech');
const particles = [];
const PARTICLE_COUNT = 14;
let containerWidth = window.innerWidth;
let containerHeight = window.innerHeight;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(src) {
  const size = randomBetween(40, 100);
  const speed = randomBetween(0.15, 0.55);
  const direction = randomBetween(0, Math.PI * 2);
  const x = randomBetween(0, containerWidth - size);
  const y = randomBetween(0, containerHeight - size);

  const el = document.createElement('div');
  el.className = 'particle';
  el.style.width = `${size}px`;
  el.style.opacity = randomBetween(0.05, 0.1);
  el.style.transform = `translate(${x}px, ${y}px) rotate(${randomBetween(0, 360)}deg)`;

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  el.appendChild(img);
  particleContainer.appendChild(el);

  return {
    el,
    x,
    y,
    dx: Math.cos(direction) * speed,
    dy: Math.sin(direction) * speed,
    size,
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-0.03, 0.03)
  };
}

function initBackground() {
  particleContainer.innerHTML = '';
  particles.length = 0;
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(techLogos[i % techLogos.length]));
  }
}

function animateBackground() {
  for (const p of particles) {
    p.x += p.dx;
    p.y += p.dy;
    p.rotation += p.rotationSpeed;

    if (p.x <= -p.size * 0.3 || p.x >= containerWidth - p.size * 0.7) p.dx *= -1;
    if (p.y <= -p.size * 0.3 || p.y >= containerHeight - p.size * 0.7) p.dy *= -1;

    p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
  }
  requestAnimationFrame(animateBackground);
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
  }
  setTheme(theme, false);
}

/* ===== MOBILE NAV ===== */
function initNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  function closeNav() {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
  }

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.textContent = isOpen ? '✕' : '☰';
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

/* ===== INIT ===== */
window.addEventListener('resize', () => {
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
});

window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNav();
  initBackground();
  animateBackground();
});