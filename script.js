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
const particleCount = 14;
let containerWidth = window.innerWidth;
let containerHeight = window.innerHeight;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(src) {
  const size = randomBetween(40, 100);
  const speed = randomBetween(0.15, 0.55);
  const direction = randomBetween(0, Math.PI * 2);
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.width = `${size}px`;
  particle.style.transform = `translate(${randomBetween(0, containerWidth - size)}px, ${randomBetween(0, containerHeight - size)}px) rotate(${randomBetween(0, 360)}deg)`;
  particle.style.opacity = randomBetween(0.08, 0.18);

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  particle.appendChild(img);
  particleContainer.appendChild(particle);

  return {
    el: particle,
    x: randomBetween(0, containerWidth - size),
    y: randomBetween(0, containerHeight - size),
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
  for (let i = 0; i < particleCount; i += 1) {
    particles.push(createParticle(techLogos[i % techLogos.length]));
  }
}

function animateBackground() {
  particles.forEach((particle) => {
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.rotation += particle.rotationSpeed;

    if (particle.x <= -particle.size * 0.3 || particle.x >= containerWidth - particle.size * 0.7) {
      particle.dx *= -1;
    }
    if (particle.y <= -particle.size * 0.3 || particle.y >= containerHeight - particle.size * 0.7) {
      particle.dy *= -1;
    }

    particle.el.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`;
  });
  window.requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', () => {
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
});

window.addEventListener('DOMContentLoaded', () => {
  initBackground();
  animateBackground();
});

function showMessage() {
  document.getElementById("message").innerText = "Thanks for visiting!";
}
