import io from 'socket.io-client';

class Socket {

    static instance = null;

    _current = null;
    _socketId = null;
    _gameId = null;

    /**
     * @returns {Socket}
     */
    static get() {

        if (Socket.instance == null) {
            Socket.instance = new Socket();
        }

        return this.instance;
    }

    connect() {

        // Try WS connect
        this._current = io('http://localhost:3001', {
            path: '/at-stake-socket/',
            'reconnection': true,
            'reconnectionDelay': 500,
            'maxReconnectionAttempts': Infinity
        });

        this._current.on('connect', (client) => {

            console.log('connected to socket client')

            this._current.emit('hello');

            this._socketId = this._current.id;

        });

        return this._current;
    }

    send(eventId, appendData) {

        if (this._gameId === null && appendData.code)
            this._gameId = appendData.code;

        let data = {
            gameId: this._gameId.toUpperCase().trim()
        };
        let payload = {
            ...data,
            ...{
                msgData: appendData
            }
        };

        this._current.emit(eventId, payload);

    };
}

export default Socket;
