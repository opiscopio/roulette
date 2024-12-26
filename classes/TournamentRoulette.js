import { ChipButton } from './ChipButton.js';
import { RouletteSocketConnection } from './Connection.js';
import { LoadingScreen } from './LoadingScreen.js';
import { Player } from './Player.js';
import { Roulette } from './Roulette.js';
import { numToCurrency } from './util.js';

const connection = new RouletteSocketConnection();

export class TournamentRoulette extends Roulette {

    scoreboard = document.createElement('ul');
    betCountElement = document.createElement('span');
    maxBets = 5;
    gameOverMessageElement = document.createElement('div');

    onConnect;

    /**
     * @type { LoadingScreen }
     */
    loadingScreen;

    constructor(gameContainer, musicPlayer, onConnect, loadingScreen) {
        super(gameContainer, musicPlayer, {
            chipButtons: [new ChipButton(100, './res/ChipGreen.svg')]
        });
        
        gameContainer.style.display = 'none';
        this.loadingScreen = loadingScreen;
        this.onConnect = onConnect;
        this.initBetCount();
        this.initScoreboard();
        this.initGameOverMessageElement();
    }

    emitPlayerData() {
        console.log('emitting');
        // const data = {
        //     name: this.player.name,
        //     balance: this.balance,
        //     betCount: this.player.betCount
        // }
        // console.log('emitting', data);
        connection.emitPlayerDataEvent();
        this.renderPlayers();
        // this.socket.emit('t-user-update', JSON.stringify(data));
    }

    restart() {
        this.hideGameOverMessageElement();
        connection.emitJoinEvent().then(async () => {
            console.log('emitting join event: ', connection.player);
            this.setDefaultBalance(connection.player.balance);
            this.renderPlayerBetCount(connection.player.betCount);
            this.renderPlayers();
            await this.loadingScreen.setLoadedAmount(1);
            this.loadingScreen.hide();
            this.container.style.display = 'flex';
            super.restart();

        });
    }

    /**
     * Log in the player and make roulette data match the player's data
     * @param {*} player 
     */
    async login(player) {
        this.container.style.display = 'none';
        this.loadingScreen.setLoadedAmount(0);
        await this.loadingScreen.show();
        this.loadingScreen.setLoadedAmount(0.2);
        return new Promise((resolve, reject) => {
            connection.init(this.onConnect);
            connection.emitLoginEvent(player).then(async (player) => {
                await this.loadingScreen.setLoadedAmount(0.5);
                this.setBalance(player.balance);
                resolve(true);
            }).catch(() => {
                reject(false);
            });//this.socket.emit('login', JSON.stringify(this.player.toSocketData()));
        })
    }

    getBetCountStr(betCount) {
        return betCount + '/' + this.maxBets;
    }

    renderPlayerBetCount(betCount) {
        this.betCountElement.innerHTML = this.getBetCountStr(betCount);
    }

    incrementPlayerBetCount() {
        console.log('incrementing');
        connection.player.betCount++;
        this.renderPlayerBetCount(connection.player.betCount);
    }

    // emitJoinEvent() {
    //     this.socket.
    // }

    onPlayerJoin(msg) {
        console.log('player joined');
        const data = JSON.parse(msg);
        console.log(data);
        this.addPlayer(new Player(
            data.name,
            data.balance
        ))
        this.renderPlayers();
    }

    onPlayerUpdate(msg) {
        console.log('player updated');
        const data = JSON.parse(msg);
        const player = connection.players.find(player => player.name === data.name);
        player.balance = data.balance;
        player.betCount = data.betCount;
        player.name = data.name;
        this.renderPlayers();
        // this.renderPlayerBetCount(player.betCount);
    }

    onGameOver(msg) {
        const players = JSON.parse(msg);
        console.log(players);
        const winner = players.reduce((a, b) => a.balance > b.balance ? a : b);
        this.displayGameOverMessageElement(winner);
    }

    addPlayer(player) {
        connection.players.push(player);
    }

    setCurrentPlayer(player) {
        this.player = player;
    }
    
    initScoreboard() {
        this.scoreboard.classList.add('scoreboard');
        this.container.append(this.scoreboard);
    }

    initBetCount() {
        this.betCountElement.classList.add('bet-count');
        const buttonsHeaderElement = this.container.querySelector('.header .header');
        buttonsHeaderElement?.append(this.betCountElement);
    }

    initGameOverMessageElement() {
        this.gameOverMessageElement.classList.add('game-over-message');
        const leaveButton = document.createElement('button');
        this.gameOverMessageElement.append(leaveButton);
        this.container.append(this.gameOverMessageElement);
    }

    displayGameOverMessageElement(player) {
        this.gameOverMessageElement.innerHTML = player.name + ' won';
        this.gameOverMessageElement.style.opacity = '0';
        this.gameOverMessageElement.style.display = 'flex';
        setTimeout(() => {
            this.gameOverMessageElement.style.opacity = '1';
        }, 50);
    }

    hideGameOverMessageElement() {
        this.gameOverMessageElement.style.display = 'none';
    }

    getPlayerListItem(player) {
        console.log('rendering player: ', player);
        const listItem = document.createElement('li');
        const name = document.createElement('div');
        name.classList.add('name');
        const balance = document.createElement('div');
        balance.classList.add('balance');
        name.innerHTML = player.name;
        balance.innerHTML = numToCurrency(player.balance);
        listItem.append(name);
        listItem.append(balance);
        return listItem;
    }

    renderPlayers() {
        this.scoreboard.innerHTML = '';
        // this.scoreboard.append(this.getPlayerListItem(this.player));
        connection.players.forEach((player, index) => {
            this.scoreboard.append(this.getPlayerListItem(player));
            if(index < connection.players.length - 1) {
                const divider = document.createElement('div');
                divider.classList.add('divider');
                this.scoreboard.append(divider);
            }
        })
    }
    
    addEventListeners() {
        // Add custom event so main.js can listen for when leaving game
        this.events['leave'] = {};
        connection.onPlayerJoin(this.onPlayerJoin.bind(this));
        connection.onPlayerUpdate(this.onPlayerUpdate.bind(this));
        connection.onGameOver(this.onGameOver.bind(this));
        this.events.on('afterSpin', this.incrementPlayerBetCount.bind(this));
        this.events.on('afterSpin', this.emitPlayerData.bind(this));
        super.addEventListeners();
    }

    setBalance(balance) {
        super.setBalance(balance);
        console.log('setting balance');
        connection.player.balance = balance;
    }
}