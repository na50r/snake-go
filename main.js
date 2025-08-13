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

function createMap() {
    const size = COLS * ROWS;
    const emptyMap = new Array(size).fill(0);
    return emptyMap;
}

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
        this.dest = {
            x:this.head.x,
            y:this.head.y
        }
        this.distToTravel = {
            x:this.dest.x,
            y:this.dest.y
        }
        this.body = [this.head];
    }
    update() {
        let newX = this.head.x;
        let newY = this.head.y;
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
        if ((this.input.lastKey === UP || this.input.lastKey === DOWN || this.input.lastKey === LEFT || this.input.lastKey === RIGHT) && borderCollision(newX, newY)) {
            this.head.x = newX;
            this.head.y = newY;
            this.body.unshift({ x: newX, y: newY });
            this.game.map.set(newX, newY, 1);
            if (this.body.length > 4) {
                const tail = this.body.pop();
                this.game.map.set(tail.x, tail.y, 0);
            }
        }
    }
}
var aniID;
class Game {
    constructor() {
        this.map = new Map(this);
        this.input = new Input();
        this.player = new Snake(this);
    }
}

function createGameLoop() {
    const game = new Game();
    const gameLoop = () => {
        aniID = requestAnimationFrame(gameLoop);
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        drawGrid(ctx);
        game.player.update();
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