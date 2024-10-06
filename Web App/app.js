// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sun - Larger than the rest of the planets
const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets data
const planetsData = [
    { name: "Mercury", color: 0xaaaaaa, size: 0.3, distance: 6 },
    { name: "Venus", color: 0xffcc00, size: 0.9, distance: 8 },
    { name: "Earth", color: 0x0000ff, size: 1, distance: 10 },
    { name: "Mars", color: 0xff0000, size: 0.7, distance: 12 },
    { name: "Jupiter", color: 0xff8800, size: 2, distance: 15 },
    { name: "Saturn", color: 0xffdd99, size: 1.8, distance: 18 },
    { name: "Uranus", color: 0x00ffff, size: 1.5, distance: 21 },
    { name: "Neptune", color: 0x0000ff, size: 1.4, distance: 24 },
    { name: "Pluto", color: 0x999999, size: 0.2, distance: 27 }
];

// Create planets
planetsData.forEach(planet => {
    const planetMaterial = new THREE.MeshBasicMaterial({ color: planet.color });
    const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(planet.size, 32, 32), planetMaterial);
    planetMesh.position.x = planet.distance;
    scene.add(planetMesh);
});

// Add asteroid belt (simply random small spheres between Mars and Jupiter)
const asteroidBelt = [];
for (let i = 0; i < 500; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(Math.random() * 0.1, 32, 32);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x777777 });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 16 + Math.random() * 4;
    asteroid.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    scene.add(asteroid);
    asteroidBelt.push(asteroid);
}

// Add stars in the background
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starVertices = [];

for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Fetch NASA Near-Earth Object (NEO) data from API
async function fetchNEOData() {
    const apiKey = 'DEMO_KEY';  // Use your NASA API Key
    try {
        const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-10-01&end_date=2024-10-07&api_key=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch NEO data:", error);
    }
}

// Display NEOs, Near-Earth Comets (NECs), and PHAs in the scene
async function displayNEOs() {
    const neoData = await fetchNEOData();
    if (!neoData) return;

    const neos = neoData.near_earth_objects;
    for (const date in neos) {
        neos[date].forEach(neo => {
            const isPHA = neo.is_potentially_hazardous_asteroid;
            const neoMaterial = new THREE.MeshBasicMaterial({ color: isPHA ? 0xff0000 : 0x00ff00 });
            const neoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), neoMaterial);

            neoMesh.position.set(
                Math.random() * 20 - 10,  // Random position for now
                Math.random() * 20 - 10,
                Math.random() * 20 - 10
            );
            scene.add(neoMesh);
        });
    }
}

displayNEOs();

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate planets around the sun
    planetsData.forEach((planet, i) => {
        const angle = Date.now() * 0.0001 * (i + 1);
        const x = Math.cos(angle) * planet.distance;
        const z = Math.sin(angle) * planet.distance;
        scene.children[i].position.set(x, 0, z);
    });

    controls.update(); // Update OrbitControls for interaction
    renderer.render(scene, camera);
}

camera.position.z = 50;
animate();
