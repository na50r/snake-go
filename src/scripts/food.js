import { TILE_SIZE } from "../main.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../main.js";

export class Food {
    constructor(game) {
        this.game = game;
        this.eaten = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "gray";
        const fontSize = GAME_HEIGHT * 0.3;
        ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.eaten, (GAME_WIDTH + 2 * TILE_SIZE) / 2, GAME_HEIGHT / 2);
        ctx.restore();
    }
}