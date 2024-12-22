/**
 * Roulette game
 * 
 * To add logic to when the spin button is pressed, see the .spin() method of the Roulette class
 */

const SERVER_URL = 'htpp://localhost:2000';

class BetNumber {
    color;
    number;

    constructor(color, number) {
        this.color = color;
        this.number = number;
    }
}

const nearestLowerNumberTo = (n, nums) => {
    return nums.filter(num => num <= n).reduce((prev, curr) => prev < curr ? curr : prev);
}

const sound = {
    chip: './res/sound/chip.mp3',
    button: './res/sound/button.mp3'
}

let soundOn = true;

const playAudio = (filename) => {
    if(!soundOn) return;
    new Audio(filename).play()
};


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

class ChipButton {

    amount;

    onClick;

    button;

    constructor(amount, imageURL) {
        const SIZE_PX = 104;
        const button = document.createElement('button');
        button.classList.add('chip-button');
        button.style.width = SIZE_PX + 'px';
        button.style.height = SIZE_PX + 'px';
        if(imageURL) {
            const img = document.createElement('img');
            img.src = imageURL;
            img.width = SIZE_PX;
            img.height = SIZE_PX;
            img.style.position = 'absolute';
            img.style.top = '0px';
            img.style.left = '0px';
            const label = document.createElement('span');
            label.classList.add('chip-number');
            label.innerHTML = amount;
            button.append(img);
            button.append(label);
        } else {
            button.style.borderRadius = '100px';
            button.style.background = 'green';
            button.style.border = '6px dashed white';
            button.style.width = '104px';
            button.style.height = '104px';
            button.style.fontSize = '2rem';
            button.innerHTML = amount;
        }
        button.addEventListener('click', () => {
            if(this.onClick) {
                this.onClick(amount);
            }
        })

        this.button = button;
    }

    setActive() {
        this.button.classList.add('active-chip');
    }

    setInactive() {
        this.button.classList.remove('active-chip');
    }
}

class Button {

    button;

    constructor(imageURL, size = 48, label) {
        this.button = document.createElement('button');
        this.button.style.display = 'flex';
        this.button.style.flexDirection = 'column';
        this.button.style.alignItems = 'center';
        this.button.style.gap = '4px';
        const image = document.createElement('img');
        image.src = imageURL;
        image.width = size;
        image.height = size;

        this.button.append(image);

        if(label) {
            const labelElement = document.createElement('span');
            labelElement.innerHTML = label;
            labelElement.style.fontWeight = 'medium';
    
            this.button.append(labelElement);
        }


    }
}

const getNearestUpperBetAmountTo = (num) => {
    if (num >= 1000) {
        return 1000;
    } else if (num >= 500) {
        return 1000;
    } else if (num >= 200) {
        return 500;
    } else if (num >= 100) {
        return 200;
    } else if (num >= 50) {
        return 100;
    } else {
        return 50;
    }
}

class ToggleButton {

    button = document.createElement('button');
    image = document.createElement('img');
    toggled = false;

    toggledImage;
    untoggledImage;

    /**
     * @type { ((toggled: boolean) => void) | undefined }
     */
    onToggle;

    constructor(untoggledImageURL, toggledImageURL, size) {
        this.toggledImage = toggledImageURL;
        this.untoggledImage = untoggledImageURL;

        this.button.append(this.image);
        this.button.style.width = size;
        this.button.style.height = size;

        this.button.addEventListener('click', () => {
            this.toggle();
        })

        this.render();
    }

    render() {
        if(this.toggled) {
            this.image.src = this.toggledImage;
        } else {
            this.image.src = this.untoggledImage;
        }
    }

    toggle(){
        this.toggled = !this.toggled;
        if(this.onToggle) {
            this.onToggle(this.toggled);
        }
        this.render();
    }
}

/**
 * Mapping of numbers to their corresponding positions on the roulette
 * index = position
 * value = number. for number 32, position will be 0, for 19 - 1, etc
 */
const wheelNumMap = [
    0,
    32,
    15,
    19,
    4,
    21,
    2,
    25,
    17,
    34,
    6,
    27,
    13,
    36,
    11,
    30,
    8,
    23,
    10,
    5,
    24,
    16,
    33,
    1,
    20,
    14,
    31,
    9,
    22,
    18,
    29,
    7,
    28,
    12,
    35,
    3,
    26
];

const randNum = (max) => {
    return Math.floor(Math.random() * max);
}
const WHEEL_ANIMATION_TIME = 5000;
const WINNING_NUMBER_ANIMATION_TIME = 2000;
const TOTAL_WHEEL_ANIMATION_TIME = WHEEL_ANIMATION_TIME + WINNING_NUMBER_ANIMATION_TIME;

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
        console.log(position)
        console.log(wheelNumMap.length)
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

/**
 * Pattern of half of the table
 */
const colorPatternHalf = [
    ['r', 'b', 'r'],
    ['b', 'r', 'b'],
    ['r', 'b', 'r'],
    ['b', 'b', 'r'],
    ['b', 'r', 'b'],
    ['r', 'b', 'r'] 
]

/* Colors of the table buttons. Table is oriented in such a way that the position [0][0] holds the number 1*/
const tableColors = colorPatternHalf.concat(colorPatternHalf);

const createBetNumbers = (colorPattern, sizeX, sizeY) => {
    /**
     * @type { BetNumber[][] }
     */
    const betNumberArr = [];
    for(let y = 0; y < sizeY; y++) {
        betNumberArr.push([]);
        for(let x = 0; x < sizeX; x++) {
            const color = tableColors[y][x];
            const number = (y * sizeX + x) + 1;
            const betNumber = new BetNumber(color, number);
            betNumberArr[y].push(betNumber);
        }
    }
    return betNumberArr;
}

const isEven = (n) => {
    return n % 2 == 0;
}

const getButtonsArraySize = (numbersArrayX, numberArrayY) => {
    const x = numbersArrayX * 2 + 1;
    const y = numberArrayY * 2;
    return {
        x,
        y
    }
}

/**
 * @typedef { Object } BetHistoryItem
 * @property { RouletteBetButton } button
 * @property { number } amount
 */

class BetHistory {
    /**
     * @type { BetHistoryItem[][] }
     */
    history = [];
    constructor() {

    }

    push(items) {
        this.history.push(items);
    }

    undo() {
        if(!this.history.length) {
            return;
        }
        let latestItem = [];
        if(this.history.length === 1) {
            latestItem = /** @type {any[]} */ (this.history.pop());
            latestItem.forEach(item => {
                item.button.setBet(0);
            })
        } else {
            this.history.pop();
            latestItem = this.history[this.history.length - 1];
            console.log(latestItem);
            BetHistory.restoreToItem(latestItem);
        }
    }

    /**
     * 
     * @param { BetHistoryItem[] } items
     */
    static restoreToItem(items) {
        items?.forEach(item => {
            item.button.setBet(item.amount);
        })
    }

    clear() {
        this.history = [];
    }
}

const zeroNumber = new BetNumber('g', 0);


/**
 * Create the array of bet buttons for base table (the reds and blacks, and the ones in between them)
 * 
 * @param { BetNumber[][] } betNumbersArr 
 * @param { number } sizeX 
 * @param { number } sizeY 
 * @returns 
 */
const createBetNumberButtonsForBaseTable = (betNumbersArr, sizeX, sizeY) => {
    const tableSize = getButtonsArraySize(sizeX, sizeY);
    const tableSizeX = tableSize.x;
    const tableSizeY = tableSize.y;
    /**
     * @type { RouletteBetButton[][] }
     */
    let betNumberButtonsArr = [];
    for(let y = 0; y < tableSizeY; y++) {
        betNumberButtonsArr.push([]);
        for(let x = 0; x < tableSizeX; x++) {
            let button;
            if(y === 0) {
                if(x === 2 || x === 4) {
                    const xPosition1 = x / 2 - 1;
                    const xPosition2 = xPosition1 + 1;
                    button = new RouletteBetButton([
                            zeroNumber,
                            betNumbersArr[0][xPosition1],
                            betNumbersArr[0][xPosition2],
                        ],
                        undefined,
                        undefined,
                        12
                    )
                } else if(isEven(x + 1)) {
                    button = new RouletteBetButton([
                        zeroNumber,
                        betNumbersArr[0][(x + 1) / 2 - 1],
                    ],
                        undefined,
                        undefined,
                        18
                    )
                } else {
                    const xPosition1 = x === 0  ? 0 : (x / 2) - 1;
                    button = new RouletteBetButton([
                        zeroNumber,
                        ...betNumbersArr[0],
                    ],
                    undefined,
                    undefined,
                    6
                    )
                }
            }
            // If selected is top or bottom row edges
            else if(x === tableSizeX - 1 || x === 0) {
                // If y is even, select one row
                if(isEven(y + 1)) {
                    button = new RouletteBetButton(betNumbersArr[(y + 1) / 2 - 1], undefined, undefined, 12);
                } else { // Otherwise select 2 rows
                    // The corresponding positions of the table buttons
                    const yPosition1 = (y / 2) - 1;
                    const yPosition2 = (y / 2);
                    button = new RouletteBetButton(
                        betNumbersArr[yPosition1].concat(betNumbersArr[yPosition2]),
                        undefined,
                        undefined,
                        6
                    );
                }
            // Middle of row
            } else if (isEven(y + 1)) {
                if(isEven(x + 1)) {
                    // Single number button
                    const xPosition = (x + 1) / 2 - 1;
                    const yPosition = (y + 1) / 2 - 1;
                    console.log('single: ', xPosition, betNumberButtonsArr[yPosition][xPosition]);
                    // console.log(yPosition, xPosition);
                    // console.log(yPosition);
                    button = new RouletteBetButton([
                        betNumbersArr[yPosition][xPosition],
                    ], 
                    undefined,
                    undefined,
                    36);
                } else {
                    const xPosition1 = x / 2 - 1;
                    const xPosition2 = xPosition1 + 1;
                    const yPosition = (y + 1) / 2 - 1;
                    console.log('y, x', yPosition, xPosition1);
                    button = new RouletteBetButton([
                        betNumbersArr[yPosition][xPosition1],
                        betNumbersArr[yPosition][xPosition2]
                    ],
                        undefined,
                        undefined,
                        18
                    )
                }
                const xPosition1 = (x / 2) + 1
            } else {
                if(isEven(x + 1)) {
                    // Horizontal double
                    const xPosition = (((x + 1) / 2) - 1);
                    console.log('xpos: ', xPosition);
                    const yPosition1 = (y / 2) - 1;
                    const yPosition2 = yPosition1 + 1;
                    button = new RouletteBetButton([
                        betNumbersArr[yPosition1][xPosition],
                        betNumbersArr[yPosition2]?.[xPosition]
                    ],
                        undefined,
                        undefined,
                        18
                    )
                } // + intersection
                else {
                    const xPosition1 = (x / 2);
                    const xPosition2 = xPosition1 - 1;
                    console.log(x);
                    const yPosition1 = (y / 2) - 1;
                    const yPosition2 = yPosition1 + 1;
                    button = new RouletteBetButton([
                        betNumbersArr[yPosition1][xPosition1],
                        betNumbersArr[yPosition2][xPosition1],
                        betNumbersArr[yPosition1][xPosition2],
                        betNumbersArr[yPosition2][xPosition2]
                    ],
                        undefined,
                        undefined,
                    9
                    );
                    console.log(button.numbers);
                }
            }

            if(!button) {
                betNumberButtonsArr[y].push(new RouletteBetButton())
            } else {
                betNumberButtonsArr[y].push(button)
            }
        }
    }
    return betNumberButtonsArr;
}

/**
 * @param { HTMLTableElement } table - Table element
 * @param { number } buttonArrayX - x position of the button in the buttons array
 * @param { number } buttonArraySizeX - x size of the buttons array
 */
const getTableButtonPosition = (table, buttonArrayX, buttonArrayY, buttonArraySizeX, buttonArraySizeY) => {
    const sideButton = /** @type { HTMLElement } */ (table.querySelector('.side'));
    // Calculate height of the bottom buttons area
    const bottomButtons = document.querySelectorAll('table tr:nth-child(n+4)');
    console.log(bottomButtons);
    const bottomHeight = Array.from(bottomButtons).map(item => item.clientHeight).reduce((prevVal, currVal) => prevVal + currVal);
    console.log(bottomHeight);
    // Calculate the table width without the side/bottom areas
    const tableWidth = table.clientWidth - sideButton.clientWidth;
    const tableHeight = table.clientHeight - bottomHeight;
    const tableX = table.getBoundingClientRect().x;
    const tableY = table.getBoundingClientRect().y;
    // console.log(table);
    // console.log(tableX);
    // console.log(tableY);
    // console.log(tableHeight);
    // console.log(tableWidth);
    console.log(buttonArraySizeX);
    const x = tableWidth / (buttonArraySizeY) * buttonArrayY + tableX;
    const y = tableHeight - tableHeight / (buttonArraySizeX - 1) * buttonArrayX + tableY;
    // console.log(x, y);
    return {
        x,
        y
    }
}

/**
 * 
 * @param { number } num 
 * @returns { string }
 */
const numToCurrency = (num) => {
    const strArr = Array.from(num.toString());
    // if(strArr.length < 2) {
    //     strArr.unshift('0', ',', '0');
    // } else if(strArr.length < 3) {
    //     strArr.unshift('0', ',');
    // } else {
    //     strArr.splice(-2, 0, ',');
    // }
    return '$ ' + strArr.join('');
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

    mode;

    socket;

    /**
     * 
     * @param { HTMLElement } gameContainer 
     */
    constructor(gameContainer, mode = 'single') {
        this.mode = mode;
        if(mode === 'tournament') {
            this.socket = io();
        }
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
        controlsContainer.classList.add('header');
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

        if(mode === 'single') {
            this.chipButtons = [
                new ChipButton(50, './res/ChipBlueLight.svg'),
                new ChipButton(100, './res/ChipGreen.svg'),
                new ChipButton(200, './res/ChipRed.svg'),
                new ChipButton(500, './res/ChipBlueDark.svg'),
                new ChipButton(1000, './res/ChipOrange.svg')
            ]
        } else {
            this.chipButtons = [
                new ChipButton(100, './res/ChipGreen.svg')
            ]            
        }

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

    /**
     * Reset the game
     */
    restart() {
        if(this.mode === 'tournament') {

        }
        this.clearBets();
        this.balance = this.defaultBalance;
        this.renderBalance();
        // setTimeout(() => {
            this.renderTable();
        // }, 2000);
    }

    renderTable() {


        const zeroButtonContainer = /** @type{ HTMLElement } */ (this.zeroButton.button.parentElement);
        const zeroButtonImage = zeroButtonContainer.querySelector('img')

        const table = this.table;

        console.log(table);
        console.log(zeroButtonContainer);
        console.log(zeroButtonImage);

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
        console.log('row: ', betNumbers);
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
            soundOn = !soundOn;
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

    spin() {
        this.overlay.classList.add('spinning');
        this.overlay.style.opacity = '1';
        // After API has been called, you can display the spin animation and set `winningNumber` to the winning number
        const winningNumber = randNum(36);
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
        // Win amount with initial bet
        const wonAmountTotal = this.calculateWonAmount(betNumber, this.getAllBetButtons());
        // Win amount without initial bet
        const wonAmount = wonAmountTotal - this.getTotalBet();
        console.log(wonAmount);
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
            this.balance += wonAmount;
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