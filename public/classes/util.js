import { BetNumber } from './BetNumber.js';
import { tableColors, zeroNumber } from './constants.js';
import { RouletteBetButton } from './RouletteBetButton.js';
import state from './state.js';

/**
 * 
 * @param { number } num 
 * @returns { string }
 */
export const numToCurrency = (num) => {
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

/**
 * @param { HTMLTableElement } table - Table element
 * @param { number } buttonArrayX - x position of the button in the buttons array
 * @param { number } buttonArraySizeX - x size of the buttons array
 */
export const getTableButtonPosition = (table, buttonArrayX, buttonArrayY, buttonArraySizeX, buttonArraySizeY) => {
    const sideButton = /** @type { HTMLElement } */ (table.querySelector('.side'));
    // Calculate height of the bottom buttons area
    const bottomButtons = document.querySelectorAll('table tr:nth-child(n+4)');
    const bottomHeight = Array.from(bottomButtons).map(item => item.clientHeight).reduce((prevVal, currVal) => prevVal + currVal);
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
    const x = tableWidth / (buttonArraySizeY) * buttonArrayY + tableX;
    const y = tableHeight - tableHeight / (buttonArraySizeX - 1) * buttonArrayX + tableY;
    // console.log(x, y);
    return {
        x,
        y
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
export const createBetNumberButtonsForBaseTable = (betNumbersArr, sizeX, sizeY) => {
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

export const createBetNumbers = (colorPattern, sizeX, sizeY) => {
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

export const isEven = (n) => {
    return n % 2 == 0;
}

export const getButtonsArraySize = (numbersArrayX, numberArrayY) => {
    const x = numbersArrayX * 2 + 1;
    const y = numberArrayY * 2;
    return {
        x,
        y
    }
}

export const randNum = (max) => {
    return Math.floor(Math.random() * max);
}

export const playAudio = (filename) => {
    if(!state.soundOn) return;
    new Audio(filename).play()
};


export const getNearestUpperBetAmountTo = (num) => {
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

export const nearestLowerNumberTo = (n, nums) => {
    return nums.filter(num => num <= n).reduce((prev, curr) => prev < curr ? curr : prev);
}