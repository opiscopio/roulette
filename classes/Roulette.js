/**
 * Roulette game
 * 
 * To add logic to when the spin button is pressed, see the .spin() method of the Roulette class
 */

/**
 * @import { BetHistoryItem } from './BetHistory.js';
 */
import { BetNumber } from './BetNumber.js';
import { RouletteBetButton } from './RouletteBetButton.js';
import { ChipButton } from './ChipButton.js';
import { Button } from './Button.js';
import { BetHistory } from './BetHistory.js';
import { Wheel } from './Wheel.js';
import { createBetNumberButtonsForBaseTable, createBetNumbers, getButtonsArraySize, getTableButtonPosition, isEven, numToCurrency, playAudio, randNum } from './util.js';
import { tableColors, TOTAL_WHEEL_ANIMATION_TIME, WINNING_NUMBER_ANIMATION_TIME, zeroNumber } from './constants.js';
import { ToggleButton } from './ToggleButton.js';
import { Player } from './Player.js';
import state from './state.js';
import { MyEvents } from './MyEvents.js';
import { MusicPlayer } from './MusicPlayer.js';

const sound = {
    chip: './res/sound/chip.mp3',
    button: './res/sound/button.mp3'
}

class Roulette {
    /**
     * @type { HTMLButtonElement[] }
     */
    buttonElements = [];

    /**
     * @type { RouletteBetButton[][] }
     */
    baseTableButtons = []
    /**
     * @type { RouletteBetButton[] }
     */
    twoToOneButtons = [];

    /**
     * @type { RouletteBetButton[] }
     */
    columnButtons = [];

    /**
     * @type { RouletteBetButton[] }
     */
    bottomRowButtons = [];

    /**
     * @type { RouletteBetButton }
     */
    zeroButton = new RouletteBetButton([zeroNumber], '0', undefined, 36);

    balanceElement = this.createNumberIndicatorElement('SALDO');
    totalBetElement = this.createNumberIndicatorElement('APUESTA TOTAL')

    /**
     * @type { ChipButton[] }
     */
    chipButtons = [];

    clearBetButton = new Button('./res/ButtonClear.svg', 64, 'BORRAR');
    undoButton = new Button('./res/ButtonUndo.svg', 64, 'DESHACER');
    restoreButton = new Button('./res/ButtonRepeat.svg', 64, 'REPETIR');
    doubleButton = new Button('./res/ButtonDouble.svg', 64, 'DOBLAR');
    spinButton = new Button('./res/ButtonSpin.svg', 64, 'TIRAR');

    betHistory = new BetHistory();

    overlay = document.createElement('div');

    winMessage = document.createElement('div');
    winMessageAmount = document.createElement('span');

    /**
     * @type { BetHistoryItem[] }
     */
    latestBet = [];

    wheel = new Wheel();

    /**
     * @type { number }
     * Currently selected bet amount
     */
    betAmount = 50;

    /**
     * The actual balance of the player
     */
    balance = 10000;

    defaultBalance = 10000;

    winningNumberHistory = [];

    betNumbers = createBetNumbers(tableColors, 3, 12);

    winningNumbersList = document.createElement('ul');

    muteButton = new ToggleButton('./res/ButtonSoundON.svg', './res/ButtonSoundOFF.svg', '48px');
    listButton = new Button('./res/ButtonList.svg', 36);
    leaveButton = new Button('./res/ButtonList.svg', 36);

    listOverlay = document.createElement('div');

    /**
     * Called when the user leaves the game
     */
    onLeave;

    /** @type { HTMLTableElement } */
    table;

    /** @type { HTMLElement } */
    container;

    events = new MyEvents(['afterConstruct', 'afterSpin'])

    /**
     * @typedef { Object } RouletteOptions
     * @param { ChipButton[] } chipButtons
     */

    /**
     * 
     * @param { HTMLElement } gameContainer 
     * @param { RouletteOptions } options
     */
    constructor(gameContainer, options = {}) {
        
        this.container = gameContainer;
        gameContainer.classList.add('roulette-game-container');
        

        const container = /** @type { HTMLElement } */ document.createElement('div');//(gameContainer.querySelector('#game'));
        container.classList.add('roulette-game');
        const dynamicContainer = /** @type { HTMLElement } */ document.createElement('div');
        dynamicContainer.classList.add('dynamic');

        gameContainer.append(container, dynamicContainer);

        this.muteButton.button.classList.add('mute');
        gameContainer.append(this.muteButton.button);

        this.listButton.button.classList.add('list');
        gameContainer.append(this.listButton.button);

        this.leaveButton.button.classList.add('leave');
        gameContainer.append(this.leaveButton.button);


        this.listOverlay.classList.add('overlay', 'dismissable-overlay');
        this.listOverlay.style.opacity = '0';
        const betListImg = document.createElement('img');
        betListImg.src = './res/PaymentChart.webp';
        betListImg.classList.add('bet-list')

        this.listOverlay.append(betListImg);

        gameContainer.append(this.listOverlay);

        // Header
        const headerElement = document.createElement('div');
        headerElement.classList.add('header');
        
        //const balanceElements = this.createNumberIndicatorElement('Balance');
        //const totalElements = this.createNumberIndicatorElement('Total');

        // this.balanceElement.indicator.innerHTML = numToCurrency(this.balance);
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('header', 'header-nav');
        controlsContainer.style.width = 'fit-content';

        controlsContainer.append(this.clearBetButton.button);
        controlsContainer.append(this.undoButton.button);
        controlsContainer.append(this.restoreButton.button);
        controlsContainer.append(this.doubleButton.button);
        controlsContainer.append(this.spinButton.button);

        headerElement.append(this.balanceElement.container, controlsContainer, this.totalBetElement.container);

        container.append(headerElement);

        const chipButtonsContainer = document.createElement('div');
        chipButtonsContainer.classList.add('chip-buttons');

        // if(mode === 'single') {
        this.chipButtons = options.chipButtons || [
            new ChipButton(50, './res/ChipBlueLight.svg'),
            new ChipButton(100, './res/ChipGreen.svg'),
            new ChipButton(200, './res/ChipRed.svg'),
            new ChipButton(500, './res/ChipBlueDark.svg'),
            new ChipButton(1000, './res/ChipOrange.svg')
        ];

        this.chipButtons.forEach(button => {
            chipButtonsContainer.append(button.button);
        })

        this.chipButtons[0].setActive();

        container.append(chipButtonsContainer);

        this.winningNumbersList.classList.add('winning-numbers');

        gameContainer.append(this.winningNumbersList);

        const tableSizeX = 3;
        const tableSizeY = 12;
        const betNumbers = this.betNumbers;
        const baseTableButtons = createBetNumberButtonsForBaseTable(betNumbers, 3, 12);
        this.baseTableButtons = baseTableButtons;
        const table = document.createElement('table');
        this.table = table;

        /**
         * @type { HTMLTableRowElement[] }
         */
        const rows = [];

        for(let i = 0; i < tableSizeX; i++) {
            rows.push(document.createElement('tr'));
        }

        this.twoToOneButtons = [
            new RouletteBetButton(this.getBetNumbersRow(0), '2:1', -90, 3),
            new RouletteBetButton(this.getBetNumbersRow(1), '2:1', -90, 3),
            new RouletteBetButton(this.getBetNumbersRow(2), '2:1', -90, 3)
        ];

        // Create a HTML table for the numbers
        for(let y = 0; y < tableSizeY + 1; y++) {
            for(let x = tableSizeX - 1; x >= 0; x--) {
                const cell = document.createElement('td');
                const cellDiv = document.createElement('div');
                cell.append(cellDiv);
                if (y >= tableSizeY) {
                    cell.classList.add('side', 'gray');
                    dynamicContainer.append(this.twoToOneButtons[x].chipElement)
                    cellDiv.append(this.twoToOneButtons[x].button)
                    rows[x].append(cell);
                    continue;
                }

                const number = betNumbers[y][x];
                if(number.color === 'r') {
                    cell.style.backgroundColor = '#D33438';
                } else {
                    cell.style.backgroundColor = 'black';
                }
                cellDiv.innerHTML = number.number;
                rows[x].append(cell);
            }
        }



        rows.reverse();

        rows.forEach(row => {
            table.append(row);
        })

        this.columnButtons = [
            new RouletteBetButton(this.getAllBetNumbers().slice(1, 13), '1ra 12', undefined, 3),
            new RouletteBetButton(this.getAllBetNumbers().slice(13, 25), '2da 12', undefined, 3),
            new RouletteBetButton(this.getAllBetNumbers().slice(25, 37), '3ra 12', undefined, 3)
        ];

        const columnButtonsRow = document.createElement('tr');

        this.columnButtons.forEach((button) => {
            const col = document.createElement('td');
            col.colSpan = 4;
            col.append(button.button);
            col.classList.add('gray');
            col.classList.add('col-button')
            columnButtonsRow.append(col);
            dynamicContainer.append(button.chipElement);
        })

        table.append(columnButtonsRow);

        this.bottomRowButtons = [
            new RouletteBetButton(this.getAllBetNumbers().slice(1, 19), '1 - 18', undefined, 2),
            new RouletteBetButton(this.getAllBetNumbers().filter(num => num.number !== 0 && isEven(num.number)), 'PAR', undefined, 2),
            new RouletteBetButton(this.getAllBetNumbers().filter(num => num.color === 'r'), 'red', undefined, 2),
            new RouletteBetButton(this.getAllBetNumbers().filter(num => num.color === 'b'), 'black', undefined, 2),
            new RouletteBetButton(this.getAllBetNumbers().filter(num => num.number !== 0 && !isEven(num.number)), 'IMPAR', undefined, 2),
            new RouletteBetButton(this.getAllBetNumbers().slice(19, 37), '19 - 36')
        ];

        const bottomRow = document.createElement('tr');

        this.bottomRowButtons.forEach(button => {
            const col = document.createElement('td');
            col.colSpan = 2;
            col.append(button.button);
            if(button.button.innerText === 'red') {
                col.classList.add('red')
                // Need to add a space character because having no characters
                // messes with the consistency of the layout for some reason
                button.button.innerHTML = '&nbsp;';
            } else if(button.button.innerText === 'black') {
                col.classList.add('black');
                button.button.innerHTML = '&nbsp;';
            } else {
                col.classList.add('gray');
            }
            col.classList.add('col-button')
            bottomRow.append(col);
            dynamicContainer.append(button.chipElement);
        })

        table.append(bottomRow);

        container.append(table);

        const zeroButtonContainer = document.createElement('div');
        const zeroButtonImage = document.createElement('img');
        zeroButtonImage.src = './res/GreenPart.svg';
        zeroButtonContainer.style.position = 'absolute';
        zeroButtonContainer.style.display = 'flex';
        zeroButtonContainer.style.alignItems = 'center';
        this.zeroButton.button.style.position = 'absolute';
        this.zeroButton.button.style.left = '0px';
        this.zeroButton.button.style.top  = '0px';
        this.zeroButton.button.style.width = '100%';
        this.zeroButton.button.style.height = '100%';
        this.zeroButton.button.classList.add('table-extra-button');

        zeroButtonContainer.append(zeroButtonImage);
        zeroButtonContainer.append(this.zeroButton.button)
        dynamicContainer.append(zeroButtonContainer);
        dynamicContainer.append(this.zeroButton.chipElement);

        const buttonElementsArraySize = getButtonsArraySize(tableSizeX, tableSizeY);
        
        console.log(baseTableButtons);

        const buttonElements = [];
        for(let y = 0; y < buttonElementsArraySize.y; y++) {
            for(let x = buttonElementsArraySize.x - 1; x >= 0; x--) {
                const button = document.createElement('button');
                const position = getTableButtonPosition(
                    table, 
                    x, 
                    y, 
                    buttonElementsArraySize.x,
                    buttonElementsArraySize.y
                );
                button.style.position = 'absolute';
                button.style.left = position.x + 'px';
                button.style.top = position.y + 'px';
                button.style.width = '32px';
                button.style.height = '32px';
                button.style.cursor = 'pointer';
                button.style.opacity = '0%';
                button.style.transform = 'translate(-50%, -50%)';
                button.style.margin = '0px';

                buttonElements.push(button);
                baseTableButtons[y][x].button = button;
                dynamicContainer.append(baseTableButtons[y][x].chipElement)
                dynamicContainer.append(button);
            }
        }
        this.buttonElements = buttonElements;

        this.winMessage.classList.add('win-message');
        this.winMessage.style.opacity = '0';
        this.winMessageAmount.classList.add('amount');
        // const winMessageImg = document.createElement('img');
        // winMessageImg.src = './res/GradientYouWon.webp';
        // this.winMessage.append(winMessageImg);

        const winMessageText = document.createElement('span');
        winMessageText.innerHTML = 'HA GANADO';

        this.winMessage.append(winMessageText)
        this.winMessage.append(this.winMessageAmount);

        this.overlay.classList.add('overlay');
        this.overlay.append(this.wheel.container);
        this.overlay.append(this.winMessage);

        gameContainer.append(this.overlay);

        this.overlay.style.opacity = '0';

        this.renderBalance();
        this.renderBetTotal();

        this.addEventListeners();
    }

    setChipButtons(buttons) {

    }

    /**
     * Reset the game
     */
    restart() {
        
        this.balance = this.defaultBalance;
        this.clearBets();
        this.renderBalance();
        // setTimeout(() => {
        this.renderTable();        // }, 2000);
    }

    renderTable() {
        const zeroButtonContainer = /** @type{ HTMLElement } */ (this.zeroButton.button.parentElement);
        const zeroButtonImage = /** @type { HTMLImageElement } */ (zeroButtonContainer.querySelector('img'));

        const table = this.table;

        const bottomRows = table.querySelectorAll('tr:nth-child(n+4)');
        const bottomRowsHeight = Array.from(bottomRows).map(row => row.clientHeight).reduce((prev, curr) => prev + curr);
        zeroButtonImage.style.height = table.clientHeight - bottomRowsHeight + 'px';
        zeroButtonContainer.style.right = (table.getBoundingClientRect().left + table.clientWidth) - 2 + 'px';
        zeroButtonContainer.style.top = table.getBoundingClientRect().top + 'px';

        const buttonElementsArraySize = getButtonsArraySize(3, 12); 

        for(let y = 0; y < buttonElementsArraySize.y; y++) {
            for(let x = buttonElementsArraySize.x - 1; x >= 0; x--) {
                const button = this.baseTableButtons[y][x].button;//document.createElement('button');
                const position = getTableButtonPosition(
                    table, 
                    x, 
                    y, 
                    buttonElementsArraySize.x,
                    buttonElementsArraySize.y
                );
                button.style.left = position.x + 'px';
                button.style.top = position.y + 'px';
            }
        }
    }

    createNumberIndicatorElement(label) {
        const container = document.createElement('div');
        container.classList.add('indicator-container')

        const labelElement = document.createElement('span');

        labelElement.innerHTML = label;

        const indicator = document.createElement('span');
        indicator.classList.add('indicator');

        container.append(labelElement);
        container.append(indicator);

        return {
            container,
            indicator
        }
    }

    /**
     * 
     * @returns { BetNumber[] }
     */
    getAllBetNumbers() {
        let betNumbers = [zeroNumber];
        for(let y = 0; y < this.betNumbers.length; y++) {
            betNumbers = betNumbers.concat(this.betNumbers[y]);
        }
        return betNumbers;
    }

    /**
     * 
     * @returns { RouletteBetButton[] }
     */
    getAllBetButtons() {
        let allButtons = [];
        const size = getButtonsArraySize(3, 12);
        for(let y = 0; y < size.y; y++) {
            allButtons = allButtons.concat(this.baseTableButtons[y]);
        }
        allButtons = allButtons.concat(this.twoToOneButtons);
        allButtons = allButtons.concat(this.columnButtons);
        allButtons = allButtons.concat(this.bottomRowButtons);
        allButtons.push(this.zeroButton);
        return allButtons;
    }

    getBetNumbersRow(row) {
        let betNumbers = [];
        for(let y = 0; y < this.betNumbers.length; y++) {
            betNumbers.push(this.betNumbers[y][row]);
        }
        return betNumbers;
    }

    renderBalance() {
        this.balanceElement.indicator.innerHTML = numToCurrency(this.balance);
    }

    renderBetTotal() {
        const betAmount = this.getTotalBet();
        this.totalBetElement.indicator.innerHTML = numToCurrency(betAmount);
    }

    renderWinningNumbers() {
        this.winningNumbersList.innerHTML = '';
        for(const winningNumber of this.winningNumberHistory) {
            const liElement = document.createElement('li');
            liElement.innerHTML = winningNumber;
            this.winningNumbersList.append(liElement);
        }
    }

    getTotalBet() {
        const allBetButtons = this.getAllBetButtons();
        const betAmount = allBetButtons.map(button => button.getTotalBetAmount()).reduce((prev, curr) => prev + curr);
        return betAmount;
    }   

    addEventListeners() {
        this.getAllBetButtons().forEach(button => {
            button.button.addEventListener('click', () => {
                console.log(button.numbers);
                if(this.getTotalBet() + this.betAmount > this.balance) {
                    return;
                }
                button.addBet(this.betAmount);
                this.betHistory.push(
                    this.getAllBetButtons().map(button => button.getHistoryData())
                )
                this.renderBalance();
                this.renderBetTotal();
                playAudio(sound.chip);
            })
        })

        this.chipButtons.forEach((button) => {
            button.onClick = (amount) => {
                if(this.betAmount === amount) return;
                playAudio(sound.chip);
                this.setBetAmount(amount);
                this.makeAllChipButtonsInactive();
                button.setActive();
            }
        })

        
        this.clearBetButton.button.addEventListener('click', () => {
            playAudio(sound.button);
            this.clearBets();
            this.renderBalance();
            this.renderBetTotal();
        })

        this.undoButton.button.addEventListener('click', () => {
            playAudio(sound.button);
            this.betHistory.undo();
            this.renderBalance();
            this.renderBetTotal();
        })

        this.doubleButton.button.addEventListener('click', () => {
            playAudio(sound.button);
            this.doubleAmounts();
            this.renderBalance();
            this.renderBetTotal();
        });

        this.restoreButton.button.addEventListener('click', () => {
            playAudio(sound.button);
            BetHistory.restoreToItem(this.latestBet);
            this.betHistory.push(this.latestBet);
            this.renderBalance();
            this.renderBetTotal();
        })

        this.spinButton.button.addEventListener('click', () => {
            playAudio(sound.button);
            this.spin();
        })

        this.listButton.button.addEventListener('click', () => {
            this.listOverlay.classList.add('active');
            this.listOverlay.style.opacity = '1';
        })
        
        this.listOverlay.addEventListener('click', () => {
            this.listOverlay.classList.remove('active');
            this.listOverlay.style.opacity = '0';
        })

        this.muteButton.button.addEventListener('click', () => {
            state.soundOn = !state.soundOn;
        });

        this.leaveButton.button.addEventListener('click', () => {
            if(confirm('Are you sure you want to leave?')) {
                if(this.onLeave) {
                    this.onLeave();
                }
            }
        })
    }

    setBetAmount(amount) {
        this.betAmount = amount;
    }

    getBetNumber(num) {
        for(const row of this.betNumbers) {
            for(const betNumber of row) {
                if(betNumber.number === num) {
                    return betNumber;
                }
            }
        }
        return zeroNumber;
    }

    /**
     * 
     * @returns Bet buttons that have a bet placed on them
     */
    getButtonsWithBets() {
        return this.getAllBetButtons().filter(button => button.getTotalBetAmount() > 0);
    }

    setBalance(balance) {
        this.balance = balance;
    }

    /**
     * Use this function to implement the spin request logic to determine the winning number and sum won
     * 
     * @param { RouletteBetButton[] } betButtons // The buttons with the bet data
     */
    requestSpin(betButtons) {

        const winningNumber = randNum(36);

        const betNumber = this.getBetNumber(winningNumber);

        // Win amount with initial bet
        const wonAmountTotal = this.calculateWonAmount(betNumber, betButtons);
        // Win amount without initial bet
        const wonAmount = wonAmountTotal - this.getTotalBet();
        console.log(wonAmount);

        return {
            winningNumber,
            wonAmount,
            newBalance: this.balance + wonAmount
        }
    }

    spin() {
        this.overlay.classList.add('spinning');
        this.overlay.style.opacity = '1';
        // After API has been called, you can display the spin animation and set `winningNumber` to the winning number
        const { winningNumber, wonAmount, newBalance } = this.requestSpin(this.getAllBetButtons())
        const betNumber = this.getBetNumber(winningNumber);
        let color;
        if(betNumber.color === 'g') {
            color = 'green';
        } else if(betNumber.color === 'r') {
            color = 'var(--red)';
        } else {
            color = 'black';
        }
        // this.balance -= this.getTotalBet();
        // this.renderBalance();
        
        this.winMessageAmount.innerHTML = numToCurrency(wonAmount);
        this.wheel.spin(winningNumber, color);
        const WIN_MESSAGE_TIME = 2000;
        setTimeout(() => {
            if(wonAmount > 0) {
                this.winMessage.style.opacity = '1';
            }
        }, TOTAL_WHEEL_ANIMATION_TIME - WINNING_NUMBER_ANIMATION_TIME - 500);
        setTimeout(() => {
            // this.overlay.style.opacity = '0';
            if(wonAmount <= 0) {
                this.wheel.container.style.opacity = '0';
            }
            this.latestBet = this.betHistory.history[this.betHistory.history.length - 1];
            this.clearBets();
            this.winningNumberHistory.push(winningNumber);
            this.setBalance(newBalance);
            this.renderBalance();
            this.renderBetTotal();
            if(wonAmount > 0) {
                this.overlay.style.opacity = '0';
                this.winMessage.style.opacity = '0';
                setTimeout(() => {
                    setTimeout(() => {
                        this.overlay.classList.remove('spinning');
                        this.wheel.container.style.opacity = '1';
                    }, 2000);
                }, WINNING_NUMBER_ANIMATION_TIME);
            } else {
                this.overlay.style.opacity = '0';
                this.wheel.container.style.opacity = '1';
                this.overlay.classList.remove('spinning');
            }

            this.events.callEvent('afterSpin');
            // this.renderWinningNumbers();
        }, TOTAL_WHEEL_ANIMATION_TIME - 1000);
    }

    /**
     * 
     * @param { BetNumber } winningNumber 
     * @param { RouletteBetButton[] } bets 
     */
    calculateWonAmount(winningNumber, bets) {
        const wonBets = bets.filter(bet => bet.numbers.includes(winningNumber)).map(bet => { console.log('multiplier:', bet.multiplier); return bet.getTotalBetAmount() * bet.multiplier});
        return wonBets.length ? wonBets.reduce((prev, curr) => prev + curr) : 0;
    }

    doubleAmounts() {
        if(this.getTotalBet() * 2 > this.balance) {
            return;
        }
        this.getAllBetButtons().forEach(button => {
            button.addBet(button.getTotalBetAmount());
        })
        this.betHistory.push(
            this.getAllBetButtons().map(button => button.getHistoryData())
        )
    }

    setDefaultBalance(balance) {
        this.defaultBalance = balance;
    }

    makeAllChipButtonsInactive() {
        this.chipButtons.forEach(button => {
            button.setInactive();
        })
    }

    clearBets() {
        this.getAllBetButtons().forEach((button) => {
            button.clearBet();
        })
        this.betHistory.push(this.getAllBetButtons().map(button => button.getHistoryData()));
        this.renderBalance();
        this.renderBetTotal();
    }
}

export { Roulette }