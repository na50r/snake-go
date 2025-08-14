import { COLS, ROWS, TILE_SIZE } from '../main.js';

function createMap() {
    const size = COLS * ROWS;
    const emptyMap = new Array(size).fill(0);
    return emptyMap;
}

export class Map {
    constructor(game) {
        this.game = game;
        this.data = createMap();
    }
    set(x, y, value) {
        this.data[y * COLS + x] = value;
    }
    get(x, y) {
        return this.data[y * COLS + x];
    }
    draw(ctx) {
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                if (this.get(c, r) === 1) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
                if (this.get(c, r) === 2) {
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}