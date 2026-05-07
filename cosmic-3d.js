gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("cosmosCanvas");
const labelEls = {
  core: document.getElementById("label-core"),
  edit: document.getElementById("label-edit"),
  systems: document.getElementById("label-systems"),
  comms: document.getElementById("label-comms"),
  orbit: document.getElementById("label-orbit"),
  scout: document.getElementById("label-scout")
};
const endPortal = document.getElementById("endPortal");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x3a4f8f, 8, 36);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 9.2);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setClearColor(0x000000, 0);

const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const key = new THREE.DirectionalLight(0x95ccff, 1.25);
key.position.set(2.9, 3.2, 4.8);
scene.add(key);

const warm = new THREE.DirectionalLight(0xffc082, 1.02);
warm.position.set(-4.2, -2.1, 3.1);
scene.add(warm);

function makeOutlinedMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  const outline = new THREE.Mesh(
    geometry.clone(),
    new THREE.MeshBasicMaterial({
      color: 0x101010,
      side: THREE.BackSide
    })
  );
  outline.scale.set(1.06, 1.06, 1.06);
  mesh.add(outline);
  return mesh;
}

function buildCartoonPlanetTexture(baseA, baseB, detailA, detailB, seedShift) {
  const cvs = document.createElement("canvas");
  cvs.width = 512;
  cvs.height = 256;
  const ctx = cvs.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, baseA);
  grad.addColorStop(1, baseB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 26; i += 1) {
    const y = ((i * 21) + seedShift) % 256;
    const h = 8 + ((i * 7) % 22);
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = i % 2 ? detailA : detailB;
    ctx.beginPath();
    ctx.ellipse(256, y, 312 - (i % 4) * 36, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 46; i += 1) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = i % 2 ? detailB : detailA;
    const x = (i * 37 + seedShift * 3) % 512;
    const y = (i * 19 + seedShift * 2) % 256;
    ctx.beginPath();
    ctx.arc(x, y, 8 + (i % 6) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createPlanet(radius, palette) {
  const tex = buildCartoonPlanetTexture(
    palette.baseA,
    palette.baseB,
    palette.detailA,
    palette.detailB,
    palette.seed
  );
  const mat = new THREE.MeshToonMaterial({
    map: tex,
    gradientMap: null
  });
  return makeOutlinedMesh(new THREE.SphereGeometry(radius, 40, 40), mat);
}

const corePlanetRadius = 2.15;
const editPlanetRadius = 1.9;
const systemsPlanetRadius = 1.75;
const commsMoonRadius = 1.35;
const orbitPlanetRadius = 1.22;
const scoutPlanetRadius = 1.02;

const corePlanet = createPlanet(corePlanetRadius, {
  baseA: "#89d0ff",
  baseB: "#456cbf",
  detailA: "#b8ecff",
  detailB: "#2f4f9b",
  seed: 17
});
corePlanet.position.set(-3.7, 1.1, -2.7);
world.add(corePlanet);

const editPlanet = createPlanet(editPlanetRadius, {
  baseA: "#ffbf82",
  baseB: "#dc7f42",
  detailA: "#ffe0b4",
  detailB: "#9d4f24",
  seed: 39
});
editPlanet.position.set(3.1, -1.05, -3.9);
world.add(editPlanet);

const systemsPlanet = createPlanet(systemsPlanetRadius, {
  baseA: "#ff8eb5",
  baseB: "#b54d84",
  detailA: "#ffc1d8",
  detailB: "#7b2a58",
  seed: 63
});
systemsPlanet.position.set(0.2, 2.25, -5.7);
world.add(systemsPlanet);

const commsMoon = createPlanet(commsMoonRadius, {
  baseA: "#ffe9a7",
  baseB: "#f0bb65",
  detailA: "#fff5cf",
  detailB: "#b57e3d",
  seed: 81
});
commsMoon.position.set(2.1, 1.85, -1.4);
world.add(commsMoon);

const orbitPlanet = createPlanet(orbitPlanetRadius, {
  baseA: "#86f0d9",
  baseB: "#278d77",
  detailA: "#b8ffef",
  detailB: "#1a6454",
  seed: 41
});
orbitPlanet.position.set(-0.4, -2.35, -7.1);
world.add(orbitPlanet);

const scoutPlanet = createPlanet(scoutPlanetRadius, {
  baseA: "#b2b0ff",
  baseB: "#625acc",
  detailA: "#dcd9ff",
  detailB: "#3b3494",
  seed: 97
});
scoutPlanet.position.set(4.7, 2.8, -8.8);
world.add(scoutPlanet);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.76, 0.11, 20, 160),
  new THREE.MeshToonMaterial({ color: 0xe36692 })
);
ring.position.copy(editPlanet.position);
ring.rotation.x = Math.PI * 0.64;
ring.rotation.z = 0.23;
world.add(ring);

const ringOutline = new THREE.Mesh(
  ring.geometry.clone(),
  new THREE.MeshBasicMaterial({
    color: 0x111111,
    side: THREE.BackSide
  })
);
ringOutline.scale.set(1.05, 1.05, 1.05);
ring.add(ringOutline);

const asteroidBelt = new THREE.Group();
for (let i = 0; i < 130; i += 1) {
  const asteroid = makeOutlinedMesh(
    new THREE.IcosahedronGeometry(0.045 + Math.random() * 0.06, 0),
    new THREE.MeshToonMaterial({ color: Math.random() > 0.5 ? 0xffd39a : 0x9fd2ff })
  );
  const angle = (i / 130) * Math.PI * 2;
  const radius = 4.8 + Math.random() * 1.4;
  asteroid.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 1.9,
    Math.sin(angle) * radius - 6.4
  );
  asteroidBelt.add(asteroid);
}
world.add(asteroidBelt);

const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 820; i += 1) {
  starPos.push(
    (Math.random() - 0.5) * 78,
    (Math.random() - 0.5) * 46,
    -Math.random() * 56 - 2
  );
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({
    color: 0xfff7e1,
    size: 0.06,
    transparent: true,
    opacity: 0.85
  })
);
scene.add(stars);

const pointer = { x: 0, y: 0 };
window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
});

const cameraState = {
  x: 0,
  y: 0.3,
  z: 9.2,
  tx: 0,
  ty: 0.1,
  tz: -4.8
};

let scrollSpeedRamp = 0;
let progressValue = 0;
let focusKey = "core";

const scrollTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.1,
    onUpdate: (self) => {
      progressValue = self.progress;
      scrollSpeedRamp = Math.min(Math.abs(self.getVelocity()) / 2400, 1.45);
      if (self.progress < 0.18) {
        focusKey = "core";
      } else if (self.progress < 0.36) {
        focusKey = "edit";
      } else if (self.progress < 0.54) {
        focusKey = "systems";
      } else if (self.progress < 0.70) {
        focusKey = "comms";
      } else if (self.progress < 0.84) {
        focusKey = "orbit";
      } else if (self.progress < 0.95) {
        focusKey = "scout";
      } else {
        focusKey = "none";
      }
    }
  }
});

scrollTL
  .to(cameraState, { x: -1.25, y: 1.45, z: 2.15, tx: -3.75, ty: 1.1, tz: -2.7 }, 0)
  .to(world.rotation, { y: 0.58, x: 0.12 }, 0)
  .to(cameraState, { x: 1.72, y: -0.65, z: 0.98, tx: 3.1, ty: -1.05, tz: -3.9 }, 1)
  .to(world.rotation, { y: -0.42, x: -0.16 }, 1)
  .to(cameraState, { x: 0.12, y: 1.32, z: -0.55, tx: 0.2, ty: 2.2, tz: -5.7 }, 2)
  .to(world.rotation, { y: 0.95, x: 0.24 }, 2)
  .to(cameraState, { x: 1.98, y: 1.8, z: 2.25, tx: 2.12, ty: 1.8, tz: -1.4 }, 3)
  .to(world.rotation, { y: 1.24, x: 0.19 }, 3)
  .to(cameraState, { x: -0.5, y: -0.6, z: -2.0, tx: -0.4, ty: -2.35, tz: -7.1 }, 4)
  .to(world.rotation, { y: 1.58, x: 0.08 }, 4)
  .to(cameraState, { x: 4.55, y: 2.7, z: -3.55, tx: 4.7, ty: 2.8, tz: -8.8 }, 5)
  .to(world.rotation, { y: 1.96, x: 0.15 }, 5)
  .to(cameraState, { x: 0, y: 0.4, z: 15.2, tx: 0, ty: 0, tz: -5.7 }, 6)
  .to(world.rotation, { y: 2.2, x: 0.03 }, 6);

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getPlanetScreenCoverage(object3D, radius) {
  const center = object3D.position.clone().project(camera);
  const edgeWorld = object3D.position.clone().add(new THREE.Vector3(radius, 0, 0));
  const edge = edgeWorld.project(camera);
  const radiusPx = Math.abs(edge.x - center.x) * window.innerWidth * 0.5;
  return (radiusPx * 2) / window.innerHeight;
}

function placeLabel(el, object3D, localOffset) {
  const worldPos = localOffset.clone().applyQuaternion(object3D.quaternion).add(object3D.position);
  const projected = worldPos.clone().project(camera);
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  const visible = projected.z < 1 && projected.z > -1;
  el.style.display = visible ? "block" : "none";
  if (!visible) return;

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.zIndex = `${((1 - projected.z) * 10000) | 0}`;
}

const labelAnchors = {
  core: { obj: corePlanet, offset: new THREE.Vector3(corePlanetRadius * 0.62, corePlanetRadius * 0.24, corePlanetRadius * 0.78), radius: corePlanetRadius },
  edit: { obj: editPlanet, offset: new THREE.Vector3(-editPlanetRadius * 0.58, editPlanetRadius * 0.2, editPlanetRadius * 0.72), radius: editPlanetRadius },
  systems: { obj: systemsPlanet, offset: new THREE.Vector3(systemsPlanetRadius * 0.62, -systemsPlanetRadius * 0.12, systemsPlanetRadius * 0.7), radius: systemsPlanetRadius },
  comms: { obj: commsMoon, offset: new THREE.Vector3(commsMoonRadius * 0.66, commsMoonRadius * 0.24, commsMoonRadius * 0.76), radius: commsMoonRadius },
  orbit: { obj: orbitPlanet, offset: new THREE.Vector3(orbitPlanetRadius * 0.68, -orbitPlanetRadius * 0.06, orbitPlanetRadius * 0.75), radius: orbitPlanetRadius },
  scout: { obj: scoutPlanet, offset: new THREE.Vector3(-scoutPlanetRadius * 0.64, scoutPlanetRadius * 0.16, scoutPlanetRadius * 0.72), radius: scoutPlanetRadius }
};

function animate() {
  requestAnimationFrame(animate);

  const ramp = 1 + scrollSpeedRamp;
  const baseSpin = 0.0018 * ramp;

  corePlanet.rotation.y += baseSpin;
  editPlanet.rotation.y -= baseSpin * 0.9;
  systemsPlanet.rotation.y += baseSpin * 1.12;
  commsMoon.rotation.y += baseSpin * 1.55;
  ring.rotation.z += 0.0022 * ramp;
  asteroidBelt.rotation.y += 0.0012 * ramp;
  stars.rotation.y += 0.00032 * (1 + progressValue * 1.2);

  const hoverX = pointer.x * 0.32;
  const hoverY = pointer.y * 0.23;
  camera.position.x += ((cameraState.x + hoverX) - camera.position.x) * 0.06;
  camera.position.y += ((cameraState.y - hoverY) - camera.position.y) * 0.06;
  camera.position.z += (cameraState.z - camera.position.z) * 0.06;

  const lookX = cameraState.tx + pointer.x * 0.5;
  const lookY = cameraState.ty - pointer.y * 0.32;
  camera.lookAt(lookX, lookY, cameraState.tz);

  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const coreCoverage = getPlanetScreenCoverage(corePlanet, corePlanetRadius);
  const editCoverage = getPlanetScreenCoverage(editPlanet, editPlanetRadius);
  const systemsCoverage = getPlanetScreenCoverage(systemsPlanet, systemsPlanetRadius);
  const commsCoverage = getPlanetScreenCoverage(commsMoon, commsMoonRadius);

  const orbitCoverage = getPlanetScreenCoverage(orbitPlanet, orbitPlanetRadius);
  const scoutCoverage = getPlanetScreenCoverage(scoutPlanet, scoutPlanetRadius);

  const rawCoverage = {
    core: coreCoverage,
    edit: editCoverage,
    systems: systemsCoverage,
    comms: commsCoverage,
    orbit: orbitCoverage,
    scout: scoutCoverage
  };

  const coverageAlpha = {};
  Object.entries(rawCoverage).forEach(([key, value]) => {
    const base = smoothstep(0.24, 0.58, value);
    coverageAlpha[key] = key === focusKey ? base : 0;
  });

  placeLabel(labelEls.core, labelAnchors.core.obj, labelAnchors.core.offset);
  placeLabel(labelEls.edit, labelAnchors.edit.obj, labelAnchors.edit.offset);
  placeLabel(labelEls.systems, labelAnchors.systems.obj, labelAnchors.systems.offset);
  placeLabel(labelEls.comms, labelAnchors.comms.obj, labelAnchors.comms.offset);
  placeLabel(labelEls.orbit, labelAnchors.orbit.obj, labelAnchors.orbit.offset);
  placeLabel(labelEls.scout, labelAnchors.scout.obj, labelAnchors.scout.offset);

  Object.entries(coverageAlpha).forEach(([key, alpha]) => {
    const el = labelEls[key];
    const eased = Math.max(0, Math.min(1, alpha));
    el.style.opacity = eased.toFixed(3);
    const scale = 0.72 + eased * 0.34;
    const px = pointer.x * 8;
    const py = pointer.y * 6;
    el.style.transform = `translate(calc(-50% + ${px.toFixed(2)}px), calc(-50% + ${py.toFixed(2)}px)) scale(${scale.toFixed(3)})`;
  });

  if (endPortal) {
    endPortal.classList.toggle("active", progressValue > 0.955);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});
