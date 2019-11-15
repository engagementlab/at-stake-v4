import React, { Component } from "react";
import './App.css';

import Socket from './socket';
import Lobby from './components/Lobby/Lobby';

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      started: false,
      response: 'Trying socket connection...',
    };

  }

  componentDidMount() {

    let socket = Socket.get().connect();

    socket.on('ohhai', () => { 
      this.setState({ response: 'Connected to socket', started: true });
    });
  
  }

  startJoinI() {

  }

  render() {
    const { response, started } = this.state;
      return (
        <div className="App">

          <p>{response}</p>

          { !started ? null : <Lobby /> }

      </div>
    );
  }

}

export default App;
