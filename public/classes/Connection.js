import { Player } from './Player.js';

/**
 * @typedef { Object } PlayerData
 * @property { string } name
 * @property { number } balance
 * @property { number } betCount
 */

class RouletteConnection {

    player;
    players = [];
    events = {
        't-join': {},
        't-user-update': {},
        't-game-over': {},
        't-leave': {}
    };
    maxID = 0;

    constructor() {

    }

    /**
     * @abstract
     * @returns { Promise<void> }
     */
    emitJoinEvent() {
        throw new Error('Must me implemented');
    };

    /**
     * @abstract
     * 
     * @returns { boolean }
     */
    init() {
        throw new Error('Abstract method')
    }

    setPlayer(player) {
        this.player = player;
    }

    onPlayerJoin(callback) {
        return this.addEventListener('t-join', callback);
    }

    onPlayerUpdate(callback) {
        return this.addEventListener('t-user-update', callback);
    }

    onGameOver(callback) {
        return this.addEventListener('t-game-over', callback);
    }

    onPlayerLeave(callback) {
        return this.addEventListener('t-leave', callback);
    }

    addEventListener(event, callback) {
        const id = this.maxID++;
        this.events[event][id] = callback;
        return id;
    }

    callEvent(id, ...args) {
        console.log(id);
        console.log(this.events);
        Object.values(this.events[id]).forEach(cb => {
            cb(...args);
        })
    }

    /**
     * @abstract
     * 
     * @returns { Promise<boolean> }
     */
    emitLoginEvent(name) {
        throw new Error('To implement');
    }

    /**
     * @abstract
     * 
     * @returns { Promise<boolean> }
     */
    emitLeaveEvent() {
        throw new Error('Abstract method');
    }

    /**
     * @abstract
     * 
     * @param { PlayerData } data 
     * 
     * @returns { Promise<boolean> }
     */
    emitPlayerDataEvent(data) {
        throw new Error('Abstract method');
    }
}

const SERVER_URL = window.location.href.includes('localhost') ? 'http://localhost:2000' : 'https://roulette-ne-front.onrender.com/';

class RouletteSocketConnection extends RouletteConnection {

    /**
     * @type { SocketIOClient.Socket }
     */
    socket;

    eventNames = [
        't-join',
        't-user-update',
        't-game-over',
        't-leave'
    ]

    /**
     * Initialize socket connection
     */
    init(onConnect) {
        this.socket = io(SERVER_URL);
        if(this.socket.connected && onConnect) {
            onConnect();
        }
        this.socket.on('connect', () => {
            onConnect();
        })
        this.eventNames.forEach(name => {
            this.socket.on(name, this.socketListener(name));
        })
        return true;
    }

    socketListener(event) {
        return (...args) => this.callEvent(event, ...args);
    }

    emitJoinEvent() {
        return new Promise((resolve) => {
            console.log(this.player);
            this.socket.emit('t-join', JSON.stringify(this.player.toSocketData()), (res) => {
                // Data of all players in the newly joined room
                const data = JSON.parse(res);
                console.log('data: ', data);
                this.playersFromSocketData(data);
                resolve(data);
            });
        })
    }

    emitLeaveEvent() {
        console.log('emitting leave event');
        return new Promise((resolve) => {
            this.socket.emit('t-leave', JSON.stringify(this.player.toSocketData()));
            resolve(true);
        })
    }

    playersFromSocketData(data) {
        this.players = data.map(player => new Player(player.name, player.balance));
        this.player = this.players.find(_player => _player.name === this.player.name);
    }

    async emitLoginEvent(player) {
        return new Promise(((resolve) => {
            const data = player.toSocketData();
            console.log('emitting login: ', data);
            this.socket.emit('login', JSON.stringify(data), (msg) => {
                console.log('emitted login: ', msg);
                const playerData = JSON.parse(msg);
                this.player = new Player(playerData.name, playerData.balance);
                resolve(this.player);
            });
        }).bind(this))
    }

    emit(event, data) {
        this.socket.emit(event, JSON.stringify(data));
    }

    emitPlayerDataEvent() {
        return new Promise(((resolve) => {
            this.emit('t-user-update', this.player.toSocketData());
            resolve(true);
        }).bind(this))
    }
}

export { RouletteConnection, RouletteSocketConnection };