import { Input } from './scripts/input.js';
import { Map } from './scripts/map.js';
import { Snake } from './scripts/snake.js';
import { Joystick } from './scripts/joystick.js';

const app = document.getElementById('app');
const startBtn = document.createElement('button');
const stopBtn = document.createElement('button');
startBtn.innerText = 'Respawn';
stopBtn.innerText = 'Pause';
const joystickButton = document.createElement('button');
joystickButton.innerText = 'Joystick';

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
app.append(startBtn, stopBtn, joystickButton, canvas);

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
        this.over = false;
        this.socket = new WebSocket('ws://localhost:8080/ws');
        this.map = new Map(this);
        this.input = new Input(this);
        this.snake = new Snake(this);
        this.joystick = new Joystick(this);
        this.debug = false;
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'map') {
                this.map.data = msg.payload;
            }
            if (msg.type === 'grow') {
                this.snake.size += 1;
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
        if (this.debug) drawGrid(ctx);
        this.snake.update(deltaTime);
        this.map.draw(ctx);
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
var enabled = true;
var currentState = { game: null, loop: null }

function setupJoystick(game) {
    const oldJoystick = document.getElementById('joystick');
    if (oldJoystick) {
        oldJoystick.remove();
    }
    app.append(game.joystick.js);
}


function createGameLoop() {
    const game = new Game();
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        if (game.over) {
            alert('You died!');
            cancelAnimationFrame(aniID);
            killGame(game);
            window.location.reload();
        }
    };
    return {game: game, loop: gameLoop };
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
    requestAnimationFrame(currentState.loop);
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

joystickButton.addEventListener('click', () => {
    if (enabled) {
        enabled = false;
        const joystick = document.getElementById('joystick');
        joystick.classList.add('disabled');
        return;
    }
    enabled = true;
    const joystick = document.getElementById('joystick');
    joystick.classList.remove('disabled');
    
})