
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const total = canvas.width / box;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameLoop;
let running = false;

let record = Number(localStorage.getItem("snakeRecord")) || 0;
document.getElementById("record").textContent = record;

function startGame() {
    clearInterval(gameLoop);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    running = true;

    document.getElementById("score").textContent = score;
    document.getElementById("message").textContent = "¡A jugar!";

    createFood();
    drawGame();

    gameLoop = setInterval(updateGame, 120);
}

function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * total),
            y: Math.floor(Math.random() * total)
        };
    } while (snake.some(part => part.x === food.x && part.y === food.y));
}

document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    const newDirection = keys[event.key];

    if (!newDirection) return;

    event.preventDefault();

    if (
        (newDirection === "UP" && direction !== "DOWN") ||
        (newDirection === "DOWN" && direction !== "UP") ||
        (newDirection === "LEFT" && direction !== "RIGHT") ||
        (newDirection === "RIGHT" && direction !== "LEFT")
    ) {
        nextDirection = newDirection;
    }
});

function updateGame() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;

    const eating = head.x === food.x && head.y === food.y;

    const collisionBody = eating ? snake : snake.slice(0, -1);

    if (
        head.x < 0 ||
        head.x >= total ||
        head.y < 0 ||
        head.y >= total ||
        collisionBody.some(part => part.x === head.x && part.y === head.y)
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eating) {
        score++;
        document.getElementById("score").textContent = score;

        if (score > record) {
            record = score;
            localStorage.setItem("snakeRecord", record);
            document.getElementById("record").textContent = record;
        }

        createFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(food.x * box, food.y * box, box - 2, box - 2);

    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#a855f7" : "#7e22ce";
        ctx.fillRect(
            part.x * box,
            part.y * box,
            box - 2,
            box - 2
        );
    });
}

function endGame() {
    clearInterval(gameLoop);
    running = false;
    document.getElementById("message").textContent =
        "¡Fin de la partida! Pulsa Jugar para intentarlo de nuevo.";
}
