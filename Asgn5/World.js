import * as THREE from 'three';                                          // Three.js library
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';           // Load OBJ models
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';           // Load material files for OBJ models
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  // Controls to navigate scene
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';           // GUI library

// Renderer setup — use the existing canvas instead of creating a new one
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setSize(800, 600);

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 0, 0.1);

// Panorama sphere setup
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);

const texture = new THREE.TextureLoader().load('world.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
const material = new THREE.MeshBasicMaterial({ map: texture });

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Point light — warm glow near the tackle box area
const pointLight = new THREE.PointLight(0xFFAA55, 1.5, 10);
pointLight.position.set(0, 1, -1);
scene.add(pointLight);

// Camera controls to look around the sphere
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.rotateSpeed = -0.3;

// Fish animation
const fish = [];
const bodyGeom = new THREE.SphereGeometry(0.06, 16, 16);
bodyGeom.scale(1.8, 1, 1); // Stretch into an oval fish body

const tailGeom = new THREE.ConeGeometry(0.1, 0.15, 4); // Diamond-shaped tail
const finGeom = new THREE.BoxGeometry(0.08, 0.08, 0.01); // Small top fin

const fishTypes = [
  { color: 0xFFFF00, scaleX: 1.8, scaleY: 1.0, size: 1.0 },
  { color: 0xFF4500, scaleX: 2.2, scaleY: 0.8, size: 1.3 },
  { color: 0x1E90FF, scaleX: 1.4, scaleY: 1.3, size: 0.8 },
  { color: 0xFF69B4, scaleX: 1.6, scaleY: 1.1, size: 1.1 },
  { color: 0x7CFC00, scaleX: 2.5, scaleY: 0.7, size: 1.5 },
  { color: 0xFF8C00, scaleX: 1.5, scaleY: 1.5, size: 0.7 },
  { color: 0xAA44FF, scaleX: 2.0, scaleY: 0.9, size: 1.2 },
];

for (let i = 0; i < fishTypes.length; i++) {
  const type = fishTypes[i];
  const fGroup = new THREE.Group();
  const fishTex = new THREE.TextureLoader().load('fish.jpg');
  const fishMat = new THREE.MeshPhongMaterial({ map: fishTex });

  // Body
  const bGeom = new THREE.SphereGeometry(0.06 * type.size, 16, 16);
  bGeom.scale(type.scaleX, type.scaleY, 1);
  const body = new THREE.Mesh(bGeom, fishMat);
  fGroup.add(body);

  // Tail
  const tGeom = new THREE.ConeGeometry(0.1 * type.size, 0.15 * type.size, 4);
  const tail = new THREE.Mesh(tGeom, fishMat);
  tail.position.x = -0.25 * type.size * (type.scaleX / 1.8);
  tail.rotation.z = Math.PI / 2;
  fGroup.add(tail);

  // Fin
  const fGeom = new THREE.BoxGeometry(0.08 * type.size, 0.08 * type.size, 0.01);
  const fin = new THREE.Mesh(fGeom, fishMat);
  fin.position.set(0, 0.12 * type.size * type.scaleY, 0);
  fGroup.add(fin);

  scene.add(fGroup);

  fish.push({
    group: fGroup,
    tail: tail,
    offset: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.4,
    radius: 2 + i * 0.8,
    height: -0.2 + Math.random() * 0.3
  });
}

// Resize handler to maintain aspect ratio and renderer size
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(400, 400);
});

// Tackle box
const tackleBox = new THREE.Group();

// Bottom half
const bottomMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
const bottomGeom = new THREE.BoxGeometry(0.4, 0.2, 0.25);
const bottom = new THREE.Mesh(bottomGeom, bottomMat);
bottom.position.y = -0.1; // Shift down so it sits in the lower half
tackleBox.add(bottom);

// Top half
const topMat = new THREE.MeshPhongMaterial({ color: 0x2E8B57 });
const topGeom = new THREE.BoxGeometry(0.4, 0.2, 0.25);
const top = new THREE.Mesh(topGeom, topMat);
top.position.y = 0.1; // Shift up so it sits in the upper half
tackleBox.add(top);

// Handle
const handleMat = new THREE.MeshPhongMaterial({ color: 0x2E8B57 });
const handleGeom = new THREE.BoxGeometry(0.15, 0.05, 0.04);
const handle = new THREE.Mesh(handleGeom, handleMat);
handle.position.y = 0.225; // Sit right on top of the box
tackleBox.add(handle);

// Position the tackle box in the scene
tackleBox.position.set(0, -1, -0.5);
scene.add(tackleBox);

// Fishing rod
const rodGroup = new THREE.Group();

// Rod
const rodMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
const rodGeom = new THREE.CylinderGeometry(0.012, 0.02, 1.2, 8);
const rod = new THREE.Mesh(rodGeom, rodMat);
rodGroup.add(rod);

// String
const stringMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
const stringGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.6, 6);
const string = new THREE.Mesh(stringGeom, stringMat);
string.position.y = 0.9;   // Hang below the tip of the rod
rodGroup.add(string);

// Tilt and position
rodGroup.rotation.z = Math.PI / 4;   // 45 degree lean
rodGroup.position.set(-0.4, 0.2, -0.1);
scene.add(rodGroup);

// Worms
const wormMat = new THREE.MeshPhongMaterial({ color: 0xFF69B4 });

for (let i = 0; i < 6; i++) {
  const wormGroup = new THREE.Group();

  // Each worm is made of 4 small spheres chained together
  for (let s = 0; s < 4; s++) {
    const segGeom = new THREE.SphereGeometry(0.018, 8, 8);
    const seg = new THREE.Mesh(segGeom, wormMat);
    seg.position.y = s * 0.03;
    wormGroup.add(seg);
  }

  // Scatter worms randomly close to the camera
  wormGroup.position.set(
    -0.3 + Math.random() * 0.6,
    -0.3 + Math.random() * 0.2,
    -0.3 - Math.random() * 0.3
  );

  // Give each worm a random slight tilt
  wormGroup.rotation.z = (Math.random() - 0.5) * 0.8;
  wormGroup.rotation.x = (Math.random() - 0.5) * 0.4;

  scene.add(wormGroup);
}

// Animate the fish swimming in circles around the camera
function animate(time) {
  requestAnimationFrame(animate);
  time *= 0.001;

  fish.forEach((f) => {
    const t = time * f.speed + f.offset;
    f.group.position.x = Math.sin(t) * f.radius;
    f.group.position.z = Math.cos(t) * f.radius;
    f.group.position.y = f.height + Math.sin(t * 1.5) * 0.3;
    f.group.rotation.y = t + Math.PI / 2;
    f.tail.rotation.y = Math.sin(time * 10 + f.offset) * 0.4;
  });

  // Swing the string back and forth
  string.rotation.z = Math.sin(time * 2) * 0.3;

  controls.update();
  renderer.render(scene, camera);
}
animate();