import { UP, DOWN, LEFT, RIGHT } from './input.js';

function connectInput(btn, input, direction) {
    // Links input to buttons
    btn.addEventListener("mousedown", () => input.keyPressed(direction));
    btn.addEventListener("mouseup", () => input.keyReleased(direction));
    btn.addEventListener("mouseleave", () => input.keyReleased(direction));

    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        input.keyPressed(direction);
    });
    btn.addEventListener("touchend", () => input.keyReleased(direction));
    btn.addEventListener("touchcancel", () => input.keyReleased(direction));

}

export class Joystick {
    constructor(game) {
        this.game = game;
        this.left = document.createElement('button')
        this.left.innerText = '<';
        this.left.classList.add('joystick');
        this.left.classList.add('left');
        connectInput(this.left, this.game.input, LEFT);

        this.right = document.createElement('button')
        this.right.innerText = '>';
        this.right.classList.add('joystick');
        this.right.classList.add('right');
        connectInput(this.right, this.game.input, RIGHT);

        this.up = document.createElement('button')
        this.up.innerText = '^';
        this.up.classList.add('joystick');
        this.up.classList.add('up');
        connectInput(this.up, this.game.input, UP);

        this.down = document.createElement('button')
        this.down.innerText = 'v';
        this.down.classList.add('joystick');
        this.down.classList.add('down');
        connectInput(this.down, this.game.input, DOWN);
    }
    getKeys() {
        return [this.left, this.right, this.up, this.down];
    }
}