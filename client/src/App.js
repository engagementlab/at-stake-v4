import React, { Component } from "react";
import { CloudinaryContext } from 'cloudinary-react';
import SocketContext from './SocketContext';
import io from 'socket.io-client';

import './App.css';

import GameData from './GameData';
import Lobby from './components/Lobby/Lobby';
import Intro from './components/Intro/Intro';
import Meet from './components/Phases/Meet/Meet';
import Deliberate from './components/Phases/Deliberate/Deliberate';
import Rolecard from "./components/Shared/Rolecard/Rolecard";

const socket = io('http://localhost:3001', {
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
      screenIndex: -1,
      screenData: null
    };

    this.roleData = null;

    this.advanceScreen = this.advanceScreen.bind(this);
    this.playerIsHost = this.playerIsHost.bind(this);
    this.closeRolecard = this.closeRolecard.bind(this);

  }

  componentDidMount() {
    
    socket.on('connect', () => { 
      socket.emit('hello');
      
      // Cache socket id in data singleton
      GameData.get()._socketId = socket.id;

      this.setState({ response: 'Connected' });
    });  
    socket.on('disconnect', () => { 
      this.setState({ response: 'Disconnected' });
    });  
    socket.on('game:intro', () => { 
      this.setState({ screenIndex: 1 });
    });

    socket.on('game:next_phase', (screenData) => {
      this.setState({ screenIndex: this.state.screenIndex+1, screenData: screenData });   
      
      // Cache player's role data as it is emitted only in first phase
      this.roleData = screenData.role;
    });
    socket.on('game:refresh_screen', (screenData) => {  
      this.setState({ screenIndex: screenData.phase, screenData: screenData });   
    });

    socket.on('player:reconnected', (eventData) => {
      this.setState({ response: 'Player re-joined.' });
    });
    socket.on('player:lost', (eventData) => {
      this.setState({ response: eventData.names.join(',') + ' disconnected.' });
    });
  
  }

  playerIsHost() {

    this.setState({ isHost: true });
    
  }

  advanceScreen() {
    
    this.setState({ screenIndex: this.state.screenIndex+1 });

  }

  closeRolecard() {

    this.setState({ rolecardShow: false });

  }

  render() {

    const { isHost, response, rolecardShow, screenIndex, screenData, screens } = this.state;
    const currentScreen = screens[screenIndex];

    return (

      <SocketContext.Provider value={socket}>     
      
        <CloudinaryContext cloudName={this.props.cloudName}>

          <div id="app">
            <h1>
              {currentScreen}
            </h1>

            {/* <Interstitial title="Introduction" /> */}

            { screenIndex < 0 ? <Lobby done={this.advanceScreen} host={this.playerIsHost} /> : null }
            { currentScreen === 'intro' ? <Intro host={isHost} /> : null }
            
            { currentScreen === 'meet' ? <Meet host={isHost} data={screenData} /> : null }
            
            { currentScreen === 'deliberate' ? <Deliberate host={isHost} data={screenData} role={this.roleData} /> : null }

            {/* ROLECARD */}
            { rolecardShow ? <Rolecard role={this.roleData} close={this.closeRolecard} /> : null }

            <div id="state"><em>Socket:</em> {response}</div>
          </div>

        </CloudinaryContext>

      </SocketContext.Provider>

    );
  }

}

export default App;
