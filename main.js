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

const OPPOSITES = {
    [UP]: DOWN,
    [DOWN]: UP,
    [LEFT]: RIGHT,
    [RIGHT]: LEFT
}

function validMove(key, lastKey) {
    return (key !== OPPOSITES[lastKey]);
}
function createMap() {
    const size = COLS * ROWS;
    const emptyMap = new Array(size).fill(0);
    return emptyMap;
}

function insideMap(x, y) {
    return (x >= 0 && x < COLS && y >= 0 && y < ROWS);
}

function validInput(key) {
    return (key === UP || key === DOWN || key === LEFT || key === RIGHT);
} 

function drawGrid(ctx) {
    ctx.strokeStyle = 'white';
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

class Map {
    constructor(game) {
        this.game = game;
        this.map = createMap();
    }
    set(x, y, value) {
        this.map[y * COLS + x] = value;
    }
    get(x, y) {
        return this.map[y * COLS + x];
    }
    draw(ctx) {
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                if (this.get(c, r) === 1) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}

class Snake {
    constructor(game) {
        this.game = game;
        this.input = this.game.input;
        this.head = {
            x: 0,
            y: 0
        };
        this.destPos = {
            x: this.head.x,
            y: this.head.y
        }
        this.distToTravel = {
            x: this.destPos.x,
            y: this.destPos.y
        }
        this.body = [this.head];
        this.speed = 15;
        this.lastMove = RIGHT;
    }
    moveTowards(destPos, speed) {
        this.distToTravel.x = destPos.x - this.head.x;
        this.distToTravel.y = destPos.y - this.head.y;
        var dist = Math.hypot(this.distToTravel.x, this.distToTravel.y);
        if (dist <= speed) {
            this.head.x = destPos.x;
            this.head.y = destPos.y;
        } else {
            const stepX = this.distToTravel.x / dist;
            const stepY = this.distToTravel.y / dist;
            this.head.x += stepX * speed;
            this.head.y += stepY * speed;

            this.distToTravel.x = destPos.x - this.head.x;
            this.distToTravel.y = destPos.y - this.head.y;
            dist = Math.hypot(this.distToTravel.x, this.distToTravel.y);
        }
        return dist;
    }
    update(deltaTime) {
        let newX = this.destPos.x;
        let newY = this.destPos.y;
        const scaledSpeed = this.speed * (deltaTime / 1000);
        const dist = this.moveTowards(this.destPos, scaledSpeed);
        if (dist <= scaledSpeed) {
            // Listen for directions
            if (this.input.lastKey === UP) {
                newY--;
            }
            if (this.input.lastKey === DOWN) {
                newY++;
            }
            if (this.input.lastKey === LEFT) {
                newX--;
            }
            if (this.input.lastKey === RIGHT) {
                newX++;
            }
            // Move
            if (validInput(this.input.lastKey) && insideMap(newX, newY) && validMove(this.input.lastKey, this.lastMove)) {
                this.destPos.x = newX;
                this.destPos.y = newY;
                this.body.unshift({ x: newX, y: newY });
                this.game.map.set(newX, newY, 1);
                this.lastMove = this.input.lastKey;
                if (this.body.length > 4) {
                    const tail = this.body.pop();
                    this.game.map.set(tail.x, tail.y, 0);
                }
            }
        }
    }
}

class Game {
    constructor() {
        this.map = new Map(this);
        this.input = new Input();
        this.player = new Snake(this);
    }
}

var aniID;
var lastTime = 0;
function createGameLoop() {
    const game = new Game();
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        drawGrid(ctx);
        game.player.update(deltaTime);
        game.map.draw(ctx);
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