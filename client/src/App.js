import React, { Component } from "react";
import './App.css';

import Socket from './socket';
import Lobby from './components/Lobby/Lobby';
import Intro from './components/Intro/Intro';

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      started: false,
      response: 'Trying socket connection...',
      screens: ['lobby', 'intro', 'meet', 'deliberate', 'ranking'],
      screenIndex: -1
    };

  }

  componentDidMount() {

    let socket = Socket.get()._current;

    socket.on('ohhai', () => { 
      this.setState({ response: 'Connected to socket', screenIndex: 0 });
    });
    socket.on('game:intro', () => { 
      this.setState({ screenIndex: 1 });
    });
  
  }

  render() {
    const { response, screenIndex, screens } = this.state;
    const currentScreen = screens[screenIndex];

      return (
        <div className="App">

          <p>{response}</p>

          { currentScreen === 'lobby' ? <Lobby /> : null }
          { currentScreen === 'intro' ? < Intro /> : null }

      </div>
    );
  }

}

export default App;
