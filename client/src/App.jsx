import React, { Component } from 'react';
import './App.css';

import Socket from './socket';
import Lobby from './components/Lobby/Lobby';

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: 'Trying socket connection...',
      mode: '',
    };

    // Socket.get = null;
  }

  componentDidMount() { }

  start(host) {
    const socket = Socket.get().connect();

    socket.on('ohhai', () => {
      this.setState({ response: 'Connected to socket', mode: host ? 'host' : 'join' });
    });
    socket.on('player:loggedin', () => {
      this.setState({ response: 'Player joined!' });
    });
  }

  startJoinI() { }

  render() {
    const { response } = this.state;
    return (
      <div className="App">

        <button type="button" onClick={() => this.start(true)}>Host</button>
        <br />
        /////////
        <br />
        <button type="button" onClick={() => this.start(false)}>Join</button>

        <p>{response}</p>

        <Lobby mode={this.state.mode} />
      </div>
    );
  }
}

export default App;
