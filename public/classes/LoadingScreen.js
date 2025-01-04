
const TRANSITION_LENGTH = 1 * 1000;

export class LoadingScreen {

    logoElement = document.createElement('img');
    background = document.createElement('div');
    loadingBarContainer = document.createElement('div')
    loadingBar = document.createElement('div');
    container;

    loadedAmount;

    /**
     * 
     * @param {*} logoURL 
     * @param { HTMLElement } container 
     */
    constructor(logoURL, container) {
        this.logoElement.classList.add('logo');
        this.logoElement.src = logoURL;
        this.loadingBarContainer.classList.add('bar-container');
        this.background.classList.add('loading-screen-container');
        this.loadingBar.classList.add('bar');

        this.loadingBarContainer.append(this.loadingBar);

        this.background.append(this.logoElement);
        this.background.append(this.loadingBarContainer);

        this.container = container;
        this.container.append(this.background);

        this.setLoadedAmount(0);
    }

    show() {
        this.container.style.display = 'flex';
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 50);
        });
    }

    hide() {
        this.container.style.display = 'none';
    }

    /**
     * @param { number } num Floating point number between 0 and 1
     */
    async setLoadedAmount(num) {
        this.loadingBar.style.width = (num * 100) + '%';
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), TRANSITION_LENGTH);
        });
    }
}