// Imports removed; using global THREE from CDN scripts

// ==========================================
// 1. LÓGICA DE TEMA (CLARO / OSCURO)
// ==========================================
// Hamburger menu toggle (removed, not needed)
// const menuToggle = document.getElementById('menu-toggle');
// const navLinks = document.querySelector('.nav-links');
// if (menuToggle && navLinks) {
//     menuToggle.addEventListener('click', () => {
//         navLinks.classList.toggle('open');
//         menuToggle.classList.toggle('active');
//     });
// }

const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Alternar íconos
    if (document.body.classList.contains('light-mode')) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
});

// ==========================================
// 2. CONFIGURACIÓN DE THREE.JS
// ==========================================
const container = document.getElementById('canvas-container');
const loadingOverlay = document.getElementById('loading-overlay');

if (!container || !loadingOverlay) {
    console.error('No se encontró el contenedor 3D o el overlay de carga. Revisa el HTML.');
}

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 3, 6);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización de rendimiento
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

// Controles de Órbita (Zoom, Rotación)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimiento suave
controls.dampingFactor = 0.05;
controls.minDistance = 2; // Límite de zoom in
controls.maxDistance = 15; // Límite de zoom out
controls.target.set(0, 0.5, 0);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// ==========================================
// 3. CARGA DEL MODELO GLB/GLTF
// ==========================================
const loader = new THREE.GLTFLoader();
const modelURL = './Assets/SetUpGamer.glb';

/* 
INSTRUCCIONES: 
Cuando tengas tu archivo .glb exportado de Blender, guárdalo en la misma carpeta 
y descomenta el siguiente bloque de código cambiando 'tu_modelo.glb' por el nombre real.
*/

// Load actual model
console.log('Cargando modelo 3D desde:', modelURL);
loader.load(
    modelURL,
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        // Adjust model to fit view
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, 0, 0);
        loadingOverlay.style.display = 'none';
        console.log('✓ Modelo cargado exitosamente');
    },
    (xhr) => {
        const percent = (xhr.loaded / xhr.total * 100);
        console.log(percent + '% loaded');
        loadingOverlay.innerText = `Cargando: ${Math.round(percent)}%`;
    },
    (error) => {
        console.error('Error loading 3D model:', error);
        loadingOverlay.innerHTML = `<p style="color: #ff4444;">❌ Error al cargar el modelo</p><p style="font-size: 0.9em; color: #888;">${error.message}</p>`;
        console.error('Detalles del error:', error);
    }
);



// ==========================================
// 4. ANIMACIÓN Y RESPONSIVIDAD
// ==========================================

// Loop de renderizado
function animate() {
    requestAnimationFrame(animate);
    
    // Actualizar controles (necesario para el damping)
    controls.update(); 
    
    renderer.render(scene, camera);
}
animate();

// Ajustar tamaño del canvas cuando la ventana cambie de tamaño
window.addEventListener('resize', () => {
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
