// Core
const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server: SocketServer, Socket } = require('socket.io');

// Port
const PORT = process.env.PORT || 2000;
const MAX_BETS = process.env.MAX_BETS || 4;

// Initialize
const app = express();
app.use(cors());
const server = createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: '*',
        credentials: false
    }
});

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
        return !this.started && this.getPlayersCount() < this.maxPlayers;
    }

    /**
     * Add a player to the room
     */
    addPlayer(player) {
        const seatAvailable = this.isSeatAvailable();
        if(seatAvailable) {
            this.players.push(player);
            if(!this.isSeatAvailable()) {
                this.started = true;
            }
        } else {
            throw new Error('Could not add player: room full');
        }
    }

    removePlayer(id) {
        const index = this.players.findIndex(player => player.id === id);
        this.players.splice(index, 1);
    }

    getPlayerByName(name) {
        return this.players.find(player => player.name === name);
    }

    /**
     * 
     * @returns { User[] }
     */
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
    maxBets = MAX_BETS;

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
        return this.betsPlaced >= this.maxBets;
    }

    setBetsPlaced(n) {
        this.betsPlaced = n;
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

    toSocketData() {
        return {
            name: this.name,
            balance: this.balance,
            betCount: this.getBetsCount()
        }
    }
}

/**
 * @type { TournamentRoom[]}
 */
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

/**
 * 
 * @param { Socket } socket 
 * @param {*} room 
 * @param {*} player 
 */
const leaveRoom = (socket, room, player) => {
    console.log('leaving room');
    room.removePlayer(player.id);
    socket.broadcast.to(room.name).emit('t-leave', JSON.stringify(player.toSocketData()));
    socket.leave(room.name);
    player.reset();
}

const deleteRoom = (room) => {
    const index = tournamentRooms.findIndex(_room => _room.name === room);
    tournamentRooms.splice(index, 1);
}

const didAllPlayersPlaceAllBets = (players) => {
    return players.every(player => player.areAllBetsPlaced() || player.balance <= 0);
}

const isGameOver = (players) => {
    return didAllPlayersPlaceAllBets(players);
}

io.on('connection', (socket) => {

    // Tournament events and variables are prefixed by t-

    /**
     * @type { User }
     */
    let player;
    /**
     * @type { TournamentRoom }
     */
    let tRoom;

    socket.on('login', (msg, callback) => {
        if(player) {
            player.reset();
        } else {
            const data = JSON.parse(msg);
            console.log('loggedin: ', data);
            player = new User(maxID++, data.name);
        }
        callback(JSON.stringify(player.toSocketData()));
    });


    socket.on('t-user-update', (msg) => {
        const data = JSON.parse(msg);
        const newBalance = parseInt(data.balance);
        const betsPlaced = data.betCount;

        const player = tRoom.getPlayerByName(data.name);
        player.setBalance(newBalance);
        player.setBetsPlaced(betsPlaced);

        const allPlayers = tRoom.getPlayers();

        if (isGameOver(allPlayers)) {
            console.log('game over');
            console.log(tRoom.getPlayers());
            socket.nsp.to(tRoom.name).emit("t-game-over", JSON.stringify(
                tRoom.getPlayers().map(_player => _player.toSocketData())
            ));
            // leaveRoom(socket, tRoom, player);
            deleteRoom(tRoom);
            tRoom = null;
        } else {
            socket.nsp.to(tRoom.name).emit('t-user-update', JSON.stringify(player.toSocketData()));
        }
    });

    socket.on('t-join', (callback) => {
        prevRoom = tournamentRooms.find(room => room.getPlayerByName(player.name));
        if(prevRoom) {
            leaveRoom(socket, prevRoom, player);
        };
        console.log('joined');
        tRoom = tournamentRooms.find(room => room.isSeatAvailable()); 

        if(!tRoom) {
            tRoom = new TournamentRoom(roomName('tournament', maxID++));
            tournamentRooms.push(tRoom);
        }

        player.reset();

        joinRoom(socket, tRoom, player);
        console.log(tRoom);
        socket.broadcast.to(tRoom.name).emit('t-join', player.toSocketData());
        callback(JSON.stringify(
            tRoom.getPlayers().map(player => player.toSocketData())
        ));
    })

    socket.on('t-leave', (msg) => {
        leaveRoom(socket, tRoom, player);
    })

    socket.on('disconnect', () => {
        if(tRoom && player) {
            tRoom.removePlayer(player);
        } else if(tRoom && tRoom.getPlayersCount() === 0) {
            deleteRoom(tRoom);
        }
    })
})

server.listen(PORT, () => {
    console.log('server listening on ' + PORT);   
})