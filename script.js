import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. LÓGICA DE TEMA (CLARO / OSCURO)
// ==========================================
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

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 3, 6);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización de rendimiento
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Controles de Órbita (Zoom, Rotación)
const controls = new OrbitControls(camera, renderer.domElement);
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
const loader = new GLTFLoader();

/* 
INSTRUCCIONES: 
Cuando tengas tu archivo .glb exportado de Blender, guárdalo en la misma carpeta 
y descomenta el siguiente bloque de código cambiando 'tu_modelo.glb' por el nombre real.
*/

/*
loader.load(
    './tu_modelo.glb', // RUTA DE TU ARCHIVO
    (gltf) => {
        const model = gltf.scene;
        // Ajustar posición o escala si es necesario
        // model.scale.set(1, 1, 1);
        // model.position.set(0, 0, 0);
        
        scene.add(model);
        loadingOverlay.style.display = 'none'; // Quitar texto de carga
    },
    (xhr) => {
        // Muestra el progreso en la consola
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    },
    (error) => {
        console.error('Error al cargar el modelo 3D:', error);
        loadingOverlay.innerText = 'Error al cargar modelo.';
    }
);
*/

// --> PLACEHOLDER TEMPORAL (Borra esto cuando cargues tu modelo real)
// Crea un setup de escritorio básico usando formas primitivas de Three.js
function createPlaceholder() {
    const group = new THREE.Group();

    // Escritorio
    const deskGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.8 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = 0.05;
    group.add(desk);

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.7, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111115 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 0.6, -0.2);
    group.add(monitor);
    
    // Pantalla (Luz emisiva para darle el toque hacker/ingeniero)
    const screenGeo = new THREE.PlaneGeometry(1.1, 0.6);
    const screenMat = new THREE.MeshStandardMaterial({ 
        color: 0x2cb67d, 
        emissive: 0x2cb67d, 
        emissiveIntensity: 0.2 
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.6, -0.17);
    group.add(screen);

    // Soporte
    const standGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.4);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x555566 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(0, 0.3, -0.3);
    group.add(stand);

    scene.add(group);
    
    // Ocultar overlay porque ya cargamos el placeholder
    if(loadingOverlay) loadingOverlay.style.display = 'none';
}
createPlaceholder(); // <- Elimina esta línea cuando uses el loader.load de arriba


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
