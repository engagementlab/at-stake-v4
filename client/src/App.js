import React, { Component } from "react";
import './App.css';
import { CloudinaryContext, Image, Transformation } from 'cloudinary-react';

import Socket from './socket';
import Lobby from './components/Lobby/Lobby';
import Intro from './components/Intro/Intro';
import Meet from './components/Phases/Meet/Meet';
import Interstitial from "./components/Shared/Interstitial/Interstitial";

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      isHost: false,
      started: false,
      response: 'Trying socket connection...',
      screens: ['lobby', 'meet', 'deliberate', 'ranking'],
      screenIndex: -1,
      screenData: null
    };

    this.advanceScreen = this.advanceScreen.bind(this);
    this.playerIsHost = this.playerIsHost.bind(this);

  }

  componentDidMount() {

    let socket = Socket.get()._current;

    socket.on('ohhai', () => { 
      this.setState({ response: 'Connected to socket', screenIndex: 0 });
    });  
    socket.on('game:intro', () => { 
      this.setState({ screenIndex: 1 });
    });
    socket.on('game:next_phase', (screenData) => {
      this.setState({ screenIndex: this.state.screenIndex+1, screenData: screenData });   
    });
  
  }

  playerIsHost() {

    this.setState({ isHost: true });
    
  }

  advanceScreen() {
    
    this.setState({ screenIndex: this.state.screenIndex+1 });

  }

  render() {

    const { isHost, response, screenIndex, screenData, screens } = this.state;
    const currentScreen = screens[screenIndex];

    return (

        <CloudinaryContext cloudName={this.props.cloudName}>

          <div className="App">

            {/* <Interstitial title="Introduction" /> */}
            <p>{response}</p>

            { currentScreen === 'lobby' ? <Lobby done={this.advanceScreen} host={this.playerIsHost} /> : null }
            { currentScreen === 'intro' ? < Intro host={isHost} /> : null }
            
            { currentScreen === 'meet' ? < Meet host={isHost} data={screenData} /> : null }

          </div>

        </CloudinaryContext>

    );
  }

}

export default App;
