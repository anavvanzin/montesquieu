import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Module-scope reusable scratch objects (zero per-frame GC allocations)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.4, 0);
const _vesselPos = new THREE.Vector3();
const _vesselTangent = new THREE.Vector3();
const _vesselLookTarget = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _rotMatrix = new THREE.Matrix4();
const _targetQuat = new THREE.Quaternion();
const _raycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2();

const ERA_PRESETS = {
  overview: {
    cam: [0, 4.35, 10.6],
    look: [0, 1.45, 0],
    voyage: 0.48,
    kicker: 'TRANSATLANTIC LEGAL MERIDIAN · FRANCE ⇄ BRAZIL',
    title: 'Montesquieu and the three powers',
    note: 'Drag to orbit · Political liberty, legal images, and institutional autonomy across France (1748) and Brazil (1824–1961).'
  },
  france1748: {
    cam: [-4.15, 2.85, 4.45],
    look: [-4.2, 1.75, 0],
    voyage: 0.08,
    kicker: 'SLIDES 01–03 · BORDEAUX & DE L’ESPRIT DES LOIS (1748)',
    title: 'Who was Montesquieu · Book XI, chapter 6',
    note: 'Magistrate in the Parlement of Bordeaux (1689–1755); political liberty as security under laws and limits preventing concentrated power.'
  },
  brazil1824: {
    cam: [0.35, 3.25, 6.2],
    look: [1.1, 1.85, 0],
    voyage: 0.52,
    kicker: 'SLIDE 04 · CONSTITUTION OF 1824, ART. 10 · DAUCHY § 6',
    title: 'Montesquieu in Brazil, 1824',
    note: 'Four powers: Legislative · Moderating · Executive · Judicial (Benjamin Constant’s imperial model, not a fourth branch invented by Montesquieu).'
  },
  oath1891: {
    cam: [2.1, 2.75, 5.25],
    look: [2.6, 1.55, 0.25],
    voyage: 0.7,
    kicker: 'SLIDE 05 · REPRESENTING DISTINCT AND RELATED INSTITUTIONS',
    title: 'Aurélio de Figueiredo · Compromisso Constitucional, 1896',
    note: 'Represents Deodoro da Fonseca’s constitutional oath of 26 February 1891 before Prudente de Moraes and the Constituent Congress.'
  },
  justica1961: {
    cam: [4.35, 2.75, 4.35],
    look: [4.2, 1.85, -0.15],
    voyage: 0.96,
    kicker: 'SLIDE 06 · CESCHIATTI’S JUSTICE: THE SWORD AND AUTONOMY',
    title: 'Alfredo Ceschiatti · A Justiça, 1961',
    note: 'Seated granite sculpture holding a resting sword before the Supremo Tribunal Federal in the Praça dos Três Poderes, Brasília.'
  },
  codigo1916: {
    cam: [3.2, 2.35, 4.65],
    look: [4.0, 1.15, 0.55],
    voyage: 0.84,
    kicker: 'SLIDE 07 · STAGE 3: QUESTIONS FOR SERGE DAUCHY',
    title: 'Context, Renegotiated Boundaries & Political Liberty',
    note: 'Connecting civil/criminal laws, judicial institutions, and institutional images to both closing questions for Serge Dauchy.'
  }
};

const ATMOSPHERE_THEMES = {
  parchment: {
    bg: 0x121620,
    fogDensity: 0.021,
    keyColor: 0xfff0d4,
    keyIntensity: 2.75,
    hemiSky: 0xdbeafe,
    hemiGround: 0x2c2219,
    hemiIntensity: 0.72,
    rimColor: 0x8fb1ff,
    rimIntensity: 1.2,
    exposure: 1.08
  },
  atlantic: {
    bg: 0x070d18,
    fogDensity: 0.025,
    keyColor: 0xdce8ff,
    keyIntensity: 2.2,
    hemiSky: 0x7aa2f7,
    hemiGround: 0x0f172a,
    hemiIntensity: 0.65,
    rimColor: 0xfbbf24,
    rimIntensity: 1.45,
    exposure: 1.02
  },
  brasilia: {
    bg: 0x19212e,
    fogDensity: 0.017,
    keyColor: 0xfffbeb,
    keyIntensity: 3.1,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x3b332b,
    hemiIntensity: 0.85,
    rimColor: 0x93c5fd,
    rimIntensity: 1.15,
    exposure: 1.15
  }
};

function createContactShadowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size * 0.48);
  grad.addColorStop(0, 'rgba(6, 8, 12, 0.62)');
  grad.addColorStop(0.55, 'rgba(6, 8, 12, 0.24)');
  grad.addColorStop(1, 'rgba(6, 8, 12, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createParchmentGlobeTexture(maxAnisotropy) {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Warm archival vellum base
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#dfd3bc');
  grad.addColorStop(0.5, '#efe6d5');
  grad.addColorStop(1, '#d8cab0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle graticule lines (meridians & parallels)
  ctx.strokeStyle = 'rgba(29, 60, 150, 0.24)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Equator & Tropic of Capricorn in crimson/gold ink
  ctx.strokeStyle = 'rgba(153, 27, 27, 0.48)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.stroke();

  // Calligraphic cartouche bands
  ctx.fillStyle = 'rgba(23, 25, 28, 0.65)';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('BORDEAUX · PARIS · 1748', w * 0.44, h * 0.34);
  ctx.fillText('RIO · BRASÍLIA · 1824–1962', w * 0.28, h * 0.66);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createStoneBumpTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random mineral grain for Petrópolis granite & limestone
  let seed = 18241916;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 2200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * 2.4;
    const v = Math.floor(95 + rand() * 75);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createFloorCompassTexture(maxAnisotropy) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#10151f';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Radial museum floor stone rings
  for (let r = 80; r <= 470; r += 65) {
    ctx.strokeStyle = r % 130 === 0 ? 'rgba(212, 175, 55, 0.34)' : 'rgba(143, 177, 255, 0.16)';
    ctx.lineWidth = r % 130 === 0 ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 32 compass azimuth rays
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const inner = i % 4 === 0 ? 70 : 180;
    const outer = 470;
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(212, 175, 55, 0.35)' : 'rgba(143, 177, 255, 0.12)';
    ctx.lineWidth = i % 4 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function initTransatlanticMeridian3D() {
  const overlay = document.getElementById('meridian-3d-overlay');
  const mount = document.getElementById('meridian-canvas-mount');
  if (!overlay || !mount) return;

  const openButtons = document.querySelectorAll('[data-open-meridian-3d]');
  const closeBtn = document.getElementById('meridian-3d-close');
  const dock = document.getElementById('meridian-bottom-dock');
  const dockToggleBtn = document.getElementById('meridian-dock-toggle');
  const presetButtons = overlay.querySelectorAll('[data-meridian-preset]');
  const voyageSlider = document.getElementById('meridian-voyage-slider');
  const explodeSlider = document.getElementById('meridian-explode-slider');
  const atmosphereButtons = overlay.querySelectorAll('[data-meridian-atmo]');

  const badgeKicker = document.getElementById('meridian-badge-kicker');
  const badgeTitle = document.getElementById('meridian-badge-title');
  const badgeNote = document.getElementById('meridian-badge-note');

  let isInitialized = false;
  let isRunning = false;
  let rafId = 0;

  // Scene state variables damped in the animation loop
  let targetVoyage = 0.48;
  let currentVoyage = 0.48;
  let targetExplode = 0.0;
  let currentExplode = 0.0;
  let activePresetKey = 'overview';

  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let isSoftwareGl = false;
  let gl = null;

  // References to animated composite groups & lights
  let keyLight = null;
  let hemiLight = null;
  let rimLight = null;
  let franceArmillaryRing1 = null;
  let franceArmillaryRing2 = null;
  let franceGlobe = null;
  let vesselGroup = null;
  let transatlanticCurve = null;
  let brazilSealsGroup = null;
  const explodableParts = [];
  const interactiveHitTargets = [];

  function registerExplodable(mesh, offsetVec) {
    mesh.userData.basePos = mesh.position.clone();
    mesh.userData.explodeOffset = offsetVec.clone();
    explodableParts.push(mesh);
  }

  function applyPreset(presetKey) {
    const preset = ERA_PRESETS[presetKey] || ERA_PRESETS.overview;
    activePresetKey = presetKey;
    _targetCamPos.set(preset.cam[0], preset.cam[1], preset.cam[2]);
    _targetLookAt.set(preset.look[0], preset.look[1], preset.look[2]);
    targetVoyage = preset.voyage;
    if (voyageSlider) {
      voyageSlider.value = String(Math.round(targetVoyage * 100));
    }
    if (badgeKicker) badgeKicker.textContent = preset.kicker;
    if (badgeTitle) badgeTitle.textContent = preset.title;
    if (badgeNote) badgeNote.textContent = preset.note;

    presetButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-meridian-preset') === presetKey;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
  }

  function applyAtmosphere(atmoKey) {
    const theme = ATMOSPHERE_THEMES[atmoKey] || ATMOSPHERE_THEMES.parchment;
    if (!scene || !renderer) return;
    scene.background.setHex(theme.bg);
    if (scene.fog) {
      scene.fog.color.setHex(theme.bg);
      scene.fog.density = theme.fogDensity;
    }
    if (keyLight) {
      keyLight.color.setHex(theme.keyColor);
      keyLight.intensity = theme.keyIntensity;
    }
    if (hemiLight) {
      hemiLight.color.setHex(theme.hemiSky);
      hemiLight.groundColor.setHex(theme.hemiGround);
      hemiLight.intensity = theme.hemiIntensity;
    }
    if (rimLight) {
      rimLight.color.setHex(theme.rimColor);
      rimLight.intensity = theme.rimIntensity;
    }
    renderer.toneMappingExposure = theme.exposure;

    atmosphereButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-meridian-atmo') === atmoKey;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
  }

  function buildScene() {
    if (isInitialized) return;
    isInitialized = true;

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Microsoft Basic Render/i.test(rendererStr);

    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(ATMOSPHERE_THEMES.parchment.bg);
    scene.fog = new THREE.FogExp2(ATMOSPHERE_THEMES.parchment.bg, ATMOSPHERE_THEMES.parchment.fogDensity);

    // Studio IBL via RoomEnvironment + PMREMGenerator (zero external HDRI 404s)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.78;
    pmremGenerator.dispose();

    camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 120);
    camera.position.set(0, 4.35, 10.6);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minDistance = 2.6;
    controls.maxDistance = 20.0;
    controls.target.set(0, 1.45, 0);

    // 3-Point Warm/Cool Studio Lighting
    keyLight = new THREE.DirectionalLight(0xfff0d4, 2.75);
    keyLight.position.set(6.5, 11.5, 7.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 28.0;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x2c2219, 0.72);
    scene.add(hemiLight);

    rimLight = new THREE.DirectionalLight(0x8fb1ff, 1.2);
    rimLight.position.set(-7.5, 6.0, -6.5);
    scene.add(rimLight);

    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const shadowTex = createContactShadowTexture();
    const globeTex = createParchmentGlobeTexture(maxAniso);
    const stoneBumpTex = createStoneBumpTexture();
    const floorTex = createFloorCompassTexture(maxAniso);

    // Shared PBR Materials with deliberate roughness/metalness contrast (>= 0.25 delta across adjacent parts)
    const limestoneMat = new THREE.MeshStandardMaterial({
      color: 0xdad0be,
      roughness: 0.78,
      metalness: 0.04,
      bumpMap: stoneBumpTex,
      bumpScale: 0.018
    });

    const graniteMat = new THREE.MeshStandardMaterial({
      color: 0xc4beb4,
      roughness: 0.82,
      metalness: 0.05,
      bumpMap: stoneBumpTex,
      bumpScale: 0.025
    });

    const modernistMarbleMat = new THREE.MeshStandardMaterial({
      color: 0xf3efe6,
      roughness: 0.34,
      metalness: 0.08
    });

    const polishedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.20,
      metalness: 0.90
    });

    const antiqueBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x8c6239,
      roughness: 0.46,
      metalness: 0.78
    });

    const moroccoLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x5c191b,
      roughness: 0.66,
      metalness: 0.06
    });

    const imperialBlueLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x1d3c96,
      roughness: 0.58,
      metalness: 0.12
    });

    const parchmentBlockMat = new THREE.MeshStandardMaterial({
      color: 0xf4ead5,
      roughness: 0.72,
      metalness: 0.02
    });

    const steelBladeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.14,
      metalness: 0.95
    });

    const timberHullMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.68,
      metalness: 0.06
    });

    const sailCanvasMat = new THREE.MeshStandardMaterial({
      color: 0xf6efe2,
      roughness: 0.84,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    // Ground Exhibition Rotunda Disc
    const floorGeo = new THREE.CylinderGeometry(11.5, 11.8, 0.16, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.62,
      metalness: 0.18
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.08;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const outerRimGeo = new THREE.TorusGeometry(11.55, 0.06, 16, 96);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, polishedBrassMat);
    outerRimMesh.rotation.x = Math.PI / 2;
    outerRimMesh.position.y = 0.02;
    scene.add(outerRimMesh);

    // =========================================================================
    // COMPOSITE MODEL 1: FRANCE 1748/1777 PEDESTAL & ARMILLARY SPHERE (9 PARTS)
    // Pivoted at bottom-center (y = 0) at x = -4.2
    // =========================================================================
    const franceGroup = new THREE.Group();
    franceGroup.position.set(-4.2, 0, 0);
    scene.add(franceGroup);

    // Soft radial contact shadow under France monument
    const frShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      })
    );
    frShadow.rotation.x = -Math.PI / 2;
    frShadow.position.y = 0.008;
    franceGroup.add(frShadow);

    // Part 1: Lathe-turned stepped Bordeaux limestone plinth
    const frPlinthPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.22, 0),
      new THREE.Vector2(1.22, 0.18),
      new THREE.Vector2(1.04, 0.24),
      new THREE.Vector2(0.92, 0.24),
      new THREE.Vector2(0.86, 0.88),
      new THREE.Vector2(1.02, 0.96),
      new THREE.Vector2(1.02, 1.08),
      new THREE.Vector2(0, 1.08)
    ];
    const frPlinthGeo = new THREE.LatheGeometry(frPlinthPoints, 36);
    const frPlinthMesh = new THREE.Mesh(frPlinthGeo, limestoneMat);
    frPlinthMesh.castShadow = true;
    frPlinthMesh.receiveShadow = true;
    frPlinthMesh.userData.preset = 'france1748';
    franceGroup.add(frPlinthMesh);
    interactiveHitTargets.push(frPlinthMesh);

    // Part 2: Engraved brass pedestal collar
    const frCollarMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.07, 36), polishedBrassMat);
    frCollarMesh.position.y = 1.08;
    frCollarMesh.castShadow = true;
    franceGroup.add(frCollarMesh);
    registerExplodable(frCollarMesh, new THREE.Vector3(0, 0.15, 0));

    // Part 3: Beveled leather-bound De l'esprit des lois (1748/1777) codex cover
    const folioShape = new THREE.Shape();
    folioShape.moveTo(-0.56, -0.38);
    folioShape.lineTo(0.56, -0.38);
    folioShape.lineTo(0.56, 0.38);
    folioShape.lineTo(-0.56, 0.38);
    folioShape.closePath();
    const folioGeo = new THREE.ExtrudeGeometry(folioShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    });
    folioGeo.center();
    const frCodexCover = new THREE.Mesh(folioGeo, moroccoLeatherMat);
    frCodexCover.rotation.x = Math.PI / 2;
    frCodexCover.rotation.z = -0.18;
    frCodexCover.position.set(0, 1.24, 0.12);
    frCodexCover.castShadow = true;
    frCodexCover.userData.preset = 'france1748';
    franceGroup.add(frCodexCover);
    interactiveHitTargets.push(frCodexCover);
    registerExplodable(frCodexCover, new THREE.Vector3(-0.25, 0.28, 0.35));

    // Part 4: Gilt-edged parchment text block inside the folio
    const frPagesMesh = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.13, 0.70), parchmentBlockMat);
    frPagesMesh.rotation.y = 0.18;
    frPagesMesh.position.set(0.02, 1.24, 0.12);
    franceGroup.add(frPagesMesh);
    registerExplodable(frPagesMesh, new THREE.Vector3(0.25, 0.34, 0.45));

    // Part 5: Raised brass spine ribs & clasp
    const frSpineClasp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.76, 16), polishedBrassMat);
    frSpineClasp.rotation.z = Math.PI / 2;
    frSpineClasp.rotation.y = 0.18;
    frSpineClasp.position.set(0, 1.34, 0.12);
    franceGroup.add(frSpineClasp);
    registerExplodable(frSpineClasp, new THREE.Vector3(0, 0.5, 0.35));

    // Part 6: Armillary Sphere Cradle & Base Stem
    const frStemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 0.48, 20), antiqueBronzeMat);
    frStemMesh.position.set(0, 1.54, -0.05);
    frStemMesh.castShadow = true;
    franceGroup.add(frStemMesh);

    // Part 7: Outer Brass Meridian Ring (I.3 · Lois & Mœurs)
    franceArmillaryRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.038, 20, 64), polishedBrassMat);
    franceArmillaryRing1.position.set(0, 2.38, -0.05);
    franceArmillaryRing1.castShadow = true;
    franceArmillaryRing1.userData.preset = 'france1748';
    franceGroup.add(franceArmillaryRing1);
    interactiveHitTargets.push(franceArmillaryRing1);
    registerExplodable(franceArmillaryRing1, new THREE.Vector3(-0.55, 0.75, 0));

    // Part 8: Tilted Ecliptic Band (VII.9 · Condition des femmes)
    franceArmillaryRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.03, 18, 64), antiqueBronzeMat);
    franceArmillaryRing2.position.set(0, 2.38, -0.05);
    franceArmillaryRing2.rotation.x = 0.42;
    franceArmillaryRing2.rotation.y = 0.55;
    franceGroup.add(franceArmillaryRing2);
    registerExplodable(franceArmillaryRing2, new THREE.Vector3(0.45, 0.85, -0.25));

    // Part 9: Central Cartographic Celestial Globe
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      roughness: 0.46,
      metalness: 0.12
    });
    franceGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.46, 36, 28), globeMat);
    franceGlobe.position.set(0, 2.38, -0.05);
    franceGlobe.castShadow = true;
    franceGlobe.userData.preset = 'france1748';
    franceGroup.add(franceGlobe);
    interactiveHitTargets.push(franceGlobe);
    registerExplodable(franceGlobe, new THREE.Vector3(0, 1.15, 0));

    // =========================================================================
    // COMPOSITE MODEL 2: TRANSATLANTIC MERIDIAN ARCH & 7-PART CARAVEL VESSEL
    // =========================================================================
    transatlanticCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, 1.35, 0),
      new THREE.Vector3(-1.65, 2.55, 0.35),
      new THREE.Vector3(0.0, 2.95, 0.45),
      new THREE.Vector3(1.65, 2.55, 0.35),
      new THREE.Vector3(3.3, 1.35, 0)
    ]);

    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    // Primary Brass Meridian Arch Tube
    const archTubeGeo = new THREE.TubeGeometry(transatlanticCurve, 72, 0.032, 14, false);
    const archTubeMesh = new THREE.Mesh(archTubeGeo, polishedBrassMat);
    archTubeMesh.castShadow = true;
    bridgeGroup.add(archTubeMesh);

    // Secondary Sapphire Counter-Arc
    const lowerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, 1.15, 0),
      new THREE.Vector3(0.0, 2.45, -0.35),
      new THREE.Vector3(3.3, 1.15, 0)
    ]);
    const lowerTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(lowerCurve, 56, 0.018, 10, false),
      imperialBlueLeatherMat
    );
    bridgeGroup.add(lowerTubeMesh);

    // 5 Historical Milestone Rings along the Meridian Arch (1748, 1824, 1891/96, 1916, 1961/62)
    const milestoneFractions = [0.08, 0.34, 0.52, 0.76, 0.94];
    const milestonePresets = ['france1748', 'brazil1824', 'brazil1824', 'codigo1916', 'justica1961'];
    milestoneFractions.forEach((t, idx) => {
      const pt = transatlanticCurve.getPointAt(t);
      const tang = transatlanticCurve.getTangentAt(t);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 14, 32), polishedBrassMat);
      ring.position.copy(pt);
      _vesselLookTarget.copy(pt).add(tang);
      ring.lookAt(_vesselLookTarget);
      ring.userData.preset = milestonePresets[idx];
      bridgeGroup.add(ring);
      interactiveHitTargets.push(ring);
    });

    // 7-Part Procedural Transatlantic Caravel / Astrolabe Carrier
    vesselGroup = new THREE.Group();
    scene.add(vesselGroup);

    // Vessel Part 1: Beveled Timber Hull (ExtrudeGeometry)
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.42, 0);
    hullShape.quadraticCurveTo(-0.28, -0.14, 0, -0.14);
    hullShape.quadraticCurveTo(0.32, -0.14, 0.48, 0.02);
    hullShape.lineTo(0.36, 0.14);
    hullShape.lineTo(-0.38, 0.16);
    hullShape.closePath();

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    });
    hullGeo.center();
    const hullMesh = new THREE.Mesh(hullGeo, timberHullMat);
    hullMesh.castShadow = true;
    hullMesh.userData.preset = 'brazil1824';
    vesselGroup.add(hullMesh);
    interactiveHitTargets.push(hullMesh);

    // Vessel Part 2: Copper-Sheathed Keel Fin
    const keelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.04), antiqueBronzeMat);
    keelMesh.position.set(0, -0.14, 0);
    vesselGroup.add(keelMesh);
    registerExplodable(keelMesh, new THREE.Vector3(0, -0.22, 0));

    // Vessel Part 3: Quarterdeck & Forecastle Cabin
    const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.11, 0.22), moroccoLeatherMat);
    deckMesh.position.set(-0.22, 0.14, 0);
    vesselGroup.add(deckMesh);
    registerExplodable(deckMesh, new THREE.Vector3(-0.18, 0.22, 0));

    // Vessel Part 4: Tapered Mainmast & Foremast
    const mainMast = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.72, 12), timberHullMat);
    mainMast.position.set(0.02, 0.38, 0);
    vesselGroup.add(mainMast);

    const foreMast = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.018, 0.52, 12), timberHullMat);
    foreMast.position.set(0.24, 0.28, 0);
    foreMast.rotation.z = -0.12;
    vesselGroup.add(foreMast);

    // Vessel Part 5: Billowing Curved Lateen & Square Sails
    const sailCurve = new THREE.Shape();
    sailCurve.moveTo(0, -0.22);
    sailCurve.quadraticCurveTo(0.14, 0, 0, 0.24);
    sailCurve.lineTo(-0.02, 0.24);
    sailCurve.quadraticCurveTo(0.11, 0, -0.02, -0.22);
    sailCurve.closePath();
    const mainSailGeo = new THREE.ExtrudeGeometry(sailCurve, {
      depth: 0.34,
      bevelEnabled: false
    });
    mainSailGeo.center();
    const mainSailMesh = new THREE.Mesh(mainSailGeo, sailCanvasMat);
    mainSailMesh.position.set(0.06, 0.42, 0);
    mainSailMesh.castShadow = true;
    vesselGroup.add(mainSailMesh);
    registerExplodable(mainSailMesh, new THREE.Vector3(0.15, 0.35, 0));

    // Vessel Part 6: Brass Gimbal Compass Ring encircling the Caravel
    const gimbalRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.018, 14, 48), polishedBrassMat);
    gimbalRing.rotation.x = Math.PI / 2;
    vesselGroup.add(gimbalRing);
    registerExplodable(gimbalRing, new THREE.Vector3(0, -0.32, 0));

    // Vessel Part 7: Brass Bowsprit Spire
    const bowsprit = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.28, 12), polishedBrassMat);
    bowsprit.rotation.z = -Math.PI / 2 + 0.28;
    bowsprit.position.set(0.52, 0.10, 0);
    vesselGroup.add(bowsprit);

    // =========================================================================
    // COMPOSITE MODEL 3: BRAZILIAN MONUMENT (1824 – 1962) (10 PARTS)
    // Pivoted at bottom-center (y = 0) at x = +4.2
    // =========================================================================
    const brazilGroup = new THREE.Group();
    brazilGroup.position.set(4.2, 0, 0);
    scene.add(brazilGroup);

    // Soft radial contact shadow under Brazil monument
    const brShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.8),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      })
    );
    brShadow.rotation.x = -Math.PI / 2;
    brShadow.position.y = 0.008;
    brazilGroup.add(brShadow);

    // Part 1: Stepped Petrópolis-Granite Plaza Plinth (LatheGeometry)
    const brPlinthPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.42, 0),
      new THREE.Vector2(1.42, 0.16),
      new THREE.Vector2(1.22, 0.22),
      new THREE.Vector2(1.16, 0.42),
      new THREE.Vector2(0.96, 0.48),
      new THREE.Vector2(0.96, 0.92),
      new THREE.Vector2(0, 0.92)
    ];
    const brPlinthMesh = new THREE.Mesh(new THREE.LatheGeometry(brPlinthPoints, 40), graniteMat);
    brPlinthMesh.castShadow = true;
    brPlinthMesh.receiveShadow = true;
    brPlinthMesh.userData.preset = 'justica1961';
    brazilGroup.add(brPlinthMesh);
    interactiveHitTargets.push(brPlinthMesh);

    // Part 2: Brass Constitutional Inscription Band (1824 · 1891 · 1916 · 1962)
    const brTrimRing = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.06, 40), polishedBrassMat);
    brTrimRing.position.y = 0.92;
    brazilGroup.add(brTrimRing);
    registerExplodable(brTrimRing, new THREE.Vector3(0, 0.15, 0));

    // Parts 3 & 4: Twin Sculpted Modernist STF Colonnade Arches (Brasília 1961)
    const columnShape = new THREE.Shape();
    columnShape.moveTo(-0.18, 0);
    columnShape.quadraticCurveTo(-0.04, 0.95, -0.32, 2.15);
    columnShape.lineTo(0.0, 2.25);
    columnShape.quadraticCurveTo(0.14, 1.05, 0.32, 0);
    columnShape.closePath();

    const columnGeo = new THREE.ExtrudeGeometry(columnShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    columnGeo.center();

    const stfArchLeft = new THREE.Mesh(columnGeo, modernistMarbleMat);
    stfArchLeft.position.set(-0.48, 2.02, -0.45);
    stfArchLeft.castShadow = true;
    stfArchLeft.userData.preset = 'justica1961';
    brazilGroup.add(stfArchLeft);
    interactiveHitTargets.push(stfArchLeft);
    registerExplodable(stfArchLeft, new THREE.Vector3(-0.55, 0.55, -0.45));

    const stfArchRight = new THREE.Mesh(columnGeo, modernistMarbleMat);
    stfArchRight.position.set(0.48, 2.02, -0.45);
    stfArchRight.rotation.y = Math.PI;
    stfArchRight.castShadow = true;
    stfArchRight.userData.preset = 'justica1961';
    brazilGroup.add(stfArchRight);
    interactiveHitTargets.push(stfArchRight);
    registerExplodable(stfArchRight, new THREE.Vector3(0.55, 0.55, -0.45));

    // Part 5: Sculpted Petrópolis-Stone Seated Figure of "A Justiça" (Ceschiatti, 1961) — Torso & Draped Robe
    const justicaTorsoPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.44, 0),
      new THREE.Vector2(0.40, 0.52),
      new THREE.Vector2(0.28, 0.92),
      new THREE.Vector2(0.32, 1.32),
      new THREE.Vector2(0.16, 1.52),
      new THREE.Vector2(0, 1.55)
    ];
    const justicaTorso = new THREE.Mesh(new THREE.LatheGeometry(justicaTorsoPoints, 28), graniteMat);
    justicaTorso.position.set(0, 0.95, -0.05);
    justicaTorso.scale.set(1.0, 1.0, 0.78);
    justicaTorso.castShadow = true;
    justicaTorso.userData.preset = 'justica1961';
    brazilGroup.add(justicaTorso);
    interactiveHitTargets.push(justicaTorso);
    registerExplodable(justicaTorso, new THREE.Vector3(0, 0.45, 0));

    // Part 6: Sculpted Contemplative Head of "A Justiça"
    const justicaHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 20), graniteMat);
    justicaHead.scale.set(0.88, 1.15, 0.95);
    justicaHead.position.set(0, 2.68, -0.04);
    justicaHead.castShadow = true;
    justicaHead.userData.preset = 'justica1961';
    brazilGroup.add(justicaHead);
    interactiveHitTargets.push(justicaHead);
    registerExplodable(justicaHead, new THREE.Vector3(0, 0.95, 0));

    // Part 7: The Ceremonial Sword Resting Horizontally Across Her Lap (Blade + Brass Crossguard & Pommel)
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0, 1.52, 0.32);
    brazilGroup.add(swordGroup);

    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.045, 0.09), steelBladeMat);
    swordBlade.castShadow = true;
    swordBlade.userData.preset = 'justica1961';
    swordGroup.add(swordBlade);
    interactiveHitTargets.push(swordBlade);

    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.12), polishedBrassMat);
    swordGuard.position.set(-0.42, 0, 0);
    swordGroup.add(swordGuard);

    const swordPommel = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), polishedBrassMat);
    swordPommel.position.set(-0.62, 0, 0);
    swordGroup.add(swordPommel);
    registerExplodable(swordGroup, new THREE.Vector3(0, 0.42, 0.65));

    // Part 8: Open 1824 Constitution & Legal Circulation Folio Lectern at Front of Plinth
    const brCodexMesh = new THREE.Mesh(folioGeo, imperialBlueLeatherMat);
    brCodexMesh.rotation.x = Math.PI / 2 - 0.35;
    brCodexMesh.position.set(0, 1.08, 0.62);
    brCodexMesh.scale.set(0.82, 0.82, 0.82);
    brCodexMesh.castShadow = true;
    brCodexMesh.userData.preset = 'codigo1916';
    brazilGroup.add(brCodexMesh);
    interactiveHitTargets.push(brCodexMesh);
    registerExplodable(brCodexMesh, new THREE.Vector3(0, 0.25, 0.55));

    // Parts 9 & 10: Four Orbiting Constitutional Seals (1824 Art. 10: Legislativo, Moderador, Executivo, Judicial)
    brazilSealsGroup = new THREE.Group();
    brazilSealsGroup.position.set(0, 1.95, 0);
    brazilGroup.add(brazilSealsGroup);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const sealHolder = new THREE.Group();
      sealHolder.position.set(Math.cos(angle) * 1.18, (i % 2 === 0 ? 0.12 : -0.12), Math.sin(angle) * 1.18);

      const discMat = i === 1 ? polishedBrassMat : antiqueBronzeMat;
      const sealDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 24), discMat);
      sealDisc.rotation.x = Math.PI / 2;
      sealDisc.userData.preset = 'brazil1824';
      sealHolder.add(sealDisc);
      interactiveHitTargets.push(sealDisc);

      const sealRim = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.016, 12, 24), polishedBrassMat);
      sealHolder.add(sealRim);

      brazilSealsGroup.add(sealHolder);
    }

    // =========================================================================
    // INSTANCED MESH (64 ARCHIVAL COMPASS BALUSTERS & STARLIGHT MARKERS)
    // Per-instance ±15% scale variation & color tint + computeBoundingSphere()
    // =========================================================================
    const instanceCount = 64;
    const balusterGeo = new THREE.CylinderGeometry(0.032, 0.048, 0.36, 12);
    const balusterMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.84
    });
    const instancedBalusters = new THREE.InstancedMesh(balusterGeo, balusterMat, instanceCount);
    instancedBalusters.castShadow = !isSoftwareGl;
    instancedBalusters.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const instColor = new THREE.Color();

    for (let i = 0; i < instanceCount; i++) {
      const t = i / instanceCount;
      const angle = t * Math.PI * 2;
      const isOuter = i < 40;
      const radius = isOuter ? 7.6 : 5.4;
      const scaleVar = 0.85 + ((i * 37) % 31) / 100; // deterministic ±15% scale variation

      dummy.position.set(
        Math.cos(angle) * radius,
        0.18 * scaleVar,
        Math.sin(angle) * (isOuter ? radius * 0.68 : radius * 0.52)
      );
      dummy.scale.set(scaleVar, scaleVar, scaleVar);
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      instancedBalusters.setMatrixAt(i, dummy.matrix);

      // Subtle warm brass vs royal blue archival tint variation
      if (i % 4 === 0) {
        instColor.setHex(0x8fb1ff);
      } else {
        instColor.setHSL(0.11 + ((i % 5) - 2) * 0.008, 0.68, 0.52 + ((i % 3) - 1) * 0.04);
      }
      instancedBalusters.setColorAt(i, instColor);
    }
    instancedBalusters.instanceMatrix.needsUpdate = true;
    if (instancedBalusters.instanceColor) instancedBalusters.instanceColor.needsUpdate = true;
    instancedBalusters.computeBoundingSphere();
    scene.add(instancedBalusters);

    // Raycaster pointer interaction on the 3D canvas
    renderer.domElement.addEventListener('pointerdown', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(interactiveHitTargets, false);
      if (hits.length > 0) {
        const hitPreset = hits[0].object.userData.preset;
        if (hitPreset && ERA_PRESETS[hitPreset]) {
          applyPreset(hitPreset);
        }
      }
    });

    applyPreset('overview');
  }

  // Software-WebGL frame pacing guard via gl.fenceSync
  function afterDraw(cb) {
    if (!isSoftwareGl || !gl || typeof gl.fenceSync !== 'function') {
      requestAnimationFrame(cb);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    function poll() {
      if (!isRunning) {
        gl.deleteSync(sync);
        return;
      }
      const status = gl.clientWaitSync(sync, 0, 0);
      if (status === gl.CONDITION_SATISFIED || status === gl.ALREADY_SIGNALED) {
        gl.deleteSync(sync);
        cb(performance.now());
      } else {
        setTimeout(poll, 4);
      }
    }
    setTimeout(poll, 4);
  }

  let lastTime = performance.now();

  function tick(now = performance.now()) {
    if (!isRunning) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const t = now * 0.001;

    // Smooth exponential damping for camera target & voyage progress
    currentVoyage = THREE.MathUtils.damp(currentVoyage, targetVoyage, 4.5, dt);
    currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 6.0, dt);

    // Gentle camera target transition when switching era presets
    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 4.0, dt);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 4.0, dt);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 4.0, dt);
    controls.target.copy(_currentLookAt);

    // Animate French Armillary Sphere rings & globe
    if (franceArmillaryRing1) {
      franceArmillaryRing1.rotation.y = t * 0.28;
    }
    if (franceArmillaryRing2) {
      franceArmillaryRing2.rotation.z = Math.sin(t * 0.55) * 0.25;
      franceArmillaryRing2.rotation.y = 0.55 + t * 0.36;
    }
    if (franceGlobe) {
      franceGlobe.rotation.y = t * 0.18;
    }

    // Update Transatlantic Caravel position & tangent orientation along the Meridian curve
    if (vesselGroup && transatlanticCurve) {
      const clampedT = Math.max(0.04, Math.min(0.96, currentVoyage));
      transatlanticCurve.getPointAt(clampedT, _vesselPos);
      transatlanticCurve.getTangentAt(clampedT, _vesselTangent);

      // Subtle ocean swell bobbing
      _vesselPos.y += Math.sin(t * 2.1) * 0.045;
      vesselGroup.position.copy(_vesselPos);

      _vesselLookTarget.copy(_vesselPos).add(_vesselTangent);
      _rotMatrix.lookAt(_vesselLookTarget, _vesselPos, _upAxis);
      _targetQuat.setFromRotationMatrix(_rotMatrix);
      vesselGroup.quaternion.slerp(_targetQuat, 0.15);
      // Align X-axis hull with tangent
      vesselGroup.rotateY(-Math.PI / 2);
      vesselGroup.rotation.z += Math.sin(t * 1.7) * 0.05;
    }

    // Orbit the 4 Brazilian Constitutional Seals (Legislativo, Moderador, Executivo, Judicial)
    if (brazilSealsGroup) {
      brazilSealsGroup.rotation.y = t * 0.32;
    }

    // Update Exploded-View Inspection offsets
    for (let i = 0; i < explodableParts.length; i++) {
      const part = explodableParts[i];
      const base = part.userData.basePos;
      const off = part.userData.explodeOffset;
      part.position.set(
        base.x + off.x * currentExplode,
        base.y + off.y * currentExplode,
        base.z + off.z * currentExplode
      );
    }

    controls.update();
    renderer.render(scene, camera);
    afterDraw(tick);
  }

  function handleResize() {
    if (!renderer || !camera || overlay.hidden) return;
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function openMeridian3D(initialPreset) {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    buildScene();
    handleResize();
    if (initialPreset && ERA_PRESETS[initialPreset]) {
      applyPreset(initialPreset);
      camera.position.set(_targetCamPos.x, _targetCamPos.y, _targetCamPos.z);
    }
    if (!isRunning) {
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  function closeMeridian3D() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    isRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function toggleDock() {
    if (!dock || !dockToggleBtn) return;
    const isCollapsed = dock.classList.toggle('is-collapsed');
    dockToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    dockToggleBtn.textContent = isCollapsed ? '▴ Show Controls (H)' : '▾ Hide Controls (H)';
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-open-meridian-3d') || 'overview';
      openMeridian3D(preset);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMeridian3D);
  }

  if (dockToggleBtn) {
    dockToggleBtn.addEventListener('click', toggleDock);
  }

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-meridian-preset');
      if (key && ERA_PRESETS[key]) {
        applyPreset(key);
        if (camera) {
          camera.position.set(_targetCamPos.x, _targetCamPos.y, _targetCamPos.z);
        }
      }
    });
  });

  atmosphereButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-meridian-atmo');
      if (key) applyAtmosphere(key);
    });
  });

  if (voyageSlider) {
    voyageSlider.addEventListener('input', () => {
      targetVoyage = Number(voyageSlider.value) / 100;
    });
  }

  if (explodeSlider) {
    explodeSlider.addEventListener('input', () => {
      targetExplode = Number(explodeSlider.value) / 100;
    });
  }

  window.addEventListener('resize', handleResize);

  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
      return;
    }
    if (!overlay.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMeridian3D();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        toggleDock();
      }
    } else if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openMeridian3D('overview');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransatlanticMeridian3D);
} else {
  initTransatlanticMeridian3D();
}
