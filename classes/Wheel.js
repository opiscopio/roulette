import { TOTAL_WHEEL_ANIMATION_TIME, WHEEL_ANIMATION_TIME, wheelNumMap } from './constants.js';
import { playAudio } from './util.js';

class Wheel {

    container = document.createElement('div');
    wheel = document.createElement('img');
    wheelBackground = document.createElement('img');
    ballContainer = document.createElement('div');
    ball = document.createElement('div');
    winningNumber = document.createElement('span');

    constructor() {

        this.container.classList.add('wheel-container');

        this.winningNumber.classList.add('winning-number');
        this.winningNumber.style.display = 'none';
        
        const wheel = this.wheel;

        this.ball.classList.add('ball');
        this.ballContainer.classList.add('ball-container');

        this.ballContainer.append(this.ball);

        wheel.src = './res/WheelFront.webp';
        wheel.width = 400;
        wheel.height = 400;

        this.wheelBackground.src = './res/WheelBack.webp';
        this.wheelBackground.classList.add('wheel-background');

        this.container.append(this.wheelBackground);
        this.container.append(wheel);
        this.container.append(this.ballContainer);
        this.container.append(this.winningNumber);
    }

    getRotationOfNumber(num) {
        const position = wheelNumMap.indexOf(num);
        // Angle for a single step(number)
        const stepAngle = (360 / wheelNumMap.length);
        return -stepAngle * position// + stepAngle * 0.5;
    }

    spin(num, color) {
        const rotation = this.getRotationOfNumber(num);
        this.winningNumber.innerHTML = num;
        this.winningNumber.style.backgroundColor = color;
        this.container.classList.add('spinning');

        setTimeout(() => {
            playAudio('./res/Wheel.mp3');
            this.wheel.style.transform = 'rotate(' + (1080 + rotation) + 'deg)';
            this.ballContainer.style.transform = 'rotate(' + (-1080) + 'deg)';
            this.ball.style.transform = 'translateY(64px)';
        }, 100)
        setTimeout(() => {
            this.ball.classList.add('shake-ball');
        }, WHEEL_ANIMATION_TIME - 1000)
        setTimeout(() => {
            this.winningNumber.style.opacity = '0';
            this.winningNumber.style.display = 'inline';
            setTimeout(() => {
                this.winningNumber.style.opacity = '1';
            }, 50)
        }, WHEEL_ANIMATION_TIME - 500)
        setTimeout(() => {
            this.container.classList.remove('spinning');
            this.wheel.style.transform = 'rotate(0deg)';
            this.ballContainer.style.transform = 'rotate(0deg)';
            this.ball.style.transform = 'translateY(0)';
            this.winningNumber.style.opacity = '0';
        }, TOTAL_WHEEL_ANIMATION_TIME);
    }
}

export { Wheel };