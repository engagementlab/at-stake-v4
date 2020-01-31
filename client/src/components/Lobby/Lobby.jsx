/* eslint-disable arrow-parens */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import ListGroup from 'react-bootstrap/ListGroup';

import GameData from '../../GameData';
import SocketContext from '../../SocketContext';
import Decks from './Decks';

import './Lobby.scss';

let socket = null;

class Lobby extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      status: 'Waiting',
      playerData: null,
      showDecks: true,
      // On dev, room code has default in form
      joinCode: process.env.NODE_ENV === 'development' ? 'TEST' : '',

      // for dev only
      username: 'user1',

      mode: '',
    };

    this.selectDeck = this.selectDeck.bind(this);

    // Token for cancelling fetch on unmount
    const { CancelToken } = axios;
    this.cancelSrc = CancelToken.source();
    this.abortCtrl = new AbortController();
  }

  componentDidMount() {
    // Socket prop from context API
    socket = this.props.socket;
  }

  componentWillUnmount() {
    // Cancel requests
    this.cancelSrc.cancel('Lobby unmounting');
    this.abortCtrl.abort();

    // Cancel socket listeners
    socket.off('players:update');
  }

  join() {
    this.setState({
      mode: 'join',
      username: 'player1',
    });
  }

  start(host) {
    if (host) {
      this.props.host();

      // Generate session
      fetch(`${process.env.REACT_APP_API_URL}/api/generate`, {
        signal: this.abortCtrl.signal,
      })
        .then(response => response.json())
        .then(response => {
          this.setState({
            data: response,
            mode: 'host',
            showDecks: true,
            joinCode: response.code,
          });

          // Cache game id in data singleton
          GameData.get()._gameId = response.code;
        });
    }

    socket.on('player:loggedin', () => {
      this.setState({
        response: 'Player joined!',
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
          'Content-Type': 'application/json',
        },
        cancelToken: this.cancelSrc.token,
      },
    );

    if (response.data.sessionCreated) {
      this.setState({
        status: 'Session created',
        showDecks: false,
      });

      // Join host player to room
      this.playerJoin();
    }
  }

  playerJoin(code) {
    // Watch for new players in lobby
    socket.on('players:update', data => {
      this.setState({
        playerData: data.players,
      });
    });

    let playerUID = Math.floor(1000000000 + Math.random() * 900000);

    // Cache uid for player
    if (!sessionStorage.getItem('uUID')) {
      sessionStorage.setItem('uUID', playerUID);
    } else {
      playerUID = sessionStorage.getItem('uUID');
    }

    // Host = "decider"
    const roomData = {
      type: this.state.mode === 'host' ? 'decider' : 'player',
      username: this.state.username,
      uid: playerUID,
      joinCode: code || this.state.joinCode,
    };

    const payload = GameData.get().assemble(roomData);

    // Session started, let's sign-up the decider for this room
    socket.emit('room', payload);

    // Log player in (non-fac only)
    if (roomData.type === 'player') socket.emit('login:submit', payload);

    // Save game code for resuming
    sessionStorage.setItem('gameCode', roomData.joinCode);
    // Flag client if is host/facilitator
    sessionStorage.setItem('isModerator', this.state.mode === 'host');
    // Save username
    sessionStorage.setItem('username', roomData.username);
  }

  startGame() {
    socket.emit('game:start', GameData.get().assemble());
    // this.props.done();
  }

  render() {
    const {
      data, mode, playerData, showDecks, status,
    } = this.state;
    // Pre-populated join form for dev
    const roomCode = process.env.NODE_ENV === 'development' ? 'TEST' : '';
    const playerName = process.env.NODE_ENV === 'development' ? 'player1' : '';

    return (
      // TODO: Implement initial name input screen
      <Container>

        <Row>
          <Col>
            {/* TODO: Load @1x, @2x, @3x resolutions depending on screen size? */}
            <Image src="/img/intro/start-banner@2x.png" fluid />
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>
              Hello,
              {' '}
              {/* TODO: Make this use the name specified by the player */}
              <b>Player</b>
              !
            </h1>
          </Col>
        </Row>

        {/* Begin "Join" logic */}

        <Row>
          <Col>
            <Button
              id="btn-join-game"
              variant="primary"
              size="lg"
              onClick={() => this.join()}
              block
            >
              Join A Game
            </Button>
          </Col>
        </Row>

        {mode === 'join' ? (
          <Row>
            <Col>
              {/* Input for room code shown when a player clicks "join" */}
              <InputGroup className="playerJoinInput">
                <InputGroup.Prepend>
                  <InputGroup.Text>Player Join:</InputGroup.Text>
                </InputGroup.Prepend>

                <FormControl
                  id="input-room-code"
                  type="text"
                  placeholder="room code"
                  onChange={(event) => this.setState({ joinCode: event.target.value })}
                />

                <FormControl
                  id="input-name"
                  type="text"
                  placeholder="name"
                  onChange={(event) => this.setState({ username: event.target.value })}
                />

                <Button
                  id="btn-join-submit"
                  variant="success"
                  onClick={() => this.playerJoin()}
                >
                  Join
                </Button>
              </InputGroup>
            </Col>
          </Row>
        ) : null}

        {/* Begin "Host" logic */}

        <Row>
          <Col>
            <hr />
            <p className="monospace">
              If you are a facilitator, start a new game.
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              id="btn-new-game"
              variant="info"
              size="lg"
              onClick={() => this.start(true)}
              block
            >
              Create A New Game
            </Button>
          </Col>
        </Row>

        {/* Display list of Decks for host to choose from */}

        {data ? (
          <Row>
            <Col>
              <p>
Room Code:&nbsp;
                <span id="room-code">
                  {data.code}
                </span>
              </p>

              {showDecks && mode === 'host' ? (
                <Decks decks={data.decks} callback={this.selectDeck} />
              ) : null}
            </Col>
          </Row>
        ) : null}

        {/* Start Game button for Host */}

        {mode === 'host' && playerData ? (
          <Row>
            <Col id="start">
              <Button
                id="btn-start-game"
                variant="success"
                size="lg"
                onClick={() => { this.startGame(); }}
                disabled={playerData.length < 2}
              >
                Start Game
              </Button>
            </Col>
          </Row>
        ) : null}

        <Row>
          <Col>
            <p>
              <b>Lobby Status:</b>
              {` ${status}`}
            </p>
          </Col>
        </Row>

        {/* Show list of connected players to Host */}

        {playerData && (
          <Row>
            <Col>
              Players:
              <ListGroup>
                {playerData.map(player => (
                  <ListGroup.Item key={player.username}>
                    {player.username}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        )}

      </Container>
    );
  }
}

Lobby.propTypes = {
  mode: PropTypes.string,
};

Lobby.defaultProps = {
  mode: '',
};

const LobbyWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Lobby {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default LobbyWithSocket;
