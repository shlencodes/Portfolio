// Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: true,
  touchMultiplier: 1.7,
  infinite: false
});

gsap.registerPlugin(ScrollTrigger);

// IMPORTANT: drive Lenis from a single RAF source (GSAP ticker only).
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Scroll Progress & Nav
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scrollProgress');

lenis.on('scroll', (e) => {
  const scrollY = e && typeof e.scroll === 'number' ? e.scroll : window.scrollY;
  if (scrollY > 50 && nav) {
    nav.classList.add('scrolled');
  } else if (nav) {
    nav.classList.remove('scrolled');
  }

  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
  if (scrollProgress) {
    scrollProgress.style.transform = `scaleY(${progress})`;
  }
});

// Custom Cursor
const cursor = document.getElementById('futCursor');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor && (cursor.style.opacity === "0" || cursor.style.opacity === "")) {
    cursor.style.opacity = "1";
  }
});

// Lerp cursor
function renderCursor() {
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;
  if (cursor) {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  }
  requestAnimationFrame(renderCursor);
}
renderCursor();

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const hoverElements = document.querySelectorAll('a, button, .reactive-card, .depth-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hover'); });
  });
}

document.addEventListener('mousedown', (e) => {
  if (cursor) cursor.classList.add('click');
  // Click blast
  const blast = document.createElement('div');
  blast.className = 'cursor-blast';
  blast.style.left = `${e.clientX}px`;
  blast.style.top = `${e.clientY}px`;

  // Random rotation for blast
  const rot = Math.random() * 360;
  blast.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;

  document.body.appendChild(blast);
  setTimeout(() => blast.remove(), 500);
});
document.addEventListener('mouseup', () => {
  if (cursor) cursor.classList.remove('click');
});

// Logo Sparks
const logoSparkLayer = document.getElementById('logoSparkLayer');
function createSpark() {
  if (!logoSparkLayer) return;
  const spark = document.createElement('div');
  spark.className = 'logo-spark';

  const sx = (Math.random() - 0.5) * 60;
  const sy = (Math.random() - 0.5) * 60;
  spark.style.setProperty('--sx', `${sx}px`);
  spark.style.setProperty('--sy', `${sy}px`);
  spark.style.left = `${Math.random() * 100}%`;
  spark.style.top = `${Math.random() * 100}%`;

  logoSparkLayer.appendChild(spark);
  setTimeout(() => spark.remove(), 800);
}
setInterval(createSpark, 400);

// Footer Time
const footerTime = document.getElementById('footerTime');
function updateTime() {
  if (!footerTime) return;
  const now = new Date();
  footerTime.textContent = now.toISOString().split('T')[1].split('.')[0] + ' UTC';
}
setInterval(updateTime, 1000);
updateTime();

// Metrics Counter
const metrics = document.querySelectorAll('.metric-value, .gs-num');
metrics.forEach(metric => {
  const targetStr = metric.getAttribute('data-val');
  if (!targetStr) return;
  const target = parseInt(targetStr);
  if (isNaN(target)) return;

  gsap.to(metric, {
    scrollTrigger: {
      trigger: metric,
      start: 'top 90%',
      once: true,
      toggleActions: 'play none none none',
      invalidateOnRefresh: true
    },
    innerHTML: target,
    duration: 2,
    snap: { innerHTML: 1 },
    onUpdate: function () {
      metric.innerHTML = Math.ceil(this.targets()[0].innerHTML).toString().padStart(2, '0');
    }
  });
});

// Grind Meters
const meters = document.querySelectorAll('.grind-meter');
meters.forEach(meter => {
  const progress = meter.getAttribute('data-progress');
  const fill = meter.querySelector('.grind-meter-fill');
  if (fill && progress) {
    gsap.set(fill, { width: '0%' });
    gsap.to(fill, {
      scrollTrigger: {
        trigger: meter,
        start: 'top 82%',
        once: true,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true
      },
      width: `${progress}%`,
      duration: 1.5,
      ease: 'power3.out'
    });
  }
});

// GSAP Animations (viewport-triggered)
gsap.from('.hero-title', {
  y: 40, opacity: 0, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.hero', start: 'top 78%', once: true, toggleActions: 'play none none none' }
});
gsap.from('.hero-sub', {
  y: 20, opacity: 0, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.hero', start: 'top 76%', once: true, toggleActions: 'play none none none', invalidateOnRefresh: true }
});
gsap.from('.hero-actions a', {
  y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)',
  scrollTrigger: { trigger: '.hero-actions', start: 'top 84%', once: true, toggleActions: 'play none none none', invalidateOnRefresh: true }
});
gsap.from('.hero-metrics .metric', {
  y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
  scrollTrigger: { trigger: '.hero-metrics', start: 'top 86%', once: true, toggleActions: 'play none none none', invalidateOnRefresh: true }
});

// Depth Cards Stacking
const depthCards = document.querySelectorAll('.depth-card');
if (depthCards.length > 0) {
  const depthMM = gsap.matchMedia();

  depthMM.add('(min-width: 821px)', () => {
    gsap.set(depthCards, { transformPerspective: 1100 });
    gsap.set(depthCards[0], { y: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1, zIndex: 3 });
    if (depthCards[1]) gsap.set(depthCards[1], { y: 60, rotateX: -5, rotateZ: 0.8, scale: 0.98, opacity: 0.96, zIndex: 2 });
    if (depthCards[2]) gsap.set(depthCards[2], { y: 118, rotateX: -9, rotateZ: -0.6, scale: 0.95, opacity: 0.9, zIndex: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.depth-layout',
        start: 'top top+=88',
        end: '+=260%',
        scrub: 1.25,
        pin: '.depth-stage',
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(depthCards[0], { y: -140, rotateX: 8, rotateZ: -2.2, scale: 0.93, opacity: 0.78, zIndex: 1 }, 0)
      .to(depthCards[1], { y: -62, rotateX: 2.5, rotateZ: -1.2, scale: 0.98, opacity: 1, zIndex: 3 }, 0)
      .to(depthCards[2], { y: 10, rotateX: -2.5, rotateZ: 1.1, scale: 0.97, opacity: 0.93, zIndex: 2 }, 0)
      .to(depthCards[1], { y: -146, rotateX: 8.2, rotateZ: -2.3, scale: 0.93, opacity: 0.76, zIndex: 1 }, 1)
      .to(depthCards[2], { y: -58, rotateX: 2, rotateZ: -1.1, scale: 0.99, opacity: 1, zIndex: 3 }, 1)
      .to(depthCards[0], { y: 14, rotateX: -3.2, rotateZ: 1.4, scale: 0.96, opacity: 0.9, zIndex: 2 }, 1);
  });

  depthMM.add('(max-width: 820px)', () => {
    gsap.set(depthCards, { clearProps: 'all' });

    gsap.from(depthCards, {
      y: 34,
      opacity: 0,
      duration: 0.75,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.depth-stage',
        start: 'top 84%',
        once: true,
        invalidateOnRefresh: true
      }
    });

    depthCards.forEach((card, i) => {
      gsap.to(card, {
        y: -10 * (i + 1),
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.45,
          invalidateOnRefresh: true
        }
      });
    });
  });
}

// Background Canvas (Starfield / Nebula)
const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  let width, height;
  let particles = [];

  function resizeBg() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 10000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.1 + 0.05,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  function renderBg() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y -= p.speedY;
      if (p.y < -10) p.y = height + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(renderBg);
  }

  window.addEventListener('resize', resizeBg);
  resizeBg();
  renderBg();
}

// Three.js Hero Canvas
const threeCanvas = document.getElementById('three-canvas');
if (threeCanvas && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });

  const setSize = () => {
    const parent = threeCanvas.parentElement;
    if (parent) {
      renderer.setSize(parent.clientWidth, parent.clientHeight);
      camera.aspect = parent.clientWidth / parent.clientHeight;
      camera.updateProjectionMatrix();
    }
  };
  setSize();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create object (Octahedron inside Icosahedron)
  const group = new THREE.Group();

  const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffd085,
    roughness: 0.2,
    metalness: 0.8,
    wireframe: false
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const shellGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x7ab8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  scene.add(group);

  // Lights
  const light1 = new THREE.PointLight(0xffa245, 2, 10);
  light1.position.set(2, 2, 2);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x459bff, 2, 10);
  light2.position.set(-2, -2, 2);
  scene.add(light2);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  camera.position.z = 5;

  // Mouse interaction
  let targetX = 0;
  let targetY = 0;

  const hero3d = document.getElementById('hero3d');
  if (hero3d) {
    hero3d.addEventListener('mousemove', (e) => {
      const rect = hero3d.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetX = x * 0.5;
      targetY = y * 0.5;
    });
    hero3d.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });
  }

  // Resize handler
  window.addEventListener('resize', setSize);

  // Animation Loop
  const clock = new THREE.Clock();

  function animateThree() {
    requestAnimationFrame(animateThree);
    const delta = clock.getDelta();

    // Auto rotation
    group.rotation.y += 0.2 * delta;
    group.rotation.x += 0.1 * delta;

    core.rotation.y -= 0.5 * delta;

    // Mouse rotation lerp
    group.rotation.x += (targetY - group.rotation.x) * 0.05;
    group.rotation.y += (targetX - group.rotation.y) * 0.05;

    // Float effect
    group.position.y = Math.sin(clock.getElapsedTime()) * 0.1;

    renderer.render(scene, camera);
  }

  animateThree();
}

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

