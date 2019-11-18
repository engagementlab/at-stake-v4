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

        return this._current;

    }

    send(eventId, appendData) {

        if (this._gameId === null && appendData.joinCode) {
            this._gameId = appendData.joinCode;
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

        console.log('send', eventId)

        this._current.emit(eventId, payload);
    }
}

Socket.instance = null;

export default Socket;