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

function updateThemeButton(btn, theme) {
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function setTheme(theme, persist = true) {
  document.body.dataset.theme = theme;
  if (persist) localStorage.setItem('theme', theme);
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) updateThemeButton(toggle, theme);
}

function toggleTheme() {
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
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
  setTheme(getPreferredTheme(), false);
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
  initNav();
  initBackground();
  animateBackground();
});

const wrapper = document.querySelector(".sparkles-wrapper");
    const sparklesCount = 12;

    function createSparkle() {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "sparkle");
      svg.setAttribute("width", "21");
      svg.setAttribute("height", "21");
      svg.setAttribute("viewBox", "0 0 21 21");

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute(
        "d",
        "M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
      );

      const color =
        Math.random() > 0.5
          ? "var(--sparkles-first-color)"
          : "var(--sparkles-second-color)";
      path.setAttribute("fill", color);

      svg.appendChild(path);

      // Random position
      svg.style.left = `${Math.random() * 100}%`;
      svg.style.top = `${Math.random() * 100}%`;

      // Random delay
      svg.style.animationDelay = `${Math.random() * 2}s`;

      // Random scale
      const scale = Math.random() * 1 + 0.3;
      svg.style.transform = `scale(${scale})`;

      return svg;
    }

    // Generate sparkles
    for (let i = 0; i < sparklesCount; i++) {
      wrapper.appendChild(createSparkle());
    }