import React, { Component, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import Socket from '../../socket';

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

    this.baseUrl = process.env.NODE_ENV === 'production' ? 'https://aaa.bbb' : 'http://localhost:3001';
    this.selectDeck = this.selectDeck.bind(this);
    this.socket = null;
  }

  componentDidMount() {

    let socket = Socket.current();

  }

  join() {

    this.setState({
      mode: 'join'
    });

  }

  start(host) {

    this.socket = Socket.get().connect();

    if (host) {

      fetch(`${this.baseUrl}/api/generate`)
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

    this.socket.on('player:loggedin', () => {
      this.setState({
        response: 'Player joined!'
      });
    });
  }

  async selectDeck(deck) {

    // Controller to abort fetch, if needed and duration counter
    const controller = new AbortController();
    const {
      signal
    } = controller;

    const data = {};
    data.deciderName = 'Decider';

    // if(!data.deciderName) {
    //   $('.submission .error').text('Please enter your name!').fadeIn();
    //   return;
    // }

    data.deckId = deck._id;
    data.accessCode = this.state.data.code;

    const response = await axios.post(
      `${this.baseUrl}/api/create`,
      data, {
        headers: {
          'Content-Type': 'application/json'
        }
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

    const playerUID = Math.floor(1000000000 + Math.random() * 900000);

    // Host = "decider"
    let roomData = {
      type: this.state.mode === 'host' ? 'decider' : 'player',
      username: this.state.hostUsername,
      uid: playerUID,
      joinCode: code || this.state.accessCode
    };
    const {
      username,
      joinCode
    } = this.state;

    // Log player in
    this.socket = Socket.get();
    this.socket.send('login:submit', {
      username,
      joinCode,
      uid: playerUID
    });

    // Session started, let's sign-up the decider for this room
    this.socket.send('room', roomData);

    this.socket._current.on('players:update', (data) => {

      this.setState({
        playerData: data.players
      });

    });

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
              <button id="btn-start-game" onClick={() => this.socket.send('game:intro')}>
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

export default Lobby;
