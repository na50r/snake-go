import { Input } from './scripts/input.js';
import { Player } from './scripts/player.js';
import { Map } from './scripts/map.js';
import { Camera } from './scripts/camera.js';

const app = document.getElementById('app')
const canvas = document.createElement('canvas');
canvas.id = 'canvasX';
const ctx = canvas.getContext('2d');

export const COLS = 24;
export const ROWS = 24;
export const TILE_SIZE = 32;
const GAME_WIDTH = 512;
const GAME_HEIGHT = 512;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

app.appendChild(canvas);
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
        this.input = new Input(this);
        this.player = new Player(this);
        this.map = new Map(this);
        this.camera = new Camera(this, GAME_WIDTH, GAME_HEIGHT);
        this.debug = false;
    }
    toggleDebug() {
        this.debug = !this.debug;
    }
    update(deltaTime) {
        this.camera.update(deltaTime);
        this.player.update(deltaTime);
    }
    drawLayer(ctx, layer) {
        const startCol = Math.floor(this.camera.x / this.map.tileSize);
        const endCol = startCol + (this.camera.width / this.map.tileSize);
        const startRow = Math.floor(this.camera.y / this.map.tileSize);
        const endRow = startRow + (this.camera.height / this.map.tileSize);

        const offsetX = -this.camera.x + startCol * this.map.tileSize;
        const offsetY = -this.camera.y + startRow * this.map.tileSize;

        for (var row = startRow; row <= endRow; row++) {
            for (var col = startCol; col <= endCol; col++) {
                const tile = this.map.getTile(layer, col, row);
                const x = (col - startCol) * this.map.tileSize + offsetX;
                const y = (row - startRow) * this.map.tileSize + offsetY;
                ctx.drawImage(
                    this.map.image,
                    (tile - 1) * this.map.image_tile % this.map.image.width,
                    Math.floor((tile - 1) / this.map.image_cols) * this.map.image_tile,
                    this.map.image_tile,
                    this.map.image_tile,
                    Math.round(x),
                    Math.round(y),
                    this.map.tileSize,
                    this.map.tileSize
                );
            }
        }
    }
    render(ctx, deltaTime) {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.update(deltaTime);
        this.drawLayer(ctx, 0);
        this.drawLayer(ctx, 1);
        this.player.draw(ctx);
        if (this.debug) drawGrid(ctx);
    };
}

var aniID;
var lastTime = 0;
function createGameLoop() {
    const game = new Game();
    const gameLoop = (timeStamp) => {
        aniID = requestAnimationFrame(gameLoop);
        const deltaTime = (timeStamp - lastTime) / 1000;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
    };
    return gameLoop;
}


window.addEventListener('load', () => {
    const gameLoop = createGameLoop();
    requestAnimationFrame(gameLoop);
})
