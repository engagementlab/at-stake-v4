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
        allPlayersReady: false,
        isFacilitator: false,
        notReady: true,
        screenIndex: 0,
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

    // Tell facilitator all players ready for deliberation and advance screen
    this.socket.on('game:ready', () => {
        
        this.setState({
            allPlayersReady: true,
            screenIndex: this.state.screenIndex + 1
        });

    });

  }

  componentDidUpdate = () => {
    console.log('DATA', this.props.data)
  }

  componentWillUnmount = () => {
    console.log('Deliberate will unmount');
  }

  // Send that player is ready
  playerReady() {

    this.socket.emit("game:ready", GameData.get().assemble());
    this.setState({ notReady: false });

  }

  timerStart() {

    this.setState({ timerStarted: true });

  }

  timerEnd() {

    this.setState({ timerEnded: true });

  }


  render() {

    const { isFacilitator, notReady, screenIndex, timerStarted, timerEnded } = this.state;
    const data = this.props.data;

    return (
      <div>
            <Interstitial title="Deliberation" />
            
            {screenIndex === 0 && 
                <div className="screen">
                    <Instructions
                    show={!isFacilitator}
                    heading="Deliberation"
                    body="Think of solutions to the problem scenario below. Consider your teammates' needs when deliberating. Keep in mind equity, fidelity, and cost effectiveness."
                    />
                    <Instructions
                    show={isFacilitator}
                    heading="Deliberation"
                    body="need instruction text"
                    />

                    <Speech
                    facilitator={isFacilitator}
                    body="Problem Scenario"
                    subBody={data.question}
                    bold={true}
                    />
                    
                    {!isFacilitator && (
                        notReady ?
                        <button
                        id="btn-ready"
                        className={`btn submit player`}
                        type="submit"
                        name="submit"
                        onClick={() => { this.playerReady(); }}
                        >
                        Ready
                        </button> 
                        :
                        <button>Waiting</button>
                    )}
                </div>
            }
            {screenIndex === 1 &&
                <div className="screen">
                    
                    <Instructions
                    show={!isFacilitator}
                    heading="Deliberation"
                    body="Begin discussing with your team possible solutions to the problem scenario. "
                    />

                    <h2>Team's Needs</h2>
                    <div className="grid">
                        
                        {Object.keys(data.players).map((id) => {
                            let player = data.players[id];
                            let classStr = 'player' + (player.isFacilitator ? ' facilitator' : '');

                            return (
                                <div className={classStr} key={id}>
                                    <div>
                                        <b>{player.username}</b>
                                        <br />
                                        {!player.isFacilitator ?
                                            <div>
                                                <span>
                                                    {player.needs[0]} 
                                                </span>
                                                <br />
                                                <span>
                                                    {player.needs[1]} 
                                                </span>
                                            </div> 
                                            :
                                            <span>
                                                Facilitator
                                            </span>
                                        
                                        }                               
                                    </div>
                                </div>
                            );
                        })};

                        {/* <div id="events" class="player form">
                        <div id="content">
                            {{#each events}}
                                <div class="event">
                                    <h3>Breaking News</h3>
                                    <div>{{text}}</div>
                                    <span>tap to dismiss</span>
                                </div>
                            {{/each}}
                        </div> */}

                    </div>

                </div>
            }
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