import { Input, UP, DOWN, LEFT, RIGHT } from './scripts/input.js';

const app = document.getElementById('app');
const startBtn = document.createElement('button');
const stopBtn = document.createElement('button');
startBtn.innerText = 'Start';
stopBtn.innerText = 'Stop';
const canvas = document.createElement('canvas');

canvas.id = 'canvasX';
const ctx = canvas.getContext('2d');
const COLS = 32
const ROWS = 32
const TILE_SIZE = 16;
const GAME_WIDTH = COLS * TILE_SIZE;
const GAME_HEIGHT = ROWS * TILE_SIZE;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
app.append(canvas, startBtn, stopBtn);

function borderCollision(x, y) {
    return (x >= 0 && x < COLS && y >= 0 && y < ROWS);
}

function drawGrid(ctx) {
    ctx.strokeStyle = 'white';
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

class Player {
    constructor(input) {
        this.input = input;
        this.pos = {
            x: 0,
            y: 0
        };
        this.destPos = {
            x: this.pos.x,
            y: this.pos.y
        };
        this.distToTavel = {
            x: 0,
            y: 0
        }
        this.speed = 0.1;
    }
    moveTowards(destPos, speed) {
        this.distToTavel.x = destPos.x - this.pos.x;
        this.distToTavel.y = destPos.y - this.pos.y;
        var dist = Math.hypot(this.distToTavel.x, this.distToTavel.y);
        if (dist <= speed) {
            this.pos.x = destPos.x;
            this.pos.y = destPos.y;
        } else {
            const stepX = this.distToTavel.x / dist;
            const stepY = this.distToTavel.y / dist;
            this.pos.x += stepX * speed;
            this.pos.y += stepY * speed;

            this.distToTavel.x = destPos.x - this.pos.x;
            this.distToTavel.y = destPos.y - this.pos.y;
            dist = Math.hypot(this.distToTavel.x, this.distToTavel.y);
        }
        return dist;
    }
    update(deltaTime) {
        let newX = this.destPos.x;
        let newY = this.destPos.y;

        const scaledSpeed = this.speed; // * deltaTime;
        const dist = this.moveTowards(this.destPos, scaledSpeed);
        const arrived = dist <= this.speed;
        if (arrived) {
            if (this.input.lastKey === UP) {
                newY--;
            } else if (this.input.lastKey === DOWN) {
                newY++;
            } else if (this.input.lastKey === LEFT) {
                newX--;
            } else if (this.input.lastKey === RIGHT) {
                newX++;
            }
            if (borderCollision(newX, newY)) {
                this.destPos.x = newX;
                this.destPos.y = newY;
            }
        }
    }
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.pos.x * TILE_SIZE, this.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}
var aniID;
var lastTime = 0;

function createGameLoop() {
    const input = new Input();
    const player = new Player(input);
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        drawGrid(ctx);
        player.update(deltaTime);
        player.draw(ctx);
    };
    return gameLoop;
}

window.addEventListener('load', () => {
    const gameLoop = createGameLoop();
    requestAnimationFrame(gameLoop);
})

startBtn.addEventListener('click', () => {
    const gameLoop = createGameLoop();
    requestAnimationFrame(gameLoop);
});
stopBtn.addEventListener('click', () => {
    cancelAnimationFrame(aniID);
})