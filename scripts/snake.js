import { UP, DOWN, LEFT, RIGHT } from "../scripts/input.js";
import { ROWS, COLS } from "../main.js";

const OPPOSITES = {
    [UP]: DOWN,
    [DOWN]: UP,
    [LEFT]: RIGHT,
    [RIGHT]: LEFT
}

function validMove(key, lastKey) {
    return (key !== OPPOSITES[lastKey]);
}

function insideMap(x, y) {
    return (x >= 0 && x < COLS && y >= 0 && y < ROWS);
}

function insideTail(x, y, map) {
    return (map.get(x,y) === 1);
}


export class Snake {
    constructor(game) {
        this.game = game;
        this.input = this.game.input;
        this.head = {
            x: 0,
            y: 0
        };
        this.destPos = {
            x: this.head.x,
            y: this.head.y
        }
        this.distToTravel = {
            x: this.destPos.x,
            y: this.destPos.y
        }
        this.body = [this.head];
        this.speed = 15;
        this.dir = RIGHT;
        this.size = 4;
    }
    moveTowards(destPos, speed) {
        this.distToTravel.x = destPos.x - this.head.x;
        this.distToTravel.y = destPos.y - this.head.y;
        var dist = Math.hypot(this.distToTravel.x, this.distToTravel.y);
        if (dist <= speed) {
            this.head.x = destPos.x;
            this.head.y = destPos.y;
        } else {
            const stepX = this.distToTravel.x / dist;
            const stepY = this.distToTravel.y / dist;
            this.head.x += stepX * speed;
            this.head.y += stepY * speed;

            this.distToTravel.x = destPos.x - this.head.x;
            this.distToTravel.y = destPos.y - this.head.y;
            dist = Math.hypot(this.distToTravel.x, this.distToTravel.y);
        }
        return dist;
    }
    update(deltaTime) {
        let newX = this.destPos.x;
        let newY = this.destPos.y;
        const scaledSpeed = this.speed * (deltaTime / 1000);
        const dist = this.moveTowards(this.destPos, scaledSpeed);
        if (dist <= scaledSpeed) {
            // Listen for directions
            var newDir = this.input.lastKey;
            if (!validMove(newDir, this.dir) || !newDir) {
                newDir = this.dir;
            }
            this.dir = newDir;
            if (this.dir === UP) {
                newY--;
            }
            if (this.dir === DOWN) {
                newY++;
            }
            if (this.dir === LEFT) {
                newX--;
            }
            if (this.dir === RIGHT) {
                newX++;
            }
            // Move
            if (insideMap(newX, newY) && !insideTail(newX, newY, this.game.map)) {
                this.destPos.x = newX;
                this.destPos.y = newY;
                this.body.unshift({ x: newX, y: newY });
                if (this.game.map.get(newX, newY) === 2) {
                    this.game.food.update()
                }
                this.game.map.set(newX, newY, 1);
                if (this.body.length > this.size) {
                    const tail = this.body.pop();
                    this.game.map.set(tail.x, tail.y, 0);
                }
                this.game.socket.send(JSON.stringify(this.game.map.map));
            }
        }
    }
}
