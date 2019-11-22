/* eslint-disable no-underscore-dangle */
import io from 'socket.io-client';

class Socket {

    constructor() {
        this._current = null;
        this._socketId = null;
        this._gameId = null;
    }

    /**
     * @returns {Socket}
     */
    static get() {
        if (Socket.instance == null) {
            Socket.instance = new Socket();

            // Make connection if none presents
            if (!this._current)
                Socket.instance.connect();
        }

        return this.instance;
    }

    static current() {

        return this.instance._current;

    }

    connect() {
        
        localStorage.debug = '*';

        // Try WS connect
        this._current = io('http://localhost:3001', {
            path: '/at-stake-socket/',
            reconnection: true,
            reconnectionDelay: 500,
            maxReconnectionAttempts: Infinity,
        });

        this._current.on('connect', (client) => {

            this._current.emit('hello');
            this._socketId = this._current.id;

        });

        // Check if already active in a session
        this.checkActive();

        return this._current;

    }

    join(data) {

        // Log player in
        this.send('login:submit', {
            username: data.username,
            joinCode: data.joinCode,
            uid: data.uid
        });
  
        // Session started, let's sign-up the decider for this room
        this.send('room', data);
  
    }

    // If client has stored UID, attempt to re-join a game
    checkActive() {

        if(sessionStorage.getItem('uUID') && sessionStorage.getItem('gameCode')) {

            let data = {
                joinCode: sessionStorage.getItem('gameCode'),
                decider: sessionStorage.getItem('isModerator') ? 'decider' : 'player',
                username: sessionStorage.getItem('username'),
                uid: sessionStorage.getItem('uUID')
            };
            this.send('login:active', data);

        }
    }

    send(eventId, appendData) {

        // Append game ID
        if(appendData) {
            if ((this._gameId === null && appendData.joinCode) || (this._gameId !== appendData.joinCode)) {
                this._gameId = appendData.joinCode;
            }
        }

        const data = {
            gameId: this._gameId.toUpperCase().trim(),
        };
        const payload = {
            ...data,
            ...{
                msgData: appendData,
            },
        };

        console.log('send', eventId, appendData)

        this._current.emit(eventId, payload);
    }
}

Socket.instance = null;

export default Socket;