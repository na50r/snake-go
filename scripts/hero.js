import { GameObject } from "./gameObject.js";
import { UP, DOWN, LEFT, RIGHT } from "./input.js";
import { TILE_SIZE, CAMERA_COL, CAMERA_ROW } from "../main.js";


function borderCollision(x, y) {
    return (x >= 0 && x < CAMERA_COL && y >= 0 && y < CAMERA_ROW);
}


export class Hero extends GameObject {
    constructor({ game, sprite, position, scale }) {
        super({ game, sprite, position, scale });
        this.speed = 128;
        this.maxFrame = 8; //Number of columns in row 8, 9, 10, 11
        this.moving = false;
    }
    update(deltaTime) {
        let nextX = this.destinationPosition.x;
        let nextY = this.destinationPosition.y;
        const scaledSpeed = this.speed * deltaTime;
        const distance = this.moveTowards(this.destinationPosition, scaledSpeed)
        const arrived = distance <= scaledSpeed;

        if (arrived) {
            if (this.game.input.lastKey === UP) {
                nextY -= TILE_SIZE;
                this.sprite.y = 8; //Row of animation in hero1.png
            } else if (this.game.input.lastKey === DOWN) {
                nextY += TILE_SIZE;
                this.sprite.y = 10;
            } else if (this.game.input.lastKey === LEFT) {
                nextX -= TILE_SIZE;
                this.sprite.y = 9;
            } else if (this.game.input.lastKey === RIGHT) {
                nextX += TILE_SIZE;
                this.sprite.y = 11;
            }
            const col = nextX / TILE_SIZE;
            const row = nextY / TILE_SIZE;
            if (borderCollision(col, row) && this.game.map.getTile(0, col, row) !== 1) {
                console.log('borderCollision', col, row);
                this.destinationPosition = { x: nextX, y: nextY };
            }
        }
        if (this.game.input.keys.length > 0 || !arrived) {
            this.moving = true;
        } else {
            this.moving = false;
        }

        if (this.game.eventUpdate && this.moving) {
            this.sprite.x < this.maxFrame ? this.sprite.x++ : this.sprite.x = 1;
        } else if (!this.moving) {
            this.sprite.x = 0;
        }
    }
}