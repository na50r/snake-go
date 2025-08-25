import { UP, DOWN, LEFT, RIGHT } from '../scripts/input.js';

export class Camera {
    constructor(game, width, height) {
        this.game = game;
        this.map = game.map;
        this.input = game.input;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.maxX = this.map.cols * this.map.tileSize - this.width;
        this.maxY = this.map.rows * this.map.tileSize - this.height;
        this.speed = 128;
    }
    move(deltaTime, speedX, speedY) {
        this.x += speedX * this.speed * deltaTime;
        this.y += speedY * this.speed * deltaTime;
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));
    }
    oldUpdate(deltaTime) {
        var speedX = 0;
        var speedY = 0;
        if (this.input.lastKey === UP) {
            speedY = -1;
        } else if (this.input.lastKey === DOWN) {
            speedY = 1;
        } else if (this.input.lastKey === LEFT) {
            speedX = -1;
        } else if (this.input.lastKey === RIGHT) {
            speedX = 1;
        }
        this.move(deltaTime, speedX, speedY);
    }
    update(deltaTime) {
        const hero = this.game.hero;
        this.x = hero.position.x + hero.width / 2 - this.width / 2;
        this.y = hero.position.y + hero.height / 2 - this.height / 2;
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));
    }
}