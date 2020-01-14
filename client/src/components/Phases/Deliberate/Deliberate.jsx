import React, { PureComponent } from 'react';

import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

import CdnImage from '../../Util/CdnImage/CdnImage';
import Interstitial from '../../Shared/Interstitial/Interstitial';
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
            showEvent: false,
            timerStarted: false,
            timerEnded: false,
            visibleEventIndex: -1
        };

        this.socket = null;
        this.eventCountdown = null;
        this.timerStart = this.timerStart.bind(this);
        this.timerEnd = this.timerEnd.bind(this);

    }

    componentDidMount = () => {

        // Set if facilitator
        this.setState({
            isFacilitator: this.props.role.isFacilitator
        });

        this.socket = this.props.socket;

        /* Socket Listeners */

        // Tell facilitator all players ready for deliberation and advance screen
        this.socket.on('game:ready', () => {

            this.setState({
                allPlayersReady: true,
                screenIndex: this.state.screenIndex + 1
            });

        });
        this.socket.on('game:next_screen', () => {

            // Advance screen for non-fac
            if(!this.state.isFacilitator)
                this.setState({ screenIndex: this.state.screenIndex + 1 });

        });

        // Tell non-fac to show event
        this.socket.on('player:show_event', (data) => {

            this.setState({
                showEvent: true,
                visibleEventIndex: data
            });

        });

    }

    componentDidUpdate = () => {
        console.log('DATA', this.props.data)
    }

    componentWillUnmount = () => {
        
        // Cleanup
        clearTimeout(this.eventCountdown);

    }

    // Send that player is ready
    playerReady() {

        this.socket.emit("game:ready", GameData.get().assemble());

    }

    timerStart() {

        this.setState({
            timerStarted: true
        });

        // Begin event queue
        this.startEventQueue();

    }

    timerEnd() {

        this.setState({
            timerEnded: true
        });

    }

    startEventQueue() {

        // Display event to facilitator between 5-15s randomly
        let time = Math.floor(Math.random() * (15 - 5 + 1)) + 5;

        // On dev, fire every 1s
        if(process.env.NODE_ENV === 'development') time = 1;

        this.eventCountdown = setTimeout(() => {
            this.showEvent();
        }, time * 1000);

    }

    showEvent() {
        
        // Increment visible event and show
        this.setState({ showEvent: true, visibleEventIndex: this.state.visibleEventIndex+1 })
        
        clearTimeout(this.eventCountdown);

    }

    eventAction(state, evtIndex) {

        this.socket.emit('game:event',
            GameData.get().assemble({
                state: state,
                index: evtIndex
            }));

        // Hide events and restart queue
        this.setState({ showEvent: false });
        this.startEventQueue();

    }

    dismissEvent() {

        this.setState({ showEvent: false })

    }

    render() {

    const { allPlayersReady, isFacilitator, notReady, screenIndex, showEvent, timerStarted, timerEnded, visibleEventIndex } = this.state;
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
                    body="Start timer when all players ready."
                    />

                    <Speech
                    facilitator={isFacilitator}
                    body="Problem Scenario"
                    subBody={data.question}
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

            {/* Player ready/is deliberating */}
            {screenIndex === 1 &&
                <div className="screen">
                    
                    <Instructions
                    show={!isFacilitator}
                    heading="Deliberation"
                    body="Begin discussing with your team possible solutions to the problem scenario. "
                    />

                    <Timer
                    show={isFacilitator}
                    disabled={!allPlayersReady}
                    started={this.timerStart}
                    done={this.timerEnd}
                    />

                    {/* Show team/events to non-facilitator */}
                    {!isFacilitator && (
                        <div>
                            <div id="events">
                                {data.events.map((evt, i) => {

                                    // Show event only if it's the one broadcast
                                    return (visibleEventIndex === i && showEvent) && (
                                        
                                        <div key={i} className="event" onClick={() => this.dismissEvent()}>
                                            <div className="content">
                                                <h3>Breaking News</h3>
                                                <div>{evt.text}</div>
                                                <span>(tap to dismiss)</span>
                                            </div>
                                        </div>

                                    )

                                })}
                            </div>

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

                            </div>

                            <button onClick={() => 
                                this.socket.emit('player:call_vote', GameData.get().assemble())
                            }>Call vote</button>
                        </div>
                    )}

                    {/* Show 'random' events to facilitator */}
                    {isFacilitator &&
                        <div id="events">
                            {data.events.map((evt, i) => {

                                // Show event only if it's the current one in state
                                return (visibleEventIndex === i && showEvent) && (
                                    
                                    <div key={i} className="event">
                                        <div className="content">
                                            
                                            <div>
                                                <h3>New Event</h3>
                                                <h1>{evt.text}</h1>
                                            </div>
                            
                                            <div className="buttons">
                                                {/* Tooltip on first event */}
                                                {i === 0 && <span className="tooltip-content">You can choose to accept or ignore events that will complicate players' solutions.</span>}
                                                
                                                <button id="btn-confirm" type="submit" name="submit" onClick={() => {
                                                    this.eventAction('accept', i);  
                                                }}>	
                                                    &#x2714;
                                                </button>
                                                
                                                <button id="btn-reject" type="submit" name="submit" onClick={() => {
                                                    this.eventAction('reject', i);  
                                                }}>
                                                    &#65794;
                                                </button>
                                            </div>
                                            
                                        </div>
                                    </div>

                                )

                            })}
                        </div>
                    }

                    {/* Timer over */}
                    {timerEnded ? (
                        <div id="time-up">
                            <CdnImage
                                publicId="v1540488090/at-stake/bg/clock"
                                width={319}
                                format="png"
                            />
                            <h1>Time's up!</h1>
                            <p>This would be a good time to call to vote.</p>
                        </div>
                    ) : null}
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