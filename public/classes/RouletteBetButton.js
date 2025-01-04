import { getNearestUpperBetAmountTo, nearestLowerNumberTo } from './util.js';

/**
 * Each bet is represented by a RouletteBetButton - a HTML button on the roulette table.
 * it stores information such as the numbers that the bet is placed on, bet amount.
 */
class RouletteBetButton {

    numbers;
    bets = [];
    /**
     * @type { HTMLButtonElement }
     */
    button;
    /**
     * @type { HTMLElement }
     */
    chipElement;
    chipImage = document.createElement('img');
    chipText = document.createElement('span');


    rotation;

    multiplier;

    constructor(numbers, label, rotation, multiplier = 2) {
        this.multiplier = multiplier;
        if(label || rotation) {
            this.rotation = rotation;
            this.button = document.createElement('button');
            this.button.innerHTML = label;
            this.button.style.transform = 'rotate(' + rotation + 'deg)';
        }
        this.numbers = numbers || [];
        this.chipElement = document.createElement('div');
        this.chipElement.style.borderRadius = '100px';
        this.chipElement.style.transform = 'translate(-50%, -50%)';
        this.chipElement.style.opacity = '100%';
        this.chipElement.style.display = 'flex';
        this.chipElement.style.alignItems = 'center';
        this.chipElement.style.justifyContent = 'center';
        this.chipElement.classList.add('chip');

        this.chipImage.classList.add('table-chip-img')

        this.chipText.classList.add('table-chip-text');
        
        this.chipElement.append(this.chipImage);
        this.chipElement.append(this.chipText);
    }

    addBet(amount) {
        if(amount === 0) {
            return;
        }
        let sum = 0;
        let limit = false;
        let currBet = nearestLowerNumberTo(amount, [50, 100, 200, 500, 1000]);
        while(!limit && (sum + currBet <= amount)) {
            const totalBetsOfType = this.bets.filter(bet => bet === currBet).length;
            if(totalBetsOfType < 10) {
                this.bets.push(currBet);
                sum += currBet;
            } else if (currBet >= 1000) {
                limit = true;
            } else {
                currBet = getNearestUpperBetAmountTo(currBet);
            }
        }
        // if(this.bets.filter(bet => bet === amount).length >= 10) {
        //     return false;
        // }
        // this.bets.push(amount);
        this.renderChip();
        // return true;
    }

    renderChip() {
        if(this.bets.length > 0) {
            this.chipElement.style.display = 'flex';
            this.chipElement.style.position = 'absolute';
            this.chipText.innerHTML = this.bets.reduce((prev, curr) => prev + curr).toString();
            const buttonPosition = this.button.getBoundingClientRect();
            this.chipElement.style.left = buttonPosition.x + 
                (this.rotation ? this.button.clientHeight : this.button.clientWidth) / 
                2 + 1 + 'px'; 
            this.chipElement.style.top = buttonPosition.y + 
                (this.rotation ? this.button.clientWidth : this.button.clientHeight) / 
                2 + 1 + 'px';
            // this.chipElement.style.backgroundColor = 'green';
            // this.chipElement.style.borderColor = 'white';
            // this.chipElement.style.borderWidth = '4px';
            // this.chipElement.style.borderStyle = 'dashed';
            this.chipElement.style.width = '48px';
            this.chipElement.style.height = '48px';
            const TOTAL_BET = this.getTotalBetAmount();
            if(TOTAL_BET >= 1000) {
                this.chipImage.src = './res/ChipOrange.svg';
            } else if(TOTAL_BET >= 500) {
                this.chipImage.src = './res/ChipBlueDark.svg';
            } else if(TOTAL_BET >= 200) {
                this.chipImage.src = './res/ChipRed.svg';
            } else if(TOTAL_BET >= 100){
                this.chipImage.src = './res/ChipGreen.svg';
            } else {
                this.chipImage.src = './res/ChipBlueLight.svg';
            }
            // this.chipElement.style.opacity = '100%';
        } else {
            this.chipElement.style.display = 'none';
        }
    }

    getHistoryData() {
        return {
            button: this,
            amount: this.getTotalBetAmount()
        }
    }

    getTotalBetAmount() {
        return this.bets.length > 0 ? this.bets.reduce((prev, curr) => prev + curr) : 0;
    }

    setBet(bet) {
        if(bet == 0) {
            this.clearBet();
            return;
        }
        this.bets = [bet];
        this.renderChip();
    }

    undoBet() {
        this.bets.pop();
        this.renderChip();
    }

    clearBet() {
        console.log('clearing bet');
        this.bets = [];
        this.renderChip();
    }
}

export { RouletteBetButton };