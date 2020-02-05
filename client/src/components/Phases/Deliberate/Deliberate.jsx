import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';

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
        won: false,
      },
    };

    this.socket = null;
    this.eventCountdown = null;
    this.timerStart = this.timerStart.bind(this);
    this.timerEnd = this.timerEnd.bind(this);
    this.timerData = null;
  }

  componentDidMount() {
    const { role, socket, data } = this.props;
    // Set if facilitator
    this.setState({
      isFacilitator: role.isFacilitator,
    });

    this.socket = socket;

    /* Socket Listeners */

    // Tell facilitator all players ready for deliberation and advance screen
    this.socket.on('game:ready', () => {
      const { screenIndex } = this.state;

      this.setState({
        allPlayersReady: true,
        screenIndex: screenIndex + 1,
      });
    });

    this.socket.on('game:next_screen', () => {
      const { screenIndex, isFacilitator } = this.state;

      // Advance screen for non-fac
      if (!isFacilitator) {
        this.setState({ screenIndex: screenIndex + 1 });
      }
    });

    // Tell non-fac to show event
    this.socket.on('player:show_event', (socketData) => {
      this.setState({
        showEvent: true,
        visibleEventIndex: socketData,
      });
    });

    // Show voting
    this.socket.on('player:call_vote', (socketData) => {
      this.setState({
        voting: {
          show: true,
          callerName: socketData.username,
        },
      });
    });

    // Show voting result
    this.socket.on('players:voted', (socketData) => {
      const { isFacilitator } = this.state;

      // If vote won, facilitator just moves to next phase
      if (isFacilitator && socketData.yes) {
        this.socket.emit('game:next', GameData.get().assemble());
        return;
      }

      this.setState({
        voting: {
          show: true,
          callerName: null,
          callerId: socketData.votecallerid,
          resultsShow: true,
          won: socketData.yes,
        },
      });
    });

    // Close voting
    this.socket.on('players:vote_ended', (socketData) => {
      this.setState({
        voting: {
          show: false,
        },
      });
    });

    // If screen is refreshed, we check if timer should kick off
    if (data.timerRunning) {
      // Run timer w/ remaining duration by updating prop used by timer
      this.timerData = {
        timerLength: data.timerLength,
        timerDuration: data.timerDuration,
      };
      // Player is in ready state/is deliberating
      this.setState({ playerReady: true, screenIndex: 1 });
    }
  }

  componentDidUpdate() {
    const { data } = this.props;
    console.log('DATA', data);
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
      timerStarted: true,
    });

    // Begin event queue
    this.startEventQueue();
  }

  timerEnd() {
    this.setState({
      timerEnded: true,
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
    const { visibleEventIndex } = this.state;

    // Increment visible event and show
    this.setState({
      showEvent: true,
      visibleEventIndex: visibleEventIndex + 1,
    });

    clearTimeout(this.eventCountdown);
  }

  eventAction(state, evtIndex) {
    this.socket.emit(
      'game:event',
      GameData.get().assemble({
        state,
        index: evtIndex,
      }),
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
      voting,
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

            {/* FIXME: This doesn't switch this to "waiting" */}
            {!isFacilitator && (notReady ? (
              <Button
                variant="success"
                size="lg"
                onClick={() => {
                  this.playerReady();
                }}
              >
                Ready
              </Button>
            ) : (
              <Button
                variant="success"
                size="lg"
                disabled
              >
                Waiting
              </Button>
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
              isRunningData={this.timerData}
            />

            {/* Show team/events to non-facilitator */}
            {!isFacilitator && (
              <div>
                <div id="events">
                  {data.shared.events.map(
                    (evt, i) =>
                      // Show event only if it's the one broadcast
                      visibleEventIndex === i
                      && showEvent && (
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
                      ),
                  )}
                </div>

                <h2>Team's Needs</h2>
                <div className="grid">
                  {Object.keys(data.shared.roles).map((key) => {
                    const role = data.shared.roles[key];
                    const classStr = `player${role.isFacilitator ? ' facilitator' : ''}`;

                    return (
                      <div className={classStr} key={key}>
                        <div>
                          <b>{role.username}</b>
                          <br />
                          {!role.isFacilitator ? (
                            <div>
                              <span>{role.needs[0]}</span>
                              <br />
                              <span>{role.needs[1]}</span>
                            </div>
                          ) : (
                            <span>Facilitator</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => this.socket.emit(
                    'player:call_vote',
                    GameData.get().assemble(),
                  )}
                >
                  Call Vote
                </Button>
              </div>
            )}

            {/* Show 'random' events to facilitator */}
            {isFacilitator && (
              <div id="events">
                {data.shared.events.map(
                  (evt, i) =>
                    // Show event only if it's the current one in state
                    visibleEventIndex === i
                    && showEvent && (
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

                            <Button
                              id="btn-confirm"
                              variant="success"
                              size="lg"
                              onClick={() => {
                                this.eventAction('accept', i);
                              }}
                            >
                              &#x2714;
                            </Button>

                            <Button
                              id="btn-confirm"
                              variant="danger"
                              size="lg"
                              onClick={() => {
                                this.eventAction('reject', i);
                              }}
                            >
                              &#65794;
                            </Button>
                          </div>
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}

            {/* Timer over */}
            {timerEnded && (
              <div id="time-up">
                {/* FIXME: Image overlaps page size */}
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
                {!voting.resultsShow && (
                  <h1>{`${voting.callerName} called a vote!`}</h1>
                )}
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

                <Button
                  variant="success"
                  size="lg"
                  onClick={() => {
                    this.socket.emit(
                      'player:vote',
                      GameData.get().assemble({ yes: true }),
                    );
                  }}
                >
                  Yes
                </Button>

                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => {
                    this.socket.emit(
                      'player:vote',
                      GameData.get().assemble({ yes: true }),
                    );
                  }}
                >
                  No
                </Button>
              </div>
            )}

            {voting.resultsShow && !voting.won && (
              <div id="results" className="content player">
                <h1>Not everyone agreed with the proposal.</h1>

                {isVoteCaller ? (
                  <div>
                    <p>Revise your proposal and submit again.</p>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        this.socket.emit(
                          'player:vote_end',
                          GameData.get().assemble(),
                        );
                      }}
                    >
                      Try Again
                    </Button>
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

Deliberate.propTypes = {
  data: PropTypes.object.isRequired,
  role: PropTypes.shape({
    isFacilitator: PropTypes.bool,
    needs: PropTypes.arrayOf(PropTypes.string),
    username: PropTypes.string,
  }),
  socket: PropTypes.object.isRequired,
};

Deliberate.defaultProps = {
  role: {
    isFacilitator: false,
    needs: [
      'Default need one',
      'Default need two',
    ],
    username: 'Default Username',
  },
};

const DeliberateWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Deliberate {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default DeliberateWithSocket;
