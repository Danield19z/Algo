
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

// ELEMENTOS DE LA PÁGINA
const container = document.getElementById("game-container");
const scoreElement = document.getElementById("score");
const crystalsElement = document.getElementById("crystals");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const bestScoreElement = document.getElementById("best-score");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

// ESCENA 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08051c);
scene.fog = new THREE.Fog(0x08051c, 25, 100);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);
camera.position.set(0, 7, 11);
camera.lookAt(0, 0, -8);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ILUMINACIÓN
scene.add(new THREE.HemisphereLight(0x9b7bff, 0x10051f, 2));

const mainLight = new THREE.PointLight(0x00eaff, 35, 60);
mainLight.position.set(0, 12, -8);
scene.add(mainLight);

const purpleLight = new THREE.PointLight(0xb000ff, 25, 50);
purpleLight.position.set(-8, 5, -15);
scene.add(purpleLight);

// MATERIALES
const neonBlue = new THREE.MeshStandardMaterial({
    color: 0x00d9ff,
    emissive: 0x0077aa,
    emissiveIntensity: 2
});

const neonPink = new THREE.MeshStandardMaterial({
    color: 0xff168f,
    emissive: 0x990044,
    emissiveIntensity: 2
});

const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x17102f,
    metalness: 0.6,
    roughness: 0.35
});

// SUELO
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 150),
    new THREE.MeshStandardMaterial({
        color: 0x100a28,
        metalness: 0.4,
        roughness: 0.7
    })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -0.15, -40);
scene.add(floor);

// PISTAS
const laneLines = [];

for (let z = 5; z > -100; z -= 10) {
    const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.025, 5),
        neonBlue
    );
    line.position.set(0, -0.08, z);
    scene.add(line);
    laneLines.push(line);
}

for (const x of [-3, 0, 3]) {
    const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.05, 150),
        neonPink
    );
    rail.position.set(x, 0, -40);
    scene.add(rail);
}

// DECORACIÓN LATERAL
const decorations = [];

for (let i = 0; i < 36; i++) {
    for (const side of [-1, 1]) {
        const height = 1 + Math.random() * 5;
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, height, 1.5),
            new THREE.MeshStandardMaterial({
                color: side === -1 ? 0x35105c : 0x102d58,
                emissive: side === -1 ? 0x6b00aa : 0x0066aa,
                emissiveIntensity: 0.7
            })
        );

        building.position.set(
            side * (7 + Math.random() * 9),
            height / 2 - 0.1,
            -i * 4 - Math.random() * 4
        );

        scene.add(building);
        decorations.push(building);
    }
}

// NAVE
const ship = new THREE.Group();
scene.add(ship);

const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 2.2, 5),
    new THREE.MeshStandardMaterial({
        color: 0x00eaff,
        emissive: 0x0088bb,
        emissiveIntensity: 1.5,
        metalness: 0.6,
        roughness: 0.2
    })
);
body.rotation.x = Math.PI / 2;
body.position.y = 0.7;
ship.add(body);

const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 12),
    new THREE.MeshStandardMaterial({
        color: 0xff44cc,
        emissive: 0xaa0066,
        emissiveIntensity: 2
    })
);
cockpit.scale.set(0.7, 0.6, 1.3);
cockpit.position.set(0, 0.85, -0.1);
ship.add(cockpit);

for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.12, 1.1),
        neonPink
    );
    wing.position.set(side * 0.75, 0.35, 0.3);
    wing.rotation.z = side * -0.15;
    ship.add(wing);
}

const engine = new THREE.PointLight(0x00eaff, 8, 8);
engine.position.set(0, 0.5, 1.2);
ship.add(engine);

ship.position.set(0, 0, 3);

// ESTRELLAS
const starPositions = [];

for (let i = 0; i < 500; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 100,
        Math.random() * 35 + 2,
        -Math.random() * 130
    );
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color: 0x9ddfff,
        size: 0.16
    })
);
scene.add(stars);

// ESTADO DEL JUEGO
let running = false;
let score = 0;
let crystals = 0;
let speed = 0.35;
let lane = 0;
let targetX = 0;
let spawnTimer = 0;
let crystalTimer = 0;
let lastTime = 0;
let elapsed = 0;

let obstacles = [];
let crystalObjects = [];
let particles = [];

let bestScore = Number(localStorage.getItem("neonRushBest") || 0);

// CREAR OBSTÁCULO
function createObstacle() {
    const laneNumber = Math.floor(Math.random() * 3) - 1;

    const obstacle = new THREE.Group();

    const block = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.2),
        new THREE.MeshStandardMaterial({
            color: 0xff176b,
            emissive: 0xaa0033,
            emissiveIntensity: 1.8,
            metalness: 0.3
        })
    );

    block.position.y = 0.8;
    obstacle.add(block);

    const glow = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 1.65, 1.3),
        new THREE.MeshBasicMaterial({
            color: 0xff168f,
            wireframe: true
        })
    );

    glow.position.y = 0.8;
    obstacle.add(glow);

    obstacle.position.set(laneNumber * 3, 0, -65);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// CREAR CRISTAL
function createCrystal() {
    const laneNumber = Math.floor(Math.random() * 3) - 1;

    const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00bbff,
            emissiveIntensity: 2.5,
            metalness: 0.5,
            roughness: 0.15
        })
    );

    crystal.position.set(laneNumber * 3, 1, -65);
    scene.add(crystal);
    crystalObjects.push(crystal);
}

// EFECTO DE PARTÍCULAS
function createExplosion(position, color = 0x00eaff) {
    for (let i = 0; i < 16; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshBasicMaterial({ color })
        );

        particle.position.copy(position);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.25,
            Math.random() * 0.25,
            (Math.random() - 0.5) * 0.25
        );

        particle.userData.life = 1;
        scene.add(particle);
        particles.push(particle);
    }
}

// CAMBIAR DE CARRIL
function moveLeft() {
    if (!running) return;
    lane = Math.max(-1, lane - 1);
    targetX = lane * 3;
}

function moveRight() {
    if (!running) return;
    lane = Math.min(1, lane + 1);
    targetX = lane * 3;
}

window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        moveLeft();
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        moveRight();
    }
});

leftButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    moveLeft();
});

rightButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    moveRight();
});

// COLISIÓN
function checkCollision(object) {
    return (
        Math.abs(ship.position.x - object.position.x) < 1.25 &&
        Math.abs(ship.position.z - object.position.z) < 1.35
    );
}

// EMPEZAR
function startGame() {
    score = 0;
    crystals = 0;
    speed = 0.35;
    lane = 0;
    targetX = 0;
    spawnTimer = 0;
    crystalTimer = 0;
    elapsed = 0;

    for (const item of [...obstacles, ...crystalObjects, ...particles]) {
        scene.remove(item);
    }

    obstacles = [];
    crystalObjects = [];
    particles = [];

    ship.position.set(0, 0, 3);
    ship.rotation.set(0, 0, 0);

    scoreElement.textContent = "0";
    crystalsElement.textContent = "0";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    running = true;
}

// TERMINAR
function endGame() {
    running = false;

    createExplosion(ship.position, 0xff168f);

    finalScoreElement.textContent = score;
    bestScore = Math.max(bestScore, score);

    localStorage.setItem("neonRushBest", bestScore);
    bestScoreElement.textContent = bestScore;

    setTimeout(() => {
        gameOverScreen.classList.remove("hidden");
    }, 450);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// ACTUALIZACIÓN DEL JUEGO
function update(delta) {
    if (!running) return;

    elapsed += delta;
    speed = Math.min(0.9, 0.35 + elapsed * 0.008);

    score += Math.floor(delta * 10);
    scoreElement.textContent = score;

    ship.position.x += (targetX - ship.position.x) * Math.min(1, delta * 12);
    ship.rotation.z = (targetX - ship.position.x) * -0.12;
    ship.position.y = Math.sin(elapsed * 6) * 0.08;

    // Generar obstáculos
    spawnTimer += delta;

    if (spawnTimer > Math.max(0.65, 1.5 - elapsed * 0.005)) {
        createObstacle();
        spawnTimer = 0;
    }

    // Generar cristales
    crystalTimer += delta;

    if (crystalTimer > 1.15) {
        if (Math.random() > 0.25) createCrystal();
        crystalTimer = 0;
    }

    // Mover obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.position.z += speed * delta * 30;
        obstacle.rotation.y += delta;

        if (checkCollision(obstacle)) {
            endGame();
            return;
        }

        if (obstacle.position.z > 12) {
            scene.remove(obstacle);
            obstacles.splice(i, 1);
        }
    }

    // Mover cristales
    for (let i = crystalObjects.length - 1; i >= 0; i--) {
        const crystal = crystalObjects[i];

        crystal.position.z += speed * delta * 30;
        crystal.rotation.y += delta * 2;
        crystal.rotation.x += delta;

        if (checkCollision(crystal)) {
            crystals++;
            crystalsElement.textContent = crystals;
            score += 50;
            createExplosion(crystal.position, 0x00ffff);

            scene.remove(crystal);
            crystalObjects.splice(i, 1);
            continue;
        }

        if (crystal.position.z > 12) {
            scene.remove(crystal);
            crystalObjects.splice(i, 1);
        }
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.position.addScaledVector(particle.userData.velocity, delta * 20);
        particle.userData.life -= delta * 1.5;

        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
            particles.splice(i, 1);
        }
    }

    // Líneas de la pista
    for (const line of laneLines) {
        line.position.z += speed * delta * 30;

        if (line.position.z > 8) {
            line.position.z -= 100;
        }
    }

    // Edificios
    for (const building of decorations) {
        building.position.z += speed * delta * 30;

        if (building.position.z > 12) {
            building.position.z -= 144;
        }
    }

    stars.rotation.y += delta * 0.005;
}

// BUCLE PRINCIPAL
function animate(time) {
    requestAnimationFrame(animate);

    const delta = lastTime
        ? Math.min((time - lastTime) / 1000, 0.05)
        : 0;

    lastTime = time;

    update(delta);

    renderer.render(scene, camera);
}

animate(0);

// ADAPTAR A LA PANTALLA
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
