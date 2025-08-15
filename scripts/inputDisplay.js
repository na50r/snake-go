import { UP, DOWN, LEFT, RIGHT } from './input.js';

function createJoystickDisplay() {
    const directions = [UP, DOWN, LEFT, RIGHT];

    const old = directions.map(dir => document.querySelector(`.input-display.${dir}`));
    old.forEach(el =>{
        if(el) el.remove()
        }
    )
    const displayKeys = {};
    directions.forEach(dir => {
        const div = document.createElement('div');
        div.classList.add('input-display', dir);
        // TODO: Replace with images
        const arrows = { UP: '^', DOWN: 'v', LEFT: '<', RIGHT: '>' };
        div.innerText = arrows[dir];
        displayKeys[dir] = div;
    });
    return displayKeys;
}

export class InputDisplay {
    constructor(game) {
        this.game = game;
        this.displayKeys = createJoystickDisplay();
    }
    getKeys() {
        return [this.displayKeys[UP], this.displayKeys[DOWN], this.displayKeys[LEFT], this.displayKeys[RIGHT]];
    }
    update() {
        const lastKey = this.game.input.lastKey;
                for (const key in this.displayKeys) {
            if (key === lastKey) {
                this.displayKeys[key].classList.add('enabled');
            } else {
                this.displayKeys[key].classList.remove('enabled');
            }
        }
    }
}