import { RouletteBetButton } from './RouletteBetButton.js';

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

    getPrevItem() {
        return this.history[this.history.length - 2];
    }

    clear() {
        this.history = [];
    }
}

export { BetHistory }