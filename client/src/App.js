import React, { Component } from "react";
import { CloudinaryContext } from 'cloudinary-react';
import { SocketProvider } from './SocketContext';
import io from 'socket.io-client';

import './App.css';

// import Socket from './socket';
import Lobby from './components/Lobby/Lobby';
import Intro from './components/Intro/Intro';
import Meet from './components/Phases/Meet/Meet';

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
      started: false,
      response: 'Trying socket connection...',
      screens: ['meet', 'deliberate', 'ranking'],
      screenIndex: -1,
      screenData: null
    };

    this.advanceScreen = this.advanceScreen.bind(this);
    this.playerIsHost = this.playerIsHost.bind(this);

  }

  componentDidMount() {

    // this.connectSocket();   

    // let socket = Socket.get()._current;

    socket.on('connect', () => { 
      this.setState({ response: 'Connected to socket' });
    });  
    socket.on('disconnect', () => { 
      this.setState({ response: 'Disconnected from socket' });
    });  
    socket.on('game:intro', () => { 
      this.setState({ screenIndex: 1 });
    });

    socket.on('game:next_phase', (screenData) => {
      this.setState({ screenIndex: this.state.screenIndex+1, screenData: screenData });   
    });
    socket.on('game:refresh_screen', (screenData) => {  
      this.setState({ screenIndex: screenData.phase, screenData: screenData });   
    });

    socket.on('player:reconnected', (eventData) => {
      this.setState({ response: 'Player re-joined.' });
    });
    socket.on('player:lost', (eventData) => {
      debugger
      this.setState({ response: eventData.names.join(',') + ' disconnected.' });
    });
  
  }

  playerIsHost() {

    this.setState({ isHost: true });
    
  }

  advanceScreen() {
    
    this.setState({ screenIndex: this.state.screenIndex+1 });

  }

  render() {

    const { isHost, response, screenIndex, screenData, screens, started } = this.state;
    const currentScreen = screens[screenIndex];

    return (


      <SocketProvider socket={socket}>     
      
        <CloudinaryContext cloudName={this.props.cloudName}>

          <div className="App">

            {/* <Interstitial title="Introduction" /> */}
            <p>{response}</p>

            { screenIndex < 0 ? <Lobby done={this.advanceScreen} host={this.playerIsHost} socket={this.props.socket} /> : null }
            { currentScreen === 'intro' ? < Intro host={isHost} /> : null }
            
            { currentScreen === 'meet' ? < Meet host={isHost} data={screenData} /> : null }

          </div>

        </CloudinaryContext>

      </SocketProvider>

    );
  }

}

export default App;
