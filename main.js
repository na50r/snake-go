import { Input } from './scripts/input.js';
import { Map } from './scripts/map.js';
import { Snake } from './scripts/snake.js';
import { Joystick } from './scripts/joystick.js';
import { Food } from './scripts/food.js';
import { InputDisplay } from './scripts/inputDisplay.js';

const app = document.getElementById('app');
const startBtn = document.getElementById('respawn');
const stopBtn = document.getElementById('pause');
const waitMsg = document.createElement('div');
waitMsg.innerText = 'Waiting for server...';
waitMsg.classList.add('waitMsg');
app.appendChild(waitMsg);

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

const socket = new WebSocket('ws://localhost:8080/ws');
socket.addEventListener('open', () => {
    waitMsg.remove();
    app.appendChild(canvas);
});

socket.addEventListener('close', () => {
    canvas.remove();
    app.style.border = 'none';
    const buttons = ['up', 'down', 'left', 'right'].map(cls => app.querySelector(`.joystick.${cls}`));
    buttons.forEach(btn => {
        if (btn) btn.remove();
    });

    currentState.game.inputDisplay.getKeys().forEach(el => el.remove());
    app.appendChild(waitMsg);
});

function drawGrid(ctx) {
    ctx.strokeStyle = 'white';
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

class Game {
    constructor(socket) {
        this.over = false;
        this.socket = socket;
        this.map = new Map(this);
        this.input = new Input(this);
        this.snake = new Snake(this);
        this.joystick = new Joystick(this);
        this.food = new Food(this);
        this.inputDisplay = new InputDisplay(this);
        this.debug = false;
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'map') {
                this.map.data = msg.payload;
            }
            if (msg.type === 'grow') {
                this.snake.size += 1;
                this.food.eaten += 1;
            }
            if (msg.type === "death") {
                this.over = true;
            }
        };
    }
    toggleDebug() {
        this.debug = !this.debug;
    }

    render(ctx, deltaTime) {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.inputDisplay.update();
        this.food.draw(ctx);
        this.snake.update(deltaTime);
        this.map.draw(ctx);
        if (this.debug) drawGrid(ctx);
    };
}

function killGame(game) {
    game.socket.close();
    game.socket = null;
    game = null;
}

var aniID;
var lastTime = 0;
var paused = false;
var currentState = { game: null, loop: null }

function setupJoystick(game) {
    const buttons = ['up', 'down', 'left', 'right'].map(cls => document.querySelector(`.joystick.${cls}`));

    buttons.forEach(btn => {
        if (btn) btn.remove();
    });
    game.joystick.getKeys().forEach(el => app.append(el));
    game.inputDisplay.getKeys().forEach(el => app.append(el));
}

function createGameLoop() {
    const game = new Game(socket);
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        if (game.over) {
            alert('You died!');
            cancelAnimationFrame(aniID);
            window.location.reload();
        }
    };
    return { game: game, loop: gameLoop };
}

window.addEventListener('load', () => {
    currentState = createGameLoop();
    requestAnimationFrame(currentState.loop);
    setupJoystick(currentState.game);

})

startBtn.addEventListener('click', () => {
    if (aniID) {
        cancelAnimationFrame(aniID);
    }
    if (currentState.game) {
        killGame(currentState.game);
    }
    currentState = createGameLoop();
    aniID = requestAnimationFrame(currentState.loop);
    setupJoystick(currentState.game);
});
stopBtn.addEventListener('click', () => {
    if (paused) {
        paused = false;
        stopBtn.innerText = 'Pause';
        aniID = requestAnimationFrame(currentState.loop);
        return;
    }
    cancelAnimationFrame(aniID);
    stopBtn.innerText = 'Resume';
    paused = true;
})

