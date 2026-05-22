/* ═══════════════════════════════════════════════════════════════
   scene3d.js — Three.js ES module for loading SetUp.glb
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(() => {
  'use strict';

  const container = document.getElementById('canvas-3d');
  const loaderOverlay = document.getElementById('canvas-3d-loader');
  const loaderText = document.getElementById('loader-text');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const sceneControls = document.getElementById('scene-controls');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetCamBtn = document.getElementById('reset-camera');
  if (!container) return;

  // ── Renderer ──────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ── Scene ─────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const isDark = () => document.body.classList.contains('dark');

  const updateBg = () => {
    const col = isDark() ? 0x1c1c36 : 0xf0f2f5;
    scene.background = new THREE.Color(col);
  };
  updateBg();

  // ── Camera ────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
  camera.position.set(4, 3, 6);

  // Store initial camera state for reset
  const initialCamera = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3()
  };

  // ── Controls ──────────────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.minDistance = 1;
  controls.maxDistance = 50;
  controls.target.set(0, 1, 0);
  // Auto rotation
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  
  // Better touch behavior
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };
  controls.update();

  // Handle interaction to pause/resume auto-rotation
  let autoRotateTimeout = null;

  const pauseAutoRotate = () => {
    controls.autoRotate = false;
    clearTimeout(autoRotateTimeout);
  };

  const resumeAutoRotate = () => {
    clearTimeout(autoRotateTimeout);
    autoRotateTimeout = setTimeout(() => {
      controls.autoRotate = true;
    }, 2000); // 2 seconds of inactivity
  };

  controls.addEventListener('start', pauseAutoRotate);
  controls.addEventListener('end', resumeAutoRotate);

  // ── Lighting ──────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.5);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(8, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8ecae6, 0.6);
  fillLight.position.set(-6, 6, -4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffd166, 0.4);
  rimLight.position.set(0, 4, -8);
  scene.add(rimLight);

  // ── Ground plane (soft shadow catcher) ────────────────────────
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Sizing helper ─────────────────────────────────────────────
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 600;
    if (w === 0) return; // Section hidden (display: none)
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  // ResizeObserver catches display:none → display:block transitions
  const ro = new ResizeObserver(() => resize());
  ro.observe(container);

  // ── Animation loop ────────────────────────────────────────────
  const clock = new THREE.Clock();
  let model = null;

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // ── Zoom helper ───────────────────────────────────────────────
  const zoomBy = (factor) => {
    const direction = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    const distance = camera.position.distanceTo(controls.target);
    const newDistance = THREE.MathUtils.clamp(
      distance * factor,
      controls.minDistance,
      controls.maxDistance
    );
    camera.position.copy(
      controls.target.clone().add(direction.multiplyScalar(newDistance))
    );
    controls.update();
  };

  // ── Button event listeners ────────────────────────────────────
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => zoomBy(0.75));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => zoomBy(1.35));
  }
  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => {
      camera.position.copy(initialCamera.position);
      controls.target.copy(initialCamera.target);
      controls.update();
    });
  }

  // ── Load model ────────────────────────────────────────────────
  const loader = new GLTFLoader();

  loader.load(
    'assets/SetUp.glb',
    (gltf) => {
      model = gltf.scene;

      // Enable shadows on all meshes
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Auto-fit camera to model bounding box
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Center the model
      model.position.sub(center);
      model.position.y += size.y / 2;

      scene.add(model);

      // Adjust camera distance
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = (maxDim / 2) / Math.tan(fov / 2);
      cameraZ *= 1.6; // Add some padding

      camera.position.set(cameraZ * 0.7, cameraZ * 0.5, cameraZ * 0.7);
      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, size.y / 2, 0);
      controls.minDistance = maxDim * 0.3;
      controls.maxDistance = maxDim * 5;
      controls.update();

      // Save initial camera state for reset button
      initialCamera.position.copy(camera.position);
      initialCamera.target.copy(controls.target);

      // Adjust shadow camera to model size
      const shadowPadding = maxDim * 1.5;
      keyLight.shadow.camera.left = -shadowPadding;
      keyLight.shadow.camera.right = shadowPadding;
      keyLight.shadow.camera.top = shadowPadding;
      keyLight.shadow.camera.bottom = -shadowPadding;
      keyLight.shadow.camera.far = maxDim * 5;
      keyLight.shadow.camera.updateProjectionMatrix();

      // Adjust ground plane
      ground.position.y = -0.01;

      // Hide loader & show controls
      if (loaderOverlay) {
        loaderOverlay.classList.add('loaded');
        setTimeout(() => loaderOverlay.remove(), 600);
      }
      if (sceneControls) {
        sceneControls.classList.add('visible');
      }

      console.log('✓ Modelo SetUp.glb cargado exitosamente');
      console.log(`  Dimensiones: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
    },
    (progress) => {
      if (progress.total > 0) {
        const pct = Math.round((progress.loaded / progress.total) * 100);
        if (loaderText) loaderText.textContent = `Cargando modelo… ${pct}%`;
        if (loaderBarFill) loaderBarFill.style.width = `${pct}%`;
      }
    },
    (error) => {
      console.error('✗ Error cargando SetUp.glb:', error);
      if (loaderText) {
        loaderText.textContent = 'Error cargando el modelo 3D';
        loaderText.style.color = '#ef4444';
      }
    }
  );

  // ── Theme change observer ─────────────────────────────────────
  const themeObserver = new MutationObserver(updateBg);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

})();
