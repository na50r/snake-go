import { Input } from './scripts/input.js';
import { Map } from './scripts/map.js';
import { Snake } from './scripts/snake.js';
import { Joystick } from './scripts/joystick.js';
import { InputDisplay } from './scripts/inputDisplay.js';
import { Food } from './scripts/food.js';

const app = document.getElementById('app');
const startBtn = document.getElementById('respawn');
const stopBtn = document.getElementById('pause');
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
app.append(canvas);


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
        this.map = new Map(this);
        this.input = new Input(this);
        this.snake = new Snake(this);
        this.joystick = new Joystick(this);
        this.food = new Food(this);
        this.inputDisplay = new InputDisplay(this);
        this.debug = false;
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
    const game = new Game();
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


