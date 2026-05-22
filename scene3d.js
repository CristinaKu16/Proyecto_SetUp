// scene3d.js – ES-module 3D viewer for SetUp Gamer model
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ── DOM references ──────────────────────────────────────
const container     = document.getElementById('canvas-3d');
const loaderOverlay = document.getElementById('loader-overlay');
const loaderText    = document.getElementById('loader-text');
const loaderBarFill = document.getElementById('loader-bar-fill');
const sceneControls = document.getElementById('scene-controls');
const btnZoomIn     = document.getElementById('zoom-in');
const btnZoomOut    = document.getElementById('zoom-out');
const btnReset      = document.getElementById('reset-camera');

if (!container) { console.error('Missing #canvas-3d container'); }

// ── Renderer ────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace  = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// ── Scene ───────────────────────────────────────────────
const scene = new THREE.Scene();
function applySceneBg() {
    const dark = document.body.classList.contains('dark')
              || !document.body.classList.contains('light-mode');
    scene.background = new THREE.Color(dark ? 0x0a0a0f : 0xfdf2f8);
}
applySceneBg();

// Watch for theme changes
const themeObserver = new MutationObserver(applySceneBg);
themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// ── Camera ──────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
    45, container.clientWidth / container.clientHeight, 0.1, 500
);
camera.position.set(0, 3, 6);

// We'll store the initial camera state after model loads
let initialCameraPos    = camera.position.clone();
let initialControlTarget = new THREE.Vector3();

// ── Lighting ────────────────────────────────────────────
// Ambient fill
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// Hemisphere – sky / ground
const hemi = new THREE.HemisphereLight(0xb0d0ff, 0x443322, 0.5);
scene.add(hemi);

// Key light (with shadows)
const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.6);
keyLight.position.set(5, 10, 7);
keyLight.castShadow           = true;
keyLight.shadow.mapSize.width  = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near    = 0.5;
keyLight.shadow.camera.far     = 50;
keyLight.shadow.camera.left    = -10;
keyLight.shadow.camera.right   = 10;
keyLight.shadow.camera.top     = 10;
keyLight.shadow.camera.bottom  = -10;
keyLight.shadow.bias           = -0.0005;
scene.add(keyLight);

// Fill light (softer, opposite side)
const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.6);
fillLight.position.set(-5, 4, -3);
scene.add(fillLight);

// Rim / back light
const rimLight = new THREE.DirectionalLight(0xffc0e0, 0.5);
rimLight.position.set(0, 6, -8);
scene.add(rimLight);

// ── Controls ────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.08;
controls.minDistance     = 1;
controls.maxDistance     = 30;
controls.autoRotate     = true;
controls.autoRotateSpeed = 1.5;
controls.target.set(0, 0.5, 0);

// Pause auto-rotate on interaction, resume after 2 s
let autoRotateTimer = null;
function pauseAutoRotate() {
    controls.autoRotate = false;
    clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => { controls.autoRotate = true; }, 2000);
}
controls.domElement.addEventListener('pointerdown', pauseAutoRotate);
controls.domElement.addEventListener('wheel', pauseAutoRotate);

// ── Load model ──────────────────────────────────────────
const loader = new GLTFLoader();
const MODEL_PATH = './Assets/SetUpGamer.glb';

loader.load(
    MODEL_PATH,
    (gltf) => {
        const model = gltf.scene;

        // Enable shadows on every mesh
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow    = true;
                child.receiveShadow = true;
            }
        });

        scene.add(model);

        // ── Auto-fit camera to bounding box ──
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov    = camera.fov * (Math.PI / 180);
        let   dist   = (maxDim / 2) / Math.tan(fov / 2);
        dist *= 1.4; // add some padding

        camera.position.set(center.x + dist * 0.5, center.y + dist * 0.35, center.z + dist);
        controls.target.copy(center);
        camera.near = dist / 100;
        camera.far  = dist * 10;
        camera.updateProjectionMatrix();
        controls.update();

        // Save initial state for reset button
        initialCameraPos    = camera.position.clone();
        initialControlTarget = controls.target.clone();

        // Hide loader, show controls
        loaderOverlay.style.opacity = '0';
        setTimeout(() => { loaderOverlay.style.display = 'none'; }, 400);
        sceneControls.classList.add('visible');

        console.log('✓ Modelo 3D cargado correctamente');
    },
    (xhr) => {
        if (xhr.total) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            loaderText.textContent        = `${pct}%`;
            loaderBarFill.style.width      = `${pct}%`;
        }
    },
    (err) => {
        console.error('Error cargando modelo:', err);
        loaderText.textContent = '❌ Error al cargar';
        loaderBarFill.style.background = '#ff4444';
    }
);

// ── Zoom & Reset buttons ────────────────────────────────
const ZOOM_IN_FACTOR  = 0.75;
const ZOOM_OUT_FACTOR = 1.35;

function zoomCamera(factor) {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    dir.multiplyScalar(factor);
    camera.position.copy(controls.target).add(dir);
    controls.update();
    pauseAutoRotate();
}

btnZoomIn?.addEventListener('click',  () => zoomCamera(ZOOM_IN_FACTOR));
btnZoomOut?.addEventListener('click', () => zoomCamera(ZOOM_OUT_FACTOR));

btnReset?.addEventListener('click', () => {
    camera.position.copy(initialCameraPos);
    controls.target.copy(initialControlTarget);
    controls.update();
    controls.autoRotate = true;
});

// ── Resize handling ─────────────────────────────────────
const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});
ro.observe(container);

// ── Render loop ─────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
