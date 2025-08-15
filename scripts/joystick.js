import {UP, DOWN, LEFT, RIGHT} from './input.js';

// Based on: https://stackoverflow.com/a/34644069/16271405


function setupPath(path, input, key) {
    path.id = 'key'
    path.addEventListener("touchstart", (event) => {
        event.preventDefault(); // Prevent scrolling/zooming
        input.keyPressed(key);
    });

    path.addEventListener("touchend", (event) => {
        event.preventDefault();
        input.keyReleased(key);
    });

    path.addEventListener("touchcancel", (event) => {
        event.preventDefault();
        input.keyReleased(key);
    });
}


export class Joystick {
    constructor(game) {
        this.game = game;
        ({ joystick: this.js, svg: this.svg } = createJoystick());
        const upPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        upPath.setAttribute('d', 'M50,14 60,25 40,25Z')
        upPath.setAttribute('fill', 'rgba(0,0,0,0.8)')
        setupPath(upPath, this.game.input, UP);

        const downPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        downPath.setAttribute('d', 'M50,86 60,75 40,75Z')
        downPath.setAttribute('fill', 'rgba(0,0,0,0.8)')
        setupPath(downPath, this.game.input, DOWN);

        const leftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        leftPath.setAttribute('d', 'M14,50 25,60 25,40Z')
        leftPath.setAttribute('fill', 'rgba(0,0,0,0.8)')
        setupPath(leftPath, this.game.input, LEFT);

        const rightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        rightPath.setAttribute('d', 'M86,50 75,60 75,40Z')
        rightPath.setAttribute('fill', 'rgba(0,0,0,0.8)')
        setupPath(rightPath, this.game.input, RIGHT);

        this.svg.append(upPath, downPath, leftPath, rightPath);
        this.js.appendChild(this.svg)
    }
}

export function createJoystick() {
    const joystick = document.createElement('div');
    joystick.id = 'joystick';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.innerHTML = `
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(240,240,240);stop-opacity:1" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(240,240,240);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(168,168,168);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(239,239,239);stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad1)" />
        <circle cx="50" cy="50" r="47" fill="url(#grad2)" stroke="black" stroke-width="1.5px" />
        <circle cx="50" cy="50" r="44" fill="url(#grad3)" />
        <circle cx="50" cy="50" r="20" fill="#cccccc" stroke="black" stroke-width="1px"/>
    `;
    return {joystick, svg}
}

