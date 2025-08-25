import { UP, DOWN, LEFT, RIGHT } from '../scripts/input.js';
import { COLS, ROWS, TILE_SIZE } from '../main.js';

function borderCollision(x, y) {
    return (x >= 0 && x < COLS && y >= 0 && y < ROWS);
}

export class Player {
    constructor(game) {
        this.input = game.input;
        this.pos = {
            x: 0,
            y: 0,
        };
        this.destPos = {
            x: this.pos.x,
            y: this.pos.y
        };
        this.distToTavel = {
            x: 0,
            y: 0
        }
        this.speed = 8;
    }
    moveTowards(destPos, speed) {
        this.distToTavel.x = destPos.x - this.pos.x;
        this.distToTavel.y = destPos.y - this.pos.y;
        var dist = Math.hypot(this.distToTavel.x, this.distToTavel.y);
        if (dist <= speed) {
            this.pos.x = destPos.x;
            this.pos.y = destPos.y;
        } else {
            const stepX = this.distToTavel.x / dist;
            const stepY = this.distToTavel.y / dist;
            this.pos.x += stepX * speed;
            this.pos.y += stepY * speed;

            this.distToTavel.x = destPos.x - this.pos.x;
            this.distToTavel.y = destPos.y - this.pos.y;
            dist = Math.hypot(this.distToTavel.x, this.distToTavel.y);
        }
        return dist;
    }
    update(deltaTime) {
        let newX = this.destPos.x;
        let newY = this.destPos.y;

        const scaledSpeed = this.speed * deltaTime;
        const dist = this.moveTowards(this.destPos, scaledSpeed);
        const arrived = dist <= scaledSpeed;
        if (arrived) {
            if (this.input.lastKey === UP) {
                newY--;
            } else if (this.input.lastKey === DOWN) {
                newY++;
            } else if (this.input.lastKey === LEFT) {
                newX--;
            } else if (this.input.lastKey === RIGHT) {
                newX++;
            }
            if (borderCollision(newX, newY)) {
                this.destPos.x = newX;
                this.destPos.y = newY;
            }
        }
    }
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.pos.x * TILE_SIZE, this.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}