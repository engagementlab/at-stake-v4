import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { SocketProvider } from '../../SocketContext';
import Decks from './Decks';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      status: null,
      playerData: null,
      showDecks: true,
      joinCode: '',

      // for dev only
      username: 'user1',

      mode: ''
    };

    this.selectDeck = this.selectDeck.bind(this);

    // Token for cancelling fetch on unmount
    const CancelToken = axios.CancelToken;
    this.cancelSrc = CancelToken.source();
    this.abortCtrl = new AbortController();
  }

  componentDidMount() { }

  componentWillUnmount() {

    // Cancel requests
    this.cancelSrc.cancel('Lobby unmounting');
    this.abortCtrl.abort();

  }

  join() {

    this.setState({
      mode: 'join'
    });

  }

  start(host) {

    if (host) {

      this.props.host();

      // Generate session
      fetch(`${process.env.REACT_APP_API_URL}/api/generate`, { signal: this.abortCtrl.signal })
        .then((response) => response.json())
        .then((response) => {

          this.setState({
            data: response,
            mode: 'host',
            showDecks: true,
            joinCode: response.code
          });

        });

    }

    this.props.socket.on('player:loggedin', () => {
      this.setState({
        response: 'Player joined!'
      });
    });
  }

  async selectDeck(deck) {

    const data = {};
    data.deciderName = 'Decider';

    // if(!data.deciderName) {
    //   $('.submission .error').text('Please enter your name!').fadeIn();
    //   return;
    // }

    data.deckId = deck._id;
    data.accessCode = this.state.data.code;

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/create`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        cancelToken: this.cancelSrc.token
      },
    );

    if (response.data.sessionCreated) {
      
      this.setState({
        status: 'Session created',
        showDecks: false
      });

      // Join host player to room
      this.playerJoin();

    }

  }

  playerJoin(code) {

    // Watch for new players in lobby
    this.props.socket.on('players:update', (data) => {

      this.setState({
        playerData: data.players
      });

    });

    let playerUID = Math.floor(1000000000 + Math.random() * 900000);
    
		// Cache uid for player
		if(!sessionStorage.getItem('uUID'))
			sessionStorage.setItem('uUID', playerUID);
		else 
      playerUID = sessionStorage.getItem('uUID');
      
    // Host = "decider"
    let roomData = {
      type: this.state.mode === 'host' ? 'decider' : 'player',
      username: this.state.username,
      uid: playerUID,
      joinCode: code || this.state.joinCode
    };
    
    this.socket.join(roomData)

    // Save game code for resuming
    sessionStorage.setItem('gameCode', roomData.joinCode);
    // Flag client if is host/moderator
    sessionStorage.setItem('isModerator', (this.state.mode === 'host'));
    // Save username
    sessionStorage.setItem('username', roomData.username);
    
    // // Session started, let's sign-up the decider for this room
    // this.socket.send('room', roomData);

  }

  render() {

    const { data, mode, playerData, showDecks, status } = this.state;

    return (

      <div>
        {mode === ''
          ? (   
            <div>
              <input type="text" value="host1" onChange={(event) => this.setState({ username: event.target.value })} />
              
              <br />
              <button onClick={() => this.start(true)}>Host</button> 
              <br />
                /////////
              <br />
              <button onClick={() => this.join()}>Join</button>
            </div>
          ) : null}

        {mode === 'host' && (playerData && playerData.length >= 2)
          ? ( 
            <div id="start">
              <button id="btn-start-game" onClick={() => { this.socket.send('game:start'); this.props.done(); }}>
                <h2>Start</h2>
              </button>
            </div>
          ) : null}

        {mode === 'join'
          ? (
            <p>
              Player Join:
              <input type="text" placeholder="room code" onChange={(event) => this.setState({ joinCode: event.target.value })} />
              <input type="text" placeholder="name" onChange={(event) => this.setState({ username: event.target.value })} />
              <button type="button" onClick={() => this.playerJoin()}>Start</button>
            </p>
          )
          : null}
        
        {data
          ? (
            <div>
              <p>
                Room Code:
                {' '}
                {data.code}
              </p>
              {showDecks && mode === 'host' ? <Decks decks={data.decks} callback={this.selectDeck} /> : null}
            </div>
          )
          : null}

        <p>
          <b>Lobby Status</b>
          :
          {' '}
          {status}
        </p>

        {!playerData ? null :    
            (<div>
              Players: 
              <ol>
                {playerData.map(player => <li key={player.username }>{player.username}</li>)}
              </ol>

            </div>)  
        }
      
      </div>
    );
  }
}

Lobby.defaultProps = {
  mode: '',
};

Lobby.propTypes = {
  mode: PropTypes.string,
};

const LobbyWithSocket = props => (
  <SocketProvider>
    {socket => <Lobby {...props} socket={socket} />}
  </SocketProvider>
)

export default LobbyWithSocket;
