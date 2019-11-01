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
      showDecks: true,
      joinCode: '',
      username: '',
    };

    this.baseUrl = process.env.NODE_ENV === 'production' ? 'https://aaa.bbb' : 'http://localhost:3001';
    this.selectDeck = this.selectDeck.bind(this);
  }

  componentDidMount() {
    fetch(`${this.baseUrl}/api/generate`)
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          data: response,
        });
      });
  }

  async selectDeck(deck) {
    // Controller to abort fetch, if needed and duration counter
    const controller = new AbortController();
    const { signal } = controller;

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
      data,
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (response.data.sessionCreated) {
      this.setState({
        status: 'Session created',
        showDecks: false,
      });
    }
  }

  playerJoin() {
    const { username, joinCode } = this.state;

    const playerUID = Math.floor(
      (10 ** 10 - 1) + Math.random() * ((10 ** 10) - (10 ** 10 - 1) - 1)
    );

    // Log player in
    Socket.get().send('login:submit', { username, joinCode, uid: playerUID });
  }

  render() {
    const { data, showDecks, status } = this.state;
    const { mode } = this.props;

    return (
      <div>
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

        {mode === 'join'
          ? (
            <p>
              Player Join:
              <input type="text" placeholder="room code" onChange={(event) => this.setState({ joinCode: event.target.value })} />
              <input type="text" placeholder="name" onChange={(event) => this.setState({ username: event.target.value })} />
              <button type="button" onClick={() => this.playerJoin()}>Join</button>
            </p>
          )
          : null}

        <p>
          <b>Lobby Status</b>
          :
          {' '}
          {status}
        </p>
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
