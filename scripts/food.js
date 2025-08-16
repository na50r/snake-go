import { TILE_SIZE } from "../main.js";
import { ROWS, COLS } from "../main.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../main.js";

function setRandomPosition(map) {
    const maxCol = COLS - 1;
    const maxRow = ROWS - 1;
    const col = Math.floor(Math.random() * (maxCol));
    const row = Math.floor(Math.random() * (maxRow));
    const pos = COLS * row + col;
    if (map.length > 0 && map[pos] === 1) {
        return setRandomPosition(map);
    }
    return { x: col, y: row };
}

export class Food {
    constructor(game) {
        this.game = game;
        this.eaten = 0;
        this.pos = setRandomPosition(this.game.map.data);
        this.game.map.set(this.pos.x, this.pos.y, 2);
    }
    update() {
        this.pos = setRandomPosition(this.game.map.data);
        this.game.snake.size += 1;
        this.eaten += 1;
        this.game.map.set(this.pos.x, this.pos.y, 2);
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