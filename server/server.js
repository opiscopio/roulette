// Core
const express = require('express');
const { createServer } = require('node:htpp');
const { Server: SocketServer, Socket } = require('socket.io');

// Port
const PORT = process.env.PORT || 2000;

// Initialize
const app = express();
const server = createServer(app);
const io = new SocketServer(server);

/**
 * Prefixes for socket room names
 */
const roomPrefix = {
    tournament: 't'
}

class TournamentRoom {
    name;
    players = [];
    maxPlayers = 3;
    started = false;

    constructor(name) {
        this.name = name;
    }

    /**
     * Get number of players currently in the room
     * @returns { number }
     */
    getPlayersCount() {
        return this.players.length;
    }

    /**
     * Whether there is a free seat to join the room
     */
    isSeatAvailable() {
        return this.getPlayersCount() < this.maxPlayers;
    }

    /**
     * Add a player to the room
     */
    addPlayer(player) {
        const seatAvailable = this.isSeatAvailable();
        if(seatAvailable) {
            this.players.push(player);
        } else {
            throw new Error('Could not add player: room full');
        }
    }

    getPlayerByID(id) {
        return this.players.find(player => player.id === id);
    }

    getPlayers() {
        return this.players;
    }

    /**
     * Start tournament. Player's can't join after it starts
     */
    start() {
        this.started = true;
    }
}

class User {
    id;
    name;
    balance;
    defaultBalance;
    betsPlaced;
    maxBets = 30;

    constructor(id, name, balance = 10000) {
        this.id = id;
        this.name = name;
        this.defaultBalance = balance;
        this.balance = balance;
        this.betsPlaced = 0;
    }

    setBalance(newBalance) {
        this.balance = newBalance;
    }

    reset() {
        this.betsPlaced = 0;
        this.balance = this.defaultBalance;
    }

    areAllBetsPlaced() {
        return this.betsPlaced < this.maxBets;
    }

    placeBet() {
        if(!this.areAllBetsPlaced()) {
            this.betsPlaced++;
        } else {
            throw new Error('Max bets placed');
        }
    }

    getBetsCount() {
        return this.betsPlaced;
    }
}

const tournamentRooms = [];

let maxID = 0;

const roomName = (type, index) => {
    return roomPrefix[type] + index;
}

/**
 * 
 * @param { Socket } socket 
 * @param { TournamentRoom } room 
 * @param { User } player
 */
const joinRoom = (socket, room, player) => {
    socket.join(room.name);
    room.addPlayer(player);
}

const leaveRoom = (socket, room, player) => {
    socket.leaveRoom(room.name);
    player.reset();
}

const deleteRoom = (room) => {
    const index = tournamentRooms.findIndex(_room => _room.name === room);
    tournamentRooms.splice(index, 1);
}

const didAllPlayersPlaceAllBets = (players) => {
    return players.every(player => player.areAllBetsPlaced());
}

io.on('connection', (socket) => {

    // Tournament events and variables are prefixed by t-

    let player;
    let tRoom;

    socket.on('login', (msg) => {
        const data = JSON.parse(msg);
        player = new User(maxID++, data.name)
    });


    socket.on('t-user-update', (msg) => {
        const data = JSON.parse(msg);
        const playerID = parseInt(data.player_id);
        const newBalance = parseInt(data.balance);
        const betsPlaced = parseInt(data.betCount);

        const player = tRoom.getPlayerByID(parseInt(playerID));
        player.setBalance(newBalance);
        player.setBetsPlaced(betsPlaced);

        if(didAllPlayersPlaceAllBets(tRoom.getPlayers())) {
            leaveRoom(socket, tRoom, player);
            deleteRoom(tRoom);
            tRoom = null;
        }
    })

    socket.on('t-join', () => {
        tRoom = tournamentRooms.find(room => isSeatAvailable()) || 
        new TournamentRoom(roomName('tournament', maxID++));
        joinRoom(room);
    })
})

app.listen(PORT, () => {
    console.log('server listening on ' + PORT);   
})