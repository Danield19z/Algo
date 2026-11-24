
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

// ======================================
// ANIME LEGENDS - EL DESPERTAR
// ======================================

const container = document.getElementById("game-container");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const hud = document.getElementById("game-hud");
const controls = document.getElementById("controls");
const loading = document.getElementById("loading");

// ======================================
// ESCENA Y CÁMARA
// ======================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c9ee);
scene.fog = new THREE.Fog(0x91c9ee, 35, 115);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    250
);

camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

container.appendChild(renderer.domElement);

// ======================================
// ILUMINACIÓN
// ======================================

scene.add(new THREE.HemisphereLight(0xd8edff, 0x526b45, 2.1));

const sunlight = new THREE.DirectionalLight(0xfff0d4, 3);
sunlight.position.set(-15, 25, 15);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -35;
sunlight.shadow.camera.right = 35;
sunlight.shadow.camera.top = 35;
sunlight.shadow.camera.bottom = -35;
scene.add(sunlight);

// ======================================
// MATERIALES
// ======================================

function material(color, extra = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        ...extra
    });
}

const skin = material(0xffd0a6);
const hair = material(0x24213d);
const hairLight = material(0x514a7c);
const eyes = material(0x28c9ff, {
    emissive: 0x0877aa,
    emissiveIntensity: 0.5
});
const white = material(0xffffff);
const clothes = material(0x263a75);
const clothesLight = material(0x4775d8);
const gold = material(0xffca63, {
    metalness: 0.4
});
const boots = material(0x292b42);

// ======================================
// CREAR OBJETOS
// ======================================

function createMesh(geometry, mat, parent, x, y, z) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

// ======================================
// TERRENO
// ======================================

const ground = createMesh(
    new THREE.PlaneGeometry(250, 250),
    material(0x527e49),
    scene,
    0, -0.15, 0
);

ground.rotation.x = -Math.PI / 2;

// Camino
const path = createMesh(
    new THREE.PlaneGeometry(7, 250),
    material(0xb9a17b),
    scene,
    0, -0.12, 0
);

path.rotation.x = -Math.PI / 2;

// Pequeñas piedras del camino
for (let i = 0; i < 100; i++) {
    const stone = createMesh(
        new THREE.DodecahedronGeometry(
            0.08 + Math.random() * 0.2
        ),
        material(0x8c806c),
        scene,
        (Math.random() - 0.5) * 5,
        0,
        -Math.random() * 120 + 50
    );

    stone.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );
}

// ======================================
// ÁRBOLES
// ======================================

const trees = [];

function createTree(x, z, scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    createMesh(
        new THREE.CylinderGeometry(0.25, 0.4, 3, 7),
        material(0x765039),
        tree,
        0, 1.5, 0
    );

    const leaves = [
        { y: 3.2, r: 1.5 },
        { y: 4.1, r: 1.2 },
        { y: 5, r: 0.85 }
    ];

    for (const part of leaves) {
        createMesh(
            new THREE.ConeGeometry(part.r, 2.3, 7),
            material(0x287b4a),
            tree,
            0, part.y, 0
        );
    }

    scene.add(tree);
    trees.push(tree);
}

for (let i = 0; i < 100; i++) {
    const z = -Math.random() * 140 + 35;

    for (const side of [-1, 1]) {
        createTree(
            side * (6 + Math.random() * 15),
            z,
            0.7 + Math.random() * 0.8
        );
    }
}

// ======================================
// MONTAÑAS
// ======================================

for (let i = 0; i < 14; i++) {
    const mountain = createMesh(
        new THREE.ConeGeometry(
            7 + Math.random() * 7,
            12 + Math.random() * 13,
            7
        ),
        material(i % 2 ? 0x748ca5 : 0x617c9b),
        scene,
        (Math.random() - 0.5) * 100,
        5,
        -45 - Math.random() * 90
    );

    mountain.rotation.y = Math.random() * Math.PI;
}

// ======================================
// FLORES
// ======================================

for (let i = 0; i < 150; i++) {
    const flower = new THREE.Group();

    const colors = [0xffa6d5, 0xffe27a, 0xffffff, 0xbca1ff];

    createMesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        material(colors[i % colors.length]),
        flower,
        0, 0.45, 0
    );

    createMesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5),
        material(0x35834a),
        flower,
        0, 0.2, 0
    );

    flower.position.set(
        (Math.random() - 0.5) * 20,
        0,
        -Math.random() * 100 + 30
    );

    scene.add(flower);
}

// ======================================
// PERSONAJE ANIME
// ======================================

const hero = new THREE.Group();
scene.add(hero);

const body = new THREE.Group();
hero.add(body);

// Cuerpo
createMesh(
    new THREE.CapsuleGeometry(0.48, 0.8, 5, 10),
    clothes,
    body,
    0, 1.45, 0
);

// Chaleco frontal
createMesh(
    new THREE.BoxGeometry(0.55, 0.8, 0.12),
    clothesLight,
    body,
    0, 1.5, -0.42
);

// Cinturón
createMesh(
    new THREE.BoxGeometry(0.9, 0.13, 0.65),
    gold,
    body,
    0, 1.05, 0
);

// Cabeza
const head = new THREE.Group();
body.add(head);
head.position.set(0, 2.55, 0);

createMesh(
    new THREE.SphereGeometry(0.57, 24, 20),
    skin,
    head,
    0, 0, 0
);

// Pelo
createMesh(
    new THREE.SphereGeometry(0.59, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hair,
    head,
    0, 0.16, -0.04
);

// Flequillo anime
for (let i = 0; i < 5; i++) {
    const spike = createMesh(
        new THREE.ConeGeometry(0.2, 0.65, 5),
        i % 2 ? hair : hairLight,
        head,
        -0.38 + i * 0.19,
        0.23,
        0.43
    );

    spike.rotation.x = -0.35;
    spike.rotation.z = (i - 2) * 0.2;
}

// Ojos
for (const side of [-1, 1]) {
    createMesh(
        new THREE.SphereGeometry(0.105, 12, 12),
        eyes,
        head,
        side * 0.22, -0.02, 0.49
    );

    createMesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        white,
        head,
        side * 0.22 - 0.02, 0.02, 0.57
    );
}

// Boca
createMesh(
    new THREE.BoxGeometry(0.12, 0.025, 0.025),
    material(0x9d4f54),
    head,
    0, -0.24, 0.55
);

// Pañuelo
const scarf = createMesh(
    new THREE.BoxGeometry(1.05, 0.2, 0.7),
    material(0xe54b70),
    body,
    0, 2.1, 0
);

// Cola del pañuelo
const scarfTail = createMesh(
    new THREE.BoxGeometry(0.2, 0.85, 0.15),
    material(0xe54b70),
    body,
    -0.4, 2, 0.1
);
scarfTail.rotation.z = -0.4;

// Brazos animables
const arms = [];

for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.55, 1.95, 0);
    body.add(pivot);

    createMesh(
        new THREE.CapsuleGeometry(0.16, 0.65, 4, 8),
        clothesLight,
        pivot,
        0, -0.42, 0
    );

    createMesh(
        new THREE.SphereGeometry(0.17, 12, 12),
        skin,
        pivot,
        0, -0.9, 0
    );

    arms.push(pivot);
}

// Piernas animables
const legs = [];

for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.23, 0.95, 0);
    body.add(pivot);

    createMesh(
        new THREE.CapsuleGeometry(0.19, 0.55, 4, 8),
        clothes,
        pivot,
        0, -0.38, 0
    );

    createMesh(
        new THREE.BoxGeometry(0.4, 0.23, 0.55),
        boots,
        pivot,
        0, -0.8, 0.05
    );

    legs.push(pivot);
}

// Aura del personaje
const aura = createMesh(
    new THREE.CircleGeometry(0.8, 32),
    new THREE.MeshBasicMaterial({
        color: 0x79dfff,
        transparent: true,
        opacity: 0.17
    }),
    hero,
    0, 0.02, 0
);

aura.rotation.x = -Math.PI / 2;

// Posición inicial
hero.position.set(0, 0, 4);

// ======================================
// CONTROLES
// ======================================

const keys = {};

let started = false;
let jumping = false;
let velocityY = 0;
let walkTime = 0;
let cameraAngle = 0;

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;

    if (
        event.code === "Space" &&
        started &&
        !jumping
    ) {
        jumping = true;
        velocityY = 8;
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

const movementButtons = {
    forward: "w",
    backward: "s",
    left: "a",
    right: "d"
};

for (const [id, key] of Object.entries(movementButtons)) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        keys[key] = true;
        button.setPointerCapture(event.pointerId);
    });

    const release = () => {
        keys[key] = false;
    };

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
}

document.getElementById("jump-button").addEventListener(
    "pointerdown",
    (event) => {
        event.preventDefault();

        if (started && !jumping) {
            jumping = true;
            velocityY = 8;
        }
    }
);

// Girar cámara con el ratón
let dragging = false;
let lastMouseX = 0;

renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && started) {
        dragging = true;
        lastMouseX = event.clientX;
    }
});

window.addEventListener("pointerup", () => {
    dragging = false;
});

window.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const difference = event.clientX - lastMouseX;
    cameraAngle -= difference * 0.005;
    lastMouseX = event.clientX;
});

// ======================================
// EMPEZAR PARTIDA
// ======================================

startButton.addEventListener("click", () => {
    started = true;
    startScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    controls.classList.remove("hidden");
});

// ======================================
// MOVIMIENTO Y ANIMACIÓN
// ======================================

const clock = new THREE.Clock();

function update(delta) {
    const forward =
        keys["w"] || keys["arrowup"] ? 1 : 0;

    const backward =
        keys["s"] || keys["arrowdown"] ? 1 : 0;

    const left =
        keys["a"] || keys["arrowleft"] ? 1 : 0;

    const right =
        keys["d"] || keys["arrowright"] ? 1 : 0;

    let moveX = right - left;
    let moveZ = backward - forward;

    const moving = moveX !== 0 || moveZ !== 0;

    if (moving && started) {
        const length = Math.hypot(moveX, moveZ);
        moveX /= length;
        moveZ /= length;

        const angle = cameraAngle;

        const rotatedX =
            moveX * Math.cos(angle) +
            moveZ * Math.sin(angle);

        const rotatedZ =
            -moveX * Math.sin(angle) +
            moveZ * Math.cos(angle);

        hero.position.x += rotatedX * 7 * delta;
        hero.position.z += rotatedZ * 7 * delta;

        hero.position.x = THREE.MathUtils.clamp(
            hero.position.x, -22, 22
        );

        hero.position.z = THREE.MathUtils.clamp(
            hero.position.z, -110, 35
        );

        const direction = Math.atan2(rotatedX, rotatedZ);
        hero.rotation.y = THREE.MathUtils.lerp(
            hero.rotation.y,
            direction,
            Math.min(1, delta * 10)
        );

        walkTime += delta * 11;

        legs[0].rotation.x = Math.sin(walkTime) * 0.65;
        legs[1].rotation.x = -Math.sin(walkTime) * 0.65;

        arms[0].rotation.x = -Math.sin(walkTime) * 0.55;
        arms[1].rotation.x = Math.sin(walkTime) * 0.55;
    } else {
        legs.forEach(leg => {
            leg.rotation.x = THREE.MathUtils.lerp(
                leg.rotation.x, 0, delta * 8
            );
        });

        arms.forEach(arm => {
            arm.rotation.x = THREE.MathUtils.lerp(
                arm.rotation.x, 0, delta * 8
            );
        });
    }

    // Salto y gravedad
    if (jumping) {
        hero.position.y += velocityY * delta;
        velocityY -= 20 * delta;

        if (hero.position.y <= 0) {
            hero.position.y = 0;
            velocityY = 0;
            jumping = false;
        }
    }

    // Movimiento suave del cuerpo
    body.position.y = moving
        ? Math.abs(Math.sin(walkTime)) * 0.08
        : Math.sin(clock.elapsedTime * 2) * 0.025;

    scarfTail.rotation.x = Math.sin(clock.elapsedTime * 5) * 0.18;

    // Cámara detrás del héroe
    const distance = 9;
    const desiredCamera = new THREE.Vector3(
        hero.position.x + Math.sin(cameraAngle) * distance,
        hero.position.y + 5,
        hero.position.z + Math.cos(cameraAngle) * distance
    );

    camera.position.lerp(
        desiredCamera,
        Math.min(1, delta * 4)
    );

    const target = new THREE.Vector3(
        hero.position.x,
        hero.position.y + 1.8,
        hero.position.z - 2
    );

    camera.lookAt(target);

    // Pequeño movimiento de las copas
    for (let i = 0; i < trees.length; i++) {
        trees[i].rotation.z =
            Math.sin(clock.elapsedTime + i) * 0.012;
    }
}

// ======================================
// BUCLE PRINCIPAL
// ======================================

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (started) {
        update(delta);
    } else {
        hero.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.12;
        camera.lookAt(0, 1.5, 0);
    }

    renderer.render(scene, camera);
}

animate();

// ======================================
// CAMBIAR TAMAÑO DE PANTALLA
// ======================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
});

loading.classList.add("hidden");
