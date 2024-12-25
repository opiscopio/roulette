class Player {
    name;
    balance;
    betCount;

    constructor(name, balance) {
        this.name = name;
        this.balance = balance;
        this.betCount = 0;
    }

    setBetCount(betCount) {
        this.betCount = betCount;
    }

    toSocketData() {
        return {
            name: this.name,
            balance: this.balance,
            betCount: this.betCount
        }
    }
}

export { Player };