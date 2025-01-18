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
    maxBets = window.location.href.includes('localhost') ? 4 : 30;
    gameOverMessageElement = document.createElement('div');
    gameOverMessageContainer = document.createElement('div');
    gameOverMessage = document.createElement('span');
    subtitleElement = document.createElement('span');
    playAgainButton = document.createElement('button');

    singleWinnerSubtitle = 'Ha ganado el torneo';
    tieSubtitle = 'Han empatado';

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
        console.log('emitting join event: ', connection.player);
        connection.emitJoinEvent().then(async () => {
            this.enableBetButtons();
            this.setBalance(this.defaultBalance);
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
            console.log('logging in');
            connection.emitLoginEvent(player).then(async (player) => {
                console.log('emitted login event');
                await this.loadingScreen.setLoadedAmount(0.5);
                this.setBalance(player.balance);
                resolve(true);
            }).catch(() => {
                alert('An error occured while connecting');
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
        if(this.maxBetsReached()) {
            this.disableBetButtons();
        }
    }

    maxBetsReached() {
        return connection.player.betCount >= this.maxBets;
    }

    // emitJoinEvent() {
    //     this.socket.
    // }

    onPlayerJoin(data) {
        // console.log('player joined', msg);
        // const data = JSON.parse(msg);
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

    /**
     * Called when player leaves room
     * @param { string } msg player data 
     */
    onPlayerLeave(msg) {
        console.log('player left');
        const player = JSON.parse(msg);
        connection.players = connection.players.filter(p => p.name !== player.name);
        this.renderPlayers();
    }

    onGameOver(msg) {
        try {
            const players = JSON.parse(msg); // Parse the socket message containing player data
            connection.playersFromSocketData(players); // Update players from socket data
            this.renderPlayers(); // Render the updated players

            // Determine the highest balance
            const highestBalance = Math.max(...players.map(player => player.balance));

            // Find all players with the highest balance
            const winners = players.filter(player => player.balance === highestBalance);

            if (winners.length > 1) {
                // Handle tie case
                this.displayTieMessage(winners);
            } else {
                // Handle single winner case
                this.displayGameOverMessageElement(winners[0]);
            }
        } catch (error) {
            console.error("Error parsing game over message:", error); // Log any parsing errors
        }
    }

    // Display the tie message
    displayTieMessage(winners) {
        const winnerNames = winners.map(winner => winner.name).join(', ');
        this.gameOverMessage.innerHTML = winnerNames;
        this.subtitleElement.innerHTML = this.tieSubtitle;
        this.gameOverMessageContainer.style.display = 'flex';
        setTimeout(() => {
            this.gameOverMessageContainer.style.opacity = '1';
        }, 50);
    }

    addPlayer(player) {
        connection.players.push(player); // Add a new player to the connection's player list
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
        this.gameOverMessageContainer.append(this.gameOverMessageElement);
        this.gameOverMessageContainer.classList.add('game-over-message-container');
        const subtitleElement = document.createElement('span');
        subtitleElement.classList.add('subtitle');
        subtitleElement.innerHTML = this.singleWinnerSubtitle;
        this.subtitleElement = subtitleElement;
        this.gameOverMessage.classList.add('winner');
        this.gameOverMessageElement.append(this.gameOverMessage);
        this.gameOverMessageElement.append(subtitleElement);
        this.playAgainButton.innerHTML = 'NUEVO TORNEO';
        this.gameOverMessageContainer.append(this.playAgainButton);
        this.playAgainButton.classList.add('play-again-button');
        this.container.append(this.gameOverMessageContainer);
        this.playAgainButton.addEventListener('click', () => {
            this.loadingScreen.setLoadedAmount(0);
            this.container.style.display = 'none';
            this.loadingScreen.show();
            this.restart();
        })
    }

    disableBetButtons() {
        this.getAllBetButtons().forEach(button => {
            button.button.disabled = true;
        })
    }

    enableBetButtons() {
        this.getAllBetButtons().forEach(button => {
            button.button.disabled = false;
        })
    }

    displayGameOverMessageElement(player) {
        // this.gameOverMessageElement.innerHTML = player.name + ' won';
        this.gameOverMessage.innerHTML = player.name;
        this.gameOverMessageContainer.style.opacity = '0';
        this.gameOverMessageContainer.style.display = 'flex';
        setTimeout(() => {
            this.gameOverMessageContainer.style.opacity = '1';
        }, 50);
    }

    hideGameOverMessageElement() {
        this.gameOverMessageContainer.style.display = 'none';
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

    spin() {
        if(connection.player.betCount >= this.maxBets) {
            alert('Has alcanzado el límite de apuesta.');
            return;
        }
        super.spin();
    }
    
    addEventListeners() {
        // Add custom event so main.js can listen for when leaving game
        this.events.on('onLeave', () => {
            connection.emitLeaveEvent();
        });
        connection.onPlayerJoin(this.onPlayerJoin.bind(this));
        connection.onPlayerUpdate(this.onPlayerUpdate.bind(this));
        connection.onGameOver(this.onGameOver.bind(this));
        connection.onPlayerLeave(this.onPlayerLeave.bind(this));
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