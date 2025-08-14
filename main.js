import { Input } from './scripts/input.js';
import { Map } from './scripts/map.js';
import { Snake } from './scripts/snake.js';

const app = document.getElementById('app');
const startBtn = document.createElement('button');
const stopBtn = document.createElement('button');
startBtn.innerText = 'Start';
stopBtn.innerText = 'Stop';
const canvas = document.createElement('canvas');

canvas.id = 'canvasX';
const ctx = canvas.getContext('2d');

export const COLS = 32
export const ROWS = 32
export const TILE_SIZE = 16;
export const GAME_WIDTH = COLS * TILE_SIZE;
export const GAME_HEIGHT = ROWS * TILE_SIZE;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
app.append(canvas, startBtn, stopBtn);

function drawGrid(ctx) {
    ctx.strokeStyle = 'white';
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

class Game {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080/ws');
        this.map = new Map(this);
        this.input = new Input(this);
        this.snake = new Snake(this);
        this.debug = false;
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'map') {
                this.map.data = msg.payload;
            }
            if (msg.type === 'grow') {
                this.snake.size += 1;
            }
        };
    }
    toggleDebug() {
        this.debug = !this.debug;
    }

    render(ctx, deltaTime) {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        if (this.debug) drawGrid(ctx);
        this.snake.update(deltaTime);
        this.map.draw(ctx);
    };
}

var aniID;
var lastTime = 0;
var paused = false;
var currentState = { game: null, loop: null }
function createGameLoop() {
    const game = new Game();
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
    };
    return {game: game, loop: gameLoop };
}

window.addEventListener('load', () => {
    currentState = createGameLoop();
    requestAnimationFrame(currentState.loop);
})

startBtn.addEventListener('click', () => {
    if (aniID) {
        cancelAnimationFrame(aniID);
    }
    if (currentState.game) {
        currentState.game.socket.close();
        currentState.socket = null;
        currentState.game = null;

    }
    currentState = createGameLoop();
    requestAnimationFrame(currentState.loop);
});
stopBtn.addEventListener('click', () => {
    if (paused) {
        paused = false;
        aniID = requestAnimationFrame(currentState.loop);
        return;
    }
    cancelAnimationFrame(aniID);
    paused = true;
})

