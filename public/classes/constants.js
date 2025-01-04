import { BetNumber } from './BetNumber.js';

/**
 * Pattern of half of the table
 */
export const colorPatternHalf = [
    ['r', 'b', 'r'],
    ['b', 'r', 'b'],
    ['r', 'b', 'r'],
    ['b', 'b', 'r'],
    ['b', 'r', 'b'],
    ['r', 'b', 'r'] 
]

/* Colors of the table buttons. Table is oriented in such a way that the position [0][0] holds the number 1*/
export const tableColors = colorPatternHalf.concat(colorPatternHalf);

/* Animation times */
export const WHEEL_ANIMATION_TIME = 5000;
export const WINNING_NUMBER_ANIMATION_TIME = 2000;
export const TOTAL_WHEEL_ANIMATION_TIME = WHEEL_ANIMATION_TIME + WINNING_NUMBER_ANIMATION_TIME;

/* Buttons */
export const zeroNumber = new BetNumber('g', 0);

/**
 * Mapping of numbers to their corresponding positions on the roulette
 * index = position
 * value = number. for number 32, position will be 0, for 19 - 1, etc
 */
export const wheelNumMap = [
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