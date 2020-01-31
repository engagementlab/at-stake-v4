import React, { Component } from 'react';
import { CloudinaryContext } from 'cloudinary-react';
import io from 'socket.io-client';
import SocketContext from './SocketContext';

import './App.scss';

import GameData from './GameData';

import Lobby from './components/Lobby/Lobby';
import Intro from './components/Intro/Intro';
import Meet from './components/Phases/Meet/Meet';
import Deliberate from './components/Phases/Deliberate/Deliberate';
import Ranking from './components/Phases/Ranking/Ranking';

import Rolecard from './components/Shared/Rolecard/Rolecard';

const socket = io(`${process.env.REACT_APP_SOCKET_URL}`, {
  path: '/at-stake-socket/',
  reconnection: true,
  reconnectionDelay: 500,
  maxReconnectionAttempts: Infinity,
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      isHost: false,
      rolecardShow: false,

      response: 'Trying socket connection...',

      screens: ['meet', 'deliberate', 'ranking'],
      phaseIndex: -1,
      screenData: null,
    };

    this.roleData = null;

    this.advanceScreen = this.advanceScreen.bind(this);
    this.playerIsHost = this.playerIsHost.bind(this);
    this.closeRolecard = this.closeRolecard.bind(this);
  }

  componentDidMount() {
    socket.on('connect', () => {
      // Cache socket id in data singleton
      GameData.get().socketId = socket.id;

      if (sessionStorage.getItem('gameCode')) {
        // Check if player is active in game
        socket.emit(
          'login:active',
          GameData.get().assemble({
            joinCode: sessionStorage.getItem('gameCode'),
            username: sessionStorage.getItem('username'),
            uid: sessionStorage.getItem('uUID'),
          }),
        );
      }

      this.setState({ response: 'Connected' });
    });

    socket.on('disconnect', () => {
      this.setState({ response: 'Disconnected' });
    });

    socket.on('game:intro', () => {
      this.setState({ phaseIndex: 1 });
    });

    socket.on('game:next_phase', (screenData) => {
      const { phaseIndex } = this.state;
      this.setState({ phaseIndex: phaseIndex + 1, screenData });

      // Cache player's role data as it is emitted only in first phase
      this.roleData = screenData.role;
    });
    socket.on('game:refresh_screen', (screenData) => {
      // Cache player's role data as it is emitted only on refresh
      this.roleData = screenData.role;

      this.setState({ phaseIndex: screenData.phase, screenData });

      const roomData = {
        type: this.roleData.isFacilitator ? 'decider' : 'player',
        username: screenData.username,
        uid: screenData.uid,
        joinCode: sessionStorage.getItem('gameCode'),
      };
      const payload = GameData.get().assemble(roomData);

      // Session re-started, let's signup again for room
      socket.emit('room', payload);
    });

    socket.on('player:reconnected', () => {
      this.setState({ response: 'Player re-joined.' });
    });
    socket.on('player:lost', (eventData) => {
      this.setState({ response: `${eventData.names.join(',')} disconnected.` });
    });
  }

  playerIsHost() {
    this.setState({ isHost: true });
  }

  advanceScreen() {
    const { phaseIndex } = this.state;
    this.setState({ phaseIndex: phaseIndex + 1 });
  }

  closeRolecard() {
    this.setState({ rolecardShow: false });
  }

  render() {
    const { cloudName } = this.props;
    const {
      isHost,
      response,
      rolecardShow,
      phaseIndex,
      screenData,
      screens,
    } = this.state;
    const currentScreen = screens[phaseIndex];

    return (
      <SocketContext.Provider value={socket}>
        <CloudinaryContext cloudName={cloudName}>
          <div id="app">
            <h1>{currentScreen}</h1>

            {/* <Interstitial title="Introduction" /> */}

            {phaseIndex < 0 && (
              <Lobby done={this.advanceScreen} host={this.playerIsHost} />
            )}
            {currentScreen === 'intro' && <Intro host={isHost} />}

            {/* Phases */}
            {currentScreen === 'meet' && (
              <Meet host={isHost} data={screenData} />
            )}
            {currentScreen === 'deliberate' && (
              <Deliberate
                host={isHost}
                data={screenData}
                role={this.roleData}
              />
            )}
            {currentScreen === 'ranking' && (
              <Ranking host={isHost} data={screenData} />
            )}

            {/* ROLECARD */}
            {rolecardShow && (
              <Rolecard show role={this.roleData} close={this.closeRolecard} />
            )}

            <div id="state">
              <em>Socket:</em>
              {` ${response}`}
            </div>
          </div>
        </CloudinaryContext>
      </SocketContext.Provider>
    );
  }
}

export default App;
