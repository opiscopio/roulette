class BetNumber {
    color;
    number;

    constructor(color, number) {
        this.color = color;
        this.number = number;
    }
}

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

    rotation;

    constructor(numbers, label, rotation) {
        if(label || rotation) {
            this.rotation = rotation;
            this.button = document.createElement('button');
            this.button.innerHTML = label;
            this.button.style.transform = 'rotate(' + rotation + 'deg)';
        }
        this.numbers = numbers;
        this.chipElement = document.createElement('div');
        this.chipElement.style.borderRadius = '100px';
        this.chipElement.style.transform = 'translate(-50%, -50%)';
        this.chipElement.style.opacity = '100%';
        this.chipElement.style.display = 'flex';
        this.chipElement.style.alignItems = 'center';
        this.chipElement.style.justifyContent = 'center';
        this.chipElement.classList.add('chip');
    }

    addBet(amount) {
        console.log('adding bet')
        if(this.bets.filter(bet => bet === amount).length >= 10) {
            return;
        }
        this.bets.push(amount);
        this.renderChip();
    }

    renderChip() {
        if(this.bets.length > 0) {
            this.chipElement.style.display = 'flex';
            this.chipElement.style.position = 'absolute';
            this.chipElement.innerHTML = this.bets.reduce((prev, curr) => prev + curr).toString();
            const buttonPosition = this.button.getBoundingClientRect();
            this.chipElement.style.left = buttonPosition.x + 
                (this.rotation ? this.button.clientHeight : this.button.clientWidth) / 
                2 + 1 + 'px'; 
            this.chipElement.style.top = buttonPosition.y + 
                (this.rotation ? this.button.clientWidth : this.button.clientHeight) / 
                2 + 1 + 'px';
            this.chipElement.style.backgroundColor = 'green';
            this.chipElement.style.borderColor = 'white';
            this.chipElement.style.borderWidth = '4px';
            this.chipElement.style.borderStyle = 'dashed';
            this.chipElement.style.width = '48px';
            this.chipElement.style.height = '48px';
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

    constructor(imageURL) {
        this.button = document.createElement('button');
        const image = document.createElement('img');
        image.src = imageURL;
        image.width = 48;
        image.height = 48;
        this.button.append(image);
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
                button = new RouletteBetButton();
            }
            // If selected is top or bottom row edges
            else if(x === tableSizeX - 1 || x === 0) {
                // If y is even, select one row
                if(isEven(y + 1)) {
                    button = new RouletteBetButton(betNumbersArr[(y + 1) / 2]);
                } else { // Otherwise select 2 rows
                    // The corresponding positions of the table buttons
                    const yPosition1 = (y / 2) - 1;
                    const yPosition2 = (y / 2);
                    button = new RouletteBetButton(
                        betNumbersArr[yPosition1].concat(betNumbersArr[yPosition2])
                    );
                }
            // Middle of row
            } else if (isEven(y + 1)) {
                if(isEven(x + 1)) {
                    // Single number button
                    const xPosition = (x + 1) / 2 - 1;
                    const yPosition = (y + 1) / 2 - 1;
                    // console.log(yPosition);
                    button = new RouletteBetButton([
                        betNumbersArr[yPosition][xPosition]
                    ]);
                }
                const xPosition1 = (x / 2) + 1
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
    const y = tableHeight / (buttonArraySizeX - 1) * buttonArrayX + tableY;
    // console.log(x, y);
    return {
        x,
        y
    }
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
    zeroButton = new RouletteBetButton([0], '0');

    balanceElement = document.createElement('span');
    totalBetElement = document.createElement('span');

    /**
     * @type { ChipButton[] }
     */
    chipButtons = [];

    clearBetButton = new Button('./res/ButtonClear.svg');
    undoButton = new Button('./res/ButtonUndo.svg');
    restoreButton = new Button('./res/ButtonRepeat.svg');
    doubleButton = new Button('./res/ButtonDouble.svg');
    spinButton = new Button('./res/ButtonSpin.svg');

    betHistory = new BetHistory();

    /**
     * @type { BetHistoryItem[] }
     */
    latestBet = [];

    /**
     * @type { number }
     * Currently selected bet amount
     */
    betAmount = 50;
    /**
     * 
     * @param { HTMLElement } gameContainer 
     */
    constructor(gameContainer) {

        const container = /** @type { HTMLElement } */ (gameContainer.querySelector('#game'));

        const dynamicContainer = /** @type { HTMLElement } */ (gameContainer.querySelector('#dynamic'));

        // Header
        const headerElement = document.createElement('div');
        headerElement.classList.add('header');
        
        const balanceElements = this.createNumberIndicatorElement('Balance');
        const totalElements = this.createNumberIndicatorElement('Total');

        balanceElements.indicator.innerHTML = '$ 0,00';
        totalElements.indicator.innerHTML = '$ 0,00';

        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('header');
        controlsContainer.style.width = 'fit-content';

        controlsContainer.append(this.clearBetButton.button);
        controlsContainer.append(this.undoButton.button);
        controlsContainer.append(this.restoreButton.button);
        controlsContainer.append(this.doubleButton.button);
        controlsContainer.append(this.spinButton.button);

        headerElement.append(balanceElements.container, controlsContainer, totalElements.container);

        container.append(headerElement);

        const chipButtonsContainer = document.createElement('div');
        chipButtonsContainer.classList.add('chip-buttons');

        this.chipButtons = [
            new ChipButton(50, './res/ChipBlueLight.svg'),
            new ChipButton(100, './res/ChipGreen.svg'),
            new ChipButton(200, './res/ChipRed.svg'),
            new ChipButton(500, './res/ChipBlueDark.svg'),
            new ChipButton(1000, './res/ChipOrange.svg')
        ]

        this.chipButtons.forEach(button => {
            chipButtonsContainer.append(button.button);
        })

        this.chipButtons[0].setActive();

        container.append(chipButtonsContainer);

        const tableSizeX = 3;
        const tableSizeY = 12;
        const betNumbers = createBetNumbers(tableColors, 3, 12);
        const baseTableButtons = createBetNumberButtonsForBaseTable(betNumbers, 3, 12);
        this.baseTableButtons = baseTableButtons;
        const table = document.createElement('table');

        /**
         * @type { HTMLTableRowElement[] }
         */
        const rows = [];

        for(let i = 0; i < tableSizeX; i++) {
            rows.push(document.createElement('tr'));
        }

        this.twoToOneButtons = [
            new RouletteBetButton([], '2:1', -90),
            new RouletteBetButton([], '2:1', -90),
            new RouletteBetButton([], '2:1', -90)
        ];

        // Create a HTML table for the numbers
        for(let y = 0; y < tableSizeY + 1; y++) {
            for(let x = 0; x < tableSizeX; x++) {
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
            new RouletteBetButton([], '1ra 12'),
            new RouletteBetButton([], '2da 12'),
            new RouletteBetButton([], '3ra 12')
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
            new RouletteBetButton([], '1 - 18'),
            new RouletteBetButton([], 'PAR'),
            new RouletteBetButton([], 'red'),
            new RouletteBetButton([], 'black'),
            new RouletteBetButton([], 'IMPAR'),
            new RouletteBetButton([], '19 - 36')
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
        const bottomRows = table.querySelectorAll('tr:nth-child(n+4)');
        const bottomRowsHeight = Array.from(bottomRows).map(row => row.clientHeight).reduce((prev, curr) => prev + curr);
        zeroButtonImage.style.height = table.clientHeight - bottomRowsHeight + 'px';
        console.log('table width: ', table.clientWidth);
        zeroButtonContainer.style.right = (table.getBoundingClientRect().left + table.clientWidth) - 2 + 'px';
        zeroButtonContainer.style.top = table.getBoundingClientRect().top + 'px';
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
            for(let x = 0; x < buttonElementsArraySize.x; x++) {
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


        this.addEventListeners();
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

    addEventListeners() {
        this.getAllBetButtons().forEach(button => {
            button.button.addEventListener('click', () => {
                button.addBet(this.betAmount);
                this.betHistory.push(
                    this.getAllBetButtons().map(button => button.getHistoryData())
                )
            })
        })

        this.chipButtons.forEach((button) => {
            button.onClick = (amount) => {
                this.setBetAmount(amount);
                this.makeAllChipButtonsInactive();
                button.setActive();
            }
        })

        
        this.clearBetButton.button.addEventListener('click', () => {
            this.clearBets();
            this.betHistory.push([]);
        })

        this.undoButton.button.addEventListener('click', () => {
            this.betHistory.undo();
        })

        this.doubleButton.button.addEventListener('click', () => {
            this.doubleAmounts();
        })
    }

    setBetAmount(amount) {
        this.betAmount = amount;
    }

    doubleAmounts() {
        this.getAllBetButtons().forEach(button => {
            if(button.bets.length) {
                button.bets.forEach(bet => {
                    button.addBet(bet);
                })
            }
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
    }
}

const element = /** @type { HTMLElement } */ (document.getElementById('game-container'));

const game = new Roulette(element);