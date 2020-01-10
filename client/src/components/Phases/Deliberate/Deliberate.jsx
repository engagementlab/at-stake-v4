import React, { PureComponent } from 'react';

import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

import CdnImage from '../../Util/CdnImage/CdnImage';
import Interstitial from '../../Shared/Interstitial/Interstitial';
import Rolecard from '../../Shared/Rolecard/Rolecard';
import Instructions from '../../Shared/Instructions/Instructions';
import Speech from '../../Shared/Speech/Speech';
import Timer from '../../Shared/Timer/Timer';

class Deliberate extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isFacilitator: false,
      timerStarted: false,
      timerEnded: false
    };

    this.socket = null;
    this.timerStart = this.timerStart.bind(this);
    this.timerEnd = this.timerEnd.bind(this);
  }

  componentDidMount = () => {

    // Set if facilitator
    this.setState({ isFacilitator: this.props.role.isFacilitator });

    this.socket = this.props.socket;

    /* Socket Listeners */

    // Tell facilitator all players ready for intros
    // this.socket.on('game:ready', () => {

    //   this.setState({ allPlayersReady: true });

    // });

  }

  componentDidUpdate = () => {
    console.log('DATA', this.props.data)
  }

  componentWillUnmount = () => {
    console.log('Deliberate will unmount');
  }

  timerStart() {

    this.setState({ timerStarted: true });

  }

  timerEnd() {

    this.setState({ timerEnded: true });

  }


  render() {

    const { isFacilitator, timerStarted, timerEnded } = this.state;
    const data = this.props.data;

    return (
      <div>
          Delib
      </div>
    );
  }
}

const DeliberateWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Deliberate {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default DeliberateWithSocket;