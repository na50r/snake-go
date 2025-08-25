import { Input } from './scripts/input.js';
import { Map } from './scripts/map.js';
import { Camera } from './scripts/camera.js';
import { Hero } from './scripts/hero.js';

export const COLS = 12;
export const ROWS = 12; 
export const TILE_SIZE = 64;
export const HALF_TILE = TILE_SIZE / 2;

export const CAMERA_COL = 8;
export const CAMERA_ROW = 8;

const GAME_WIDTH = 512;
const GAME_HEIGHT = 512;

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
        this.hero = new Hero({
            game: this,
            position: {
                x: 1 * TILE_SIZE,
                y: 2 * TILE_SIZE
            },
            sprite: {
                image: document.getElementById('hero1'),
                x: 0,
                y: 11,
                width: 64,
                height: 64
            },
            scale: 1.1,
        });
        this.map = new Map(this);
        this.camera = new Camera(this, GAME_WIDTH, GAME_HEIGHT);
        this.debug = false;

        this.eventUpdate = false;
        this.eventTimer = 0;
        this.eventInterval = 60;
    }
    toggleDebug() {
        this.debug = !this.debug;
    }
    update(deltaTime) {
        this.hero.update(deltaTime);
        this.camera.update(deltaTime);
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
        this.drawLayer(ctx, 1);
        this.drawLayer(ctx, 2);
        this.hero.draw(ctx);
        if (this.debug) drawGrid(ctx);

        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime * 1000;
            this.eventUpdate = false;
        } else {
            this.eventTimer = 0;
            this.eventUpdate = true;
        }
    };
}

var aniID;
var lastTime = 0;
function createGameLoop(ctx) {
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
    const canvas = document.getElementById('canvasX');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const gameLoop = createGameLoop(ctx);
    requestAnimationFrame(gameLoop);
})
