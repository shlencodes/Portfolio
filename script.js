gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const nav = document.getElementById("nav");
const progressBar = document.getElementById("scrollProgress");
const futCursor = document.getElementById("futCursor");
const logoSparkLayer = document.getElementById("logoSparkLayer");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
let currentScrollVelocity = 0;
let lastNativeScroll = 0;

function setScrollProgress(progress) {
  progressBar.style.transform = `scaleY(${clamp(progress, 0, 1)})`;
}

function syncScrollState(scrollTop, velocity = 0) {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  setScrollProgress(scrollTop / maxScroll);
  currentScrollVelocity = clamp(velocity, -40, 40);
  root.style.setProperty("--scroll-velocity", currentScrollVelocity.toFixed(2));
}

// Futuristic mini cursor + logo spark effects.
if (futCursor) {
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isActive = false;
  let smokeTick = 0;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!isActive) {
      isActive = true;
      futCursor.style.opacity = "1";
    }
  });

  document.addEventListener("mouseleave", () => {
    isActive = false;
    futCursor.style.opacity = "0";
  });

  document.querySelectorAll("a, button, .panel, .proj-card").forEach((element) => {
    element.addEventListener("mouseenter", () => {
      futCursor.classList.add("hover");
    });
    element.addEventListener("mouseleave", () => {
      futCursor.classList.remove("hover");
    });
  });

  document.addEventListener("mousedown", (event) => {
    futCursor.classList.add("click");

    for (let i = 0; i < 7; i += 1) {
      const blast = document.createElement("span");
      blast.className = "cursor-blast";
      blast.style.left = `${event.clientX}px`;
      blast.style.top = `${event.clientY}px`;
      const angle = (360 / 7) * i;
      blast.style.setProperty("--ra", `${angle}deg`);
      blast.style.setProperty("--dx", `${Math.cos((angle * Math.PI) / 180) * 14}px`);
      blast.style.setProperty("--dy", `${Math.sin((angle * Math.PI) / 180) * 14}px`);
      document.body.appendChild(blast);
      blast.addEventListener("animationend", () => blast.remove());
    }
  });

  document.addEventListener("mouseup", () => {
    futCursor.classList.remove("click");
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.26;
    cursorY += (mouseY - cursorY) * 0.26;
    futCursor.style.left = `${cursorX}px`;
    futCursor.style.top = `${cursorY}px`;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && isActive) {
      smokeTick += 1;
      if (smokeTick % 3 === 0) {
        const smoke = document.createElement("span");
        smoke.className = "cursor-smoke";
        smoke.style.left = `${cursorX}px`;
        smoke.style.top = `${cursorY}px`;
        smoke.style.setProperty("--sx", `${(Math.random() - 0.5) * 12}px`);
        smoke.style.setProperty("--sy", `${-8 - Math.random() * 12}px`);
        document.body.appendChild(smoke);
        smoke.addEventListener("animationend", () => smoke.remove());
      }
    }

    requestAnimationFrame(renderCursor);
  }

  renderCursor();
}

if (logoSparkLayer) {
  setInterval(() => {
    const spark = document.createElement("span");
    spark.className = "logo-spark";
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.setProperty("--sx", `${(Math.random() - 0.5) * 34}px`);
    spark.style.setProperty("--sy", `${(Math.random() - 0.5) * 26}px`);
    spark.style.background = Math.random() > 0.5 ? "#ffd18b" : "#87c5ff";
    logoSparkLayer.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove());
  }, 170);
}

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const velocity = scrollTop - lastNativeScroll;
  lastNativeScroll = scrollTop;
  syncScrollState(scrollTop, velocity);
  ScrollTrigger.update();
});

window.addEventListener("load", () => {
  syncScrollState(window.scrollY || 0, 0);

  gsap.from(".hero-copy > *", {
    y: 28,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out"
  });

  gsap.from(".hero-3d-shell", {
    scale: 0.92,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out"
  });

  gsap.from(".hero-poster", {
    y: 24,
    rotate: -4,
    opacity: 0,
    duration: 1,
    delay: 0.15,
    ease: "power3.out"
  });
});

// Background canvas: muted-vibrant comic space wash with inked orbit lines.
const bgCanvas = document.getElementById("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");
const nebulaNodes = Array.from({ length: 10 }, () => ({
  orbitX: Math.random(),
  orbitY: Math.random(),
  radius: 120 + Math.random() * 220,
  alpha: 0.06 + Math.random() * 0.08,
  drift: 0.2 + Math.random() * 0.45,
  phase: Math.random() * Math.PI * 2,
  warm: Math.random() > 0.5
}));

function resizeBackground() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  bgCanvas.width = Math.floor(window.innerWidth * dpr);
  bgCanvas.height = Math.floor(window.innerHeight * dpr);
  bgCanvas.style.width = `${window.innerWidth}px`;
  bgCanvas.style.height = `${window.innerHeight}px`;
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground(time) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  const t = time * 0.00025;
  const velocityMix = Math.min(Math.abs(currentScrollVelocity) / 18, 1);

  bgCtx.clearRect(0, 0, w, h);

  const base = bgCtx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#5972ad");
  base.addColorStop(0.45, "#465f9a");
  base.addColorStop(1, "#394d84");
  bgCtx.fillStyle = base;
  bgCtx.fillRect(0, 0, w, h);

  nebulaNodes.forEach((node, index) => {
    const x = node.orbitX * w + Math.sin(t * node.drift + node.phase) * 60;
    const y = node.orbitY * h + Math.cos(t * (node.drift + 0.15) + node.phase) * 45;
    const radius = node.radius + velocityMix * 20;
    const gradient = bgCtx.createRadialGradient(x, y, 0, x, y, radius);
    const hue = node.warm ? "228, 141, 76" : "99, 157, 228";
    gradient.addColorStop(0, `rgba(${hue}, ${node.alpha + (index % 3) * 0.01})`);
    gradient.addColorStop(1, `rgba(${hue}, 0)`);
    bgCtx.fillStyle = gradient;
    bgCtx.beginPath();
    bgCtx.arc(x, y, radius, 0, Math.PI * 2);
    bgCtx.fill();
  });

  bgCtx.save();
  bgCtx.translate(w * 0.74, h * 0.24);
  bgCtx.rotate(t * 0.18);
  for (let i = 0; i < 5; i += 1) {
    bgCtx.strokeStyle = `rgba(21, 21, 21, ${0.08 + i * 0.05})`;
    bgCtx.lineWidth = 1.4;
    bgCtx.beginPath();
    bgCtx.ellipse(0, 0, 120 + i * 36, 48 + i * 18, i * 0.32, 0, Math.PI * 2);
    bgCtx.stroke();
  }
  bgCtx.restore();

  bgCtx.save();
  bgCtx.translate(w * 0.12, h * 0.78);
  bgCtx.rotate(-0.2 + velocityMix * 0.03);
  for (let i = 0; i < 12; i += 1) {
    bgCtx.strokeStyle = `rgba(21, 21, 21, ${0.06 + i * 0.01})`;
    bgCtx.lineWidth = 1.1;
    bgCtx.beginPath();
    bgCtx.moveTo(-50, i * 16);
    bgCtx.lineTo(250, i * 12);
    bgCtx.stroke();
  }
  bgCtx.restore();

  requestAnimationFrame(drawBackground);
}

resizeBackground();
requestAnimationFrame(drawBackground);
window.addEventListener("resize", resizeBackground);

// Hero 3D scene.
const threeCanvas = document.getElementById("three-canvas");
if (threeCanvas && typeof THREE !== "undefined") {
  const container = document.getElementById("hero3d");
  const renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 6.5;

  const group = new THREE.Group();
  scene.add(group);

  const outerGeo = new THREE.IcosahedronGeometry(1.38, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x8fb2ff,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const outerShell = new THREE.Mesh(outerGeo, outerMat);
  group.add(outerShell);

  const coreGeo = new THREE.OctahedronGeometry(0.9, 0);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0xffb16b,
    roughness: 0.18,
    metalness: 0.72,
    transparent: true,
    opacity: 0.92
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const ringGeo = new THREE.TorusGeometry(2.05, 0.03, 20, 120);
  const ringAMat = new THREE.MeshBasicMaterial({
    color: 0x8fb2ff,
    transparent: true,
    opacity: 0.48
  });
  const ringA = new THREE.Mesh(ringGeo, ringAMat);
  ringA.rotation.x = Math.PI / 2.8;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0xff7182,
      transparent: true,
      opacity: 0.22
    })
  );
  ringB.rotation.y = Math.PI / 2.6;
  group.add(ringB);

  const pointGeo = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 180; i += 1) {
    points.push(
      (Math.random() - 0.5) * 4.8,
      (Math.random() - 0.5) * 4.8,
      (Math.random() - 0.5) * 4.8
    );
  }
  pointGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const pointMat = new THREE.PointsMaterial({
    color: 0xdde8ff,
    size: 0.035,
    transparent: true,
    opacity: 0.65
  });
  const dust = new THREE.Points(pointGeo, pointMat);
  group.add(dust);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x8fb2ff, 2.2, 24);
  keyLight.position.set(2.5, 3, 5);
  scene.add(keyLight);

  const warmLight = new THREE.PointLight(0xffb16b, 1.2, 18);
  warmLight.position.set(-3, -1, 4);
  scene.add(warmLight);

  let pointerX = 0;
  let pointerY = 0;
  let heroScroll = 0;

  function resizeThree() {
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  function handlePointerMove(event) {
    const rect = container.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  container.addEventListener("pointermove", handlePointerMove);

  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      heroScroll = self.progress;
    }
  });

  function renderThree() {
    requestAnimationFrame(renderThree);

    outerShell.rotation.y += 0.003;
    outerShell.rotation.x += 0.0015;
    core.rotation.x -= 0.0045;
    core.rotation.y += 0.0055;
    ringA.rotation.z += 0.0024;
    ringB.rotation.x -= 0.0021;
    dust.rotation.y += 0.0015;

    const targetRotX = pointerY * 0.32 + heroScroll * 0.35;
    const targetRotY = pointerX * 0.45 + heroScroll * 0.85;

    group.rotation.x += (targetRotX - group.rotation.x) * 0.06;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.06;
    group.position.y += ((-heroScroll * 0.42) - group.position.y) * 0.08;

    renderer.render(scene, camera);
  }

  resizeThree();
  renderThree();
  window.addEventListener("resize", resizeThree);
}

// Cinematic panel movement and section reveals.

gsap.to(".hero-copy", {
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  yPercent: -8
});

gsap.to(".hero-3d-shell", {
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  yPercent: 9,
  rotate: -3
});

gsap.to(".hero-poster", {
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  yPercent: -12,
  rotate: 5
});


const depthCards = gsap.utils.toArray(".depth-card");
gsap.set(depthCards, {
  transformPerspective: 1400,
  transformStyle: "preserve-3d"
});

const depthMM = gsap.matchMedia();

depthMM.add("(min-width: 1101px)", () => {
  gsap.set(".depth-card-front", {
    xPercent: 0,
    yPercent: 0,
    z: 70,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    opacity: 1,
    filter: "blur(0px)"
  });

  gsap.set(".depth-card-mid", {
    xPercent: 0,
    yPercent: 14,
    z: -18,
    scale: 0.9,
    rotateX: 4,
    rotateY: -9,
    opacity: 0.8,
    filter: "blur(1.2px)"
  });

  gsap.set(".depth-card-back", {
    xPercent: 0,
    yPercent: 26,
    z: -85,
    scale: 0.84,
    rotateX: 6,
    rotateY: -12,
    opacity: 0.56,
    filter: "blur(2.4px)"
  });

  const depthTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".depth-layout",
      start: "top top+=92",
      end: "+=220%",
      scrub: 1,
      pin: ".depth-stage",
      anticipatePin: 1
    }
  });

  // Phase 1: Chapter 01 peels away, Chapter 02 takes the front.
  depthTl
    .to(".depth-card-front", {
      xPercent: -12,
      yPercent: -16,
      z: -130,
      scale: 0.8,
      rotateX: -5,
      rotateY: 13,
      opacity: 0.3,
      filter: "blur(2.6px)"
    }, 0)
    .to(".depth-card-mid", {
      xPercent: 0,
      yPercent: 0,
      z: 70,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      filter: "blur(0px)"
    }, 0)
    .to(".depth-card-back", {
      xPercent: 0,
      yPercent: 11,
      z: -10,
      scale: 0.91,
      rotateX: 3,
      rotateY: -7,
      opacity: 0.78,
      filter: "blur(0.8px)"
    }, 0)
    // Phase 2: Chapter 02 exits, Chapter 03 becomes the hero.
    .to(".depth-card-mid", {
      xPercent: 12,
      yPercent: -14,
      z: -130,
      scale: 0.8,
      rotateX: -5,
      rotateY: -13,
      opacity: 0.3,
      filter: "blur(2.6px)"
    }, 1)
    .to(".depth-card-back", {
      xPercent: 0,
      yPercent: 0,
      z: 70,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      filter: "blur(0px)"
    }, 1)
    .to(".depth-card-front", {
      xPercent: -9,
      yPercent: 16,
      z: -160,
      scale: 0.76,
      rotateX: 8,
      rotateY: 18,
      opacity: 0.2,
      filter: "blur(3.2px)"
    }, 1);
});

depthMM.add("(max-width: 1100px)", () => {
  gsap.set(depthCards, { clearProps: "all" });

  gsap.from(".depth-card", {
    scrollTrigger: {
      trigger: ".depth-stage",
      start: "top 82%"
    },
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });
});

gsap.utils.toArray(".sec-head, .proj-card, .about-stack, .about-copy, .contact-big, .cl-item").forEach((element, index) => {
  gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: "top 84%"
    },
    y: 36,
    opacity: 0,
    duration: 0.9,
    delay: index % 3 === 0 ? 0 : 0.04,
    ease: "power3.out"
  });
});

gsap.utils.toArray(".proj-vis img").forEach((image) => {
  gsap.to(image, {
    scrollTrigger: {
      trigger: image.closest(".proj-card"),
      start: "top bottom",
      end: "bottom top",
      scrub: true
    },
    yPercent: -8,
    ease: "none"
  });
});

gsap.utils.toArray(".work-hype .proj-card").forEach((card, index) => {
  gsap.to(card, {
    scrollTrigger: {
      trigger: card,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    },
    yPercent: index % 2 === 0 ? -5 : 5,
    rotateZ: index % 2 === 0 ? 0.55 : -0.55,
    ease: "none"
  });
});

gsap.utils.toArray(".work-hype .proj-overlay").forEach((badge, index) => {
  gsap.to(badge, {
    y: -6,
    duration: 1.1 + index * 0.08,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
});

gsap.from(".profile-radar", {
  scrollTrigger: {
    trigger: ".profile-radar",
    start: "top 86%"
  },
  scale: 0.84,
  opacity: 0,
  duration: 0.95,
  ease: "power3.out"
});

gsap.to(".about-hype .about-panel img", {
  scrollTrigger: {
    trigger: ".about-hype .about-panel",
    start: "top bottom",
    end: "bottom top",
    scrub: true
  },
  yPercent: -9,
  scale: 1.06,
  ease: "none"
});

gsap.from(".bio-ribbons span", {
  scrollTrigger: {
    trigger: ".bio-ribbons",
    start: "top 90%"
  },
  y: 14,
  opacity: 0,
  duration: 0.55,
  stagger: 0.08,
  ease: "power2.out"
});

gsap.utils.toArray(".work-hype .proj-title, .work-hype .proj-desc, .about-hype .about-bio, .about-hype .about-bio2").forEach((node, index) => {
  gsap.from(node, {
    scrollTrigger: {
      trigger: node,
      start: "top 90%"
    },
    y: 16,
    opacity: 0,
    duration: 0.65,
    delay: (index % 3) * 0.04,
    ease: "power2.out"
  });
});

const reactiveCards = document.querySelectorAll(".work-hype .reactive-card");
reactiveCards.forEach((card) => {
  const image = card.querySelector(".proj-vis img");
  const scan = card.querySelector(".proj-scan");
  if (!image || !scan) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${px.toFixed(2)}%`);
    card.style.setProperty("--my", `${py.toFixed(2)}%`);

    const x = ((px - 50) / 50) * 10;
    const y = ((py - 50) / 50) * 8;
    gsap.to(image, {
      x,
      y,
      duration: 0.28,
      overwrite: true,
      ease: "power2.out"
    });
    gsap.to(scan, {
      x: x * 0.55,
      y: y * 0.42,
      duration: 0.3,
      overwrite: true,
      ease: "power2.out"
    });
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    gsap.to(image, {
      x: 0,
      y: 0,
      duration: 0.35,
      overwrite: true,
      ease: "power2.out"
    });
    gsap.to(scan, {
      x: 0,
      y: 0,
      duration: 0.35,
      overwrite: true,
      ease: "power2.out"
    });
  });
});

const aboutReactive = document.querySelectorAll(".about-hype .about-panel, .about-hype .profile-radar");
aboutReactive.forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(panel, {
      rotateY: px * 5.2,
      rotateX: -py * 5.2,
      transformPerspective: 900,
      duration: 0.28,
      overwrite: true,
      ease: "power2.out"
    });
  });

  panel.addEventListener("pointerleave", () => {
    gsap.to(panel, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.34,
      overwrite: true,
      ease: "power2.out"
    });
  });
});

gsap.utils.toArray(".metric-value[data-val]").forEach((element) => {
  ScrollTrigger.create({
    trigger: element,
    start: "top 92%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        element,
        { textContent: 0 },
        {
          textContent: Number(element.dataset.val),
          duration: 1.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            element.textContent = String(Math.round(this.targets()[0].textContent)).padStart(2, "0");
          }
        }
      );
    }
  });
});

gsap.utils.toArray(".gs-num[data-val]").forEach((element) => {
  ScrollTrigger.create({
    trigger: element,
    start: "top 88%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        element,
        { textContent: 0 },
        {
          textContent: Number(element.dataset.val),
          duration: 1.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            element.textContent = String(Math.round(this.targets()[0].textContent)).padStart(2, "0");
          }
        }
      );
    }
  });
});

gsap.utils.toArray(".grind-meter").forEach((meter) => {
  const fill = meter.querySelector(".grind-meter-fill");
  const progress = Number(meter.dataset.progress || 0);
  if (!fill) return;

  gsap.to(fill, {
    width: `${progress}%`,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: meter,
      start: "top 90%",
      once: true
    }
  });
});

ScrollTrigger.create({
  start: "top -40",
  onUpdate: (self) => {
    nav.classList.toggle("scrolled", self.scroll() > 40);
  }
});

const footerTime = document.getElementById("footerTime");

function updateClock() {
  footerTime.textContent = `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date())} UTC`;
}

updateClock();
setInterval(updateClock, 1000);
