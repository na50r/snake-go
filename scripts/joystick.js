import { UP, DOWN, LEFT, RIGHT } from './input.js';

function connectInput(btn, input, direction, indicators) {
    btn.addEventListener("mousedown", () => input.keyPressed(direction));
    btn.addEventListener("mouseup", () => input.keyReleased(direction));
    btn.addEventListener("mouseleave", () => input.keyReleased(direction));

    btn.addEventListener("touchstart", (e) => {
        e.preventDefault(); 
        input.keyPressed(direction);
        indicators[direction].classList.add('active');
    });
    btn.addEventListener("touchend", () => input.keyReleased(direction));
    btn.addEventListener("touchcancel", () => input.keyReleased(direction));

}

function createJoystickDisplay() {
    const directions = [UP, DOWN, LEFT, RIGHT];

    const old = directions.map(dir => document.querySelector(`.joystick-display.${dir}`));
    old.forEach(el =>{
        if(el) el.remove()
        }
    )
    const displayKeys = {};
    directions.forEach(dir => {
        const div = document.createElement('div');
        div.classList.add('joystick-display', dir);
        const arrows = { UP: '⮝', DOWN: '⮟', LEFT: '⮜', RIGHT: '⮞' };
        div.innerText = arrows[dir];
        displayKeys[dir] = div;
    });
    return displayKeys;
}


export class Joystick {
    constructor(game) {
        this.display = createJoystickDisplay();
        this.game = game;
        this.left = document.createElement('button')
        this.left.innerText = '<';
        this.left.classList.add('joystick');
        this.left.classList.add('left');
        connectInput(this.left, this.game.input, LEFT, this.display);

        this.right = document.createElement('button')
        this.right.innerText = '>';
        this.right.classList.add('joystick');
        this.right.classList.add('right');
        connectInput(this.right, this.game.input, RIGHT, this.display);

        this.up = document.createElement('button')
        this.up.innerText = '^';
        this.up.classList.add('joystick');
        this.up.classList.add('up');
        connectInput(this.up, this.game.input, UP, this.display);

        this.down = document.createElement('button')
        this.down.innerText = 'v';
        this.down.classList.add('joystick');
        this.down.classList.add('down');
        connectInput(this.down, this.game.input, DOWN, this.display);
    }
    getButtons() {
        return [this.left, this.right, this.up, this.down];
    }
    getDisplay() {
        return [this.display[UP], this.display[DOWN], this.display[LEFT], this.display[RIGHT]]
    }
    setKey() {
        const lastKey = this.game.input.lastKey;
        for (const key in this.display) {
            if (key === lastKey) {
                this.display[key].classList.add('enabled');
            } else {
                this.display[key].classList.remove('enabled');
            }
        }
    }
}
