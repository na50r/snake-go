import { TILE_SIZE } from "../main.js";
import { ROWS, COLS } from "../main.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../main.js";

function setRandomPosition(collisionLayer) {
    const maxCol = COLS - 2;
    const maxRow = ROWS - 2;
    const minCol = 2;
    const minRow = 2;
    const col = Math.floor(Math.random() * (maxCol - minCol) + minCol);
    const row = Math.floor(Math.random() * (maxRow - minRow) + minRow);
    if (collisionLayer[COLS * row + col] === 2) {
        return setRandomPosition(collisionLayer);
    }
    return { x: col, y: row };
}

export class Food {
    constructor(game) {
        this.game = game;
        this.eaten = 0;
    }

    draw(ctx) {
        ctx.fillStyle = "gray";
        const fontSize = GAME_HEIGHT * 0.4;
        ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.eaten, (GAME_WIDTH + 2 * TILE_SIZE) / 2, GAME_HEIGHT / 2);
    }
}