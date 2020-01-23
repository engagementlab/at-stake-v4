import React, { PureComponent } from 'react';
import './Deliberate.scss';

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
      visibleEventIndex: -1,

      voting: {
        callerId: null,
        callerName: null,
        resultsShow: false,
        show: false,
        won: false
      }
    };

    this.socket = null;
    this.eventCountdown = null;
    this.timerStart = this.timerStart.bind(this);
    this.timerEnd = this.timerEnd.bind(this);
  }

  componentDidMount() {
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
      if (!this.state.isFacilitator) {
        this.setState({ screenIndex: this.state.screenIndex + 1 });
      }
    });

    // Tell non-fac to show event
    this.socket.on('player:show_event', data => {
      this.setState({
        showEvent: true,
        visibleEventIndex: data
      });
    });

    // Show voting
    this.socket.on('player:call_vote', data => {
      this.setState({
        voting: {
          show: true,
          callerName: data.username
        }
      });
    });

    // Show voting result
    this.socket.on('players:voted', data => {
      console.log(this.isFacilitator, data.yes);

      // If vote won, facilitator just moves to next phase
      if (this.state.isFacilitator && data.yes) {
        this.socket.emit('game:next', GameData.get().assemble());
        return;
      }

      this.setState({
        voting: {
          show: true,
          callerName: null,
          callerId: data.votecallerid,
          resultsShow: true,
          won: data.yes
        }
      });
    });

    // Close voting
    this.socket.on('players:vote_ended', data => {
      this.setState({
        voting: {
          show: false
        }
      });
    });
  }

  componentDidUpdate() {
    console.log('DATA', this.props.data);
  }

  componentWillUnmount() {
    // Cleanup
    clearTimeout(this.eventCountdown);
  }

  // Send that player is ready
  playerReady() {
    this.socket.emit('game:ready', GameData.get().assemble());
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
    if (process.env.NODE_ENV === 'development') time = 1;

    this.eventCountdown = setTimeout(() => {
      this.showEvent();
    }, time * 1000);
  }

  showEvent() {
    // Increment visible event and show
    this.setState({
      showEvent: true,
      visibleEventIndex: this.state.visibleEventIndex + 1
    });

    clearTimeout(this.eventCountdown);
  }

  eventAction(state, evtIndex) {
    this.socket.emit(
      'game:event',
      GameData.get().assemble({
        state,
        index: evtIndex
      })
    );

    // Hide events and restart queue
    this.setState({ showEvent: false });
    this.startEventQueue();
  }

  dismissEvent() {
    this.setState({ showEvent: false });
  }

  render() {
    const {
      allPlayersReady,
      isFacilitator,
      notReady,
      screenIndex,
      showEvent,
      timerStarted,
      timerEnded,
      visibleEventIndex,
      voting
    } = this.state;
    const { data } = this.props;
    const isVoteCaller = sessionStorage.getItem('uUID') === voting.callerId;

    return (
      <div>
        <Interstitial title="Deliberation" />

        {screenIndex === 0 && (
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

            {!isFacilitator &&
              (notReady ? (
                <button
                  id="btn-ready"
                  className="btn submit player"
                  type="submit"
                  name="submit"
                  onClick={() => {
                    this.playerReady();
                  }}
                >
                  Ready
                </button>
              ) : (
                <button type="button">Waiting</button>
              ))}
          </div>
        )}

        {/* Player ready/is deliberating */}
        {screenIndex === 1 && (
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
                  {data.events.map(
                    (evt, i) =>
                      // Show event only if it's the one broadcast
                      visibleEventIndex === i &&
                      showEvent && (
                        <div
                          key={i}
                          className="event"
                          onClick={() => this.dismissEvent()}
                        >
                          <div className="content">
                            <h3>Breaking News</h3>
                            <div>{evt.text}</div>
                            <span>(tap to dismiss)</span>
                          </div>
                        </div>
                      )
                  )}
                </div>

                <h2>Team's Needs</h2>
                <div className="grid">
                  {Object.keys(data.players).map(id => {
                    const player = data.players[id];
                    const classStr = `player${
                      player.isFacilitator ? ' facilitator' : ''
                    }`;

                    return (
                      <div className={classStr} key={id}>
                        <div>
                          <b>{player.username}</b>
                          <br />
                          {!player.isFacilitator ? (
                            <div>
                              <span>{player.role.needs[0]}</span>
                              <br />
                              <span>{player.role.needs[1]}</span>
                            </div>
                          ) : (
                            <span>Facilitator</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    this.socket.emit(
                      'player:call_vote',
                      GameData.get().assemble()
                    )
                  }
                >
                  Call vote
                </button>
              </div>
            )}

            {/* Show 'random' events to facilitator */}
            {isFacilitator && (
              <div id="events">
                {data.events.map(
                  (evt, i) =>
                    // Show event only if it's the current one in state
                    visibleEventIndex === i &&
                    showEvent && (
                      <div key={i} className="event">
                        <div className="content">
                          <div>
                            <h3>New Event</h3>
                            <h1>{evt.text}</h1>
                          </div>

                          <div className="buttons">
                            {/* Tooltip on first event */}
                            {i === 0 && (
                              <span className="tooltip-content">
                                You can choose to accept or ignore events that
                                will complicate players' solutions.
                              </span>
                            )}

                            <button
                              id="btn-confirm"
                              type="submit"
                              name="submit"
                              onClick={() => {
                                this.eventAction('accept', i);
                              }}
                            >
                              &#x2714;
                            </button>

                            <button
                              id="btn-reject"
                              type="submit"
                              name="submit"
                              onClick={() => {
                                this.eventAction('reject', i);
                              }}
                            >
                              &#65794;
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            )}

            {/* Timer over */}
            {timerEnded && (
              <div id="time-up">
                <CdnImage
                  publicId="v1540488090/at-stake/bg/clock"
                  width={319}
                  format="png"
                />
                <h1>Time's up!</h1>
                <p>This would be a good time to call to vote.</p>
              </div>
            )}
          </div>
        )}

        {/* Voting screen */}
        {voting.show && (
          <div id="vote">
            <Instructions
              show={isFacilitator}
              heading="Call To Vote"
              body="Listen to the proposal. If it passes, you will have to rate it."
            />

            <Instructions
              show={!isFacilitator}
              heading="Call To Vote"
              body="Listen to the proposal. Decide if the proposal fits your needs."
            />

            <Speech
              facilitator={isFacilitator}
              body="Problem Scenario"
              subBody={data.question}
              bold
            />

            {isFacilitator && (
              <div>
                <CdnImage
                  publicId="v1541693946/at-stake/icons/ballotbox-black"
                  width={200}
                  format="png"
                />
                <h1>{`${voting.callerName} called a vote!`}</h1>
              </div>
            )}

            {!isFacilitator && (
              <div id="content" className="content">
                <CdnImage
                  publicId="v1541693946/at-stake/icons/ballotbox"
                  width={200}
                  format="png"
                />

                <h1>{`${voting.callerName} called a vote!`}</h1>
                <h2>Are you satisfied with this proposal?</h2>

                <button
                  id="btn-yes"
                  className="btn submit player"
                  type="submit"
                  onClick={() => {
                    this.socket.emit(
                      'player:vote',
                      GameData.get().assemble({ yes: true })
                    );
                  }}
                >
                  Yes
                </button>

                <button
                  id="btn-no"
                  className="btn submit player"
                  type="submit"
                  onClick={() => {
                    this.socket.emit(
                      'player:vote',
                      GameData.get().assemble({ yes: false })
                    );
                  }}
                >
                  No
                </button>
              </div>
            )}

            {voting.resultsShow && !voting.won && (
              <div id="results" className="content player">
                <h1>Not everyone agreed with the proposal.</h1>

                {isVoteCaller ? (
                  <div>
                    <p>Revise your proposal and submit again.</p>
                    <button
                      id="btn-try-again"
                      type="submit"
                      name="submit"
                      onClick={() => {
                        this.socket.emit(
                          'player:vote_end',
                          GameData.get().assemble()
                        );
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div id="voter">
                    {`Waiting for ${voting.callerName} to dismiss the vote`}
                  </div>
                )}
              </div>
            )}
            {/* end voting screen */}
          </div>
        )}
      </div>
    );
  }
}

const DeliberateWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Deliberate {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default DeliberateWithSocket;
