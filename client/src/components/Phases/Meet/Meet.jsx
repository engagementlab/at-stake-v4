import React, { PureComponent } from 'react';
import './Meet.scss';

import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

import CdnImage from '../../Util/CdnImage/CdnImage';
import Role from '../../Shared/Rolecard/Role/Role';
import Interstitial from '../../Shared/Interstitial/Interstitial';
import Instructions from '../../Shared/Instructions/Instructions';
import Speech from '../../Shared/Speech/Speech';
import Timer from '../../Shared/Timer/Timer';

class Meet extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      allPlayersReady: false,
      isFacilitator: false,
      notReady: true,
      rolecardShow: true,
      timerStarted: false,
      timerEnded: false,
    };

    this.socket = null;
    this.proceedFromRolecard = this.proceedFromRolecard.bind(this);
    this.timerStart = this.timerStart.bind(this);
    this.timerEnd = this.timerEnd.bind(this);
    this.timerData = null;
  }

  componentDidMount() {
    const { data, socket } = this.props;

    // Set if facilitator, if rolecard shows, & if timer is running (player is 'ready')
    const skipInitScreen = data.timerRunning;
    this.setState({
      isFacilitator: data.role.isFacilitator,
      rolecardShow: data.screen === 0,
      timerStarted: skipInitScreen,
      notReady: !skipInitScreen,
    });

    this.socket = socket;

    /* Socket Listeners */

    // Tell facilitator all players ready for intros
    this.socket.on('game:ready', () => {
      this.setState({ allPlayersReady: true });
    });

    // If screen is refreshed, we check if timer should kick off
    if (data.timerRunning) {
      // Run timer w/ remaining duration by updating prop used by timer
      this.timerData = {
        timerLength: data.timerLength,
        timerDuration: data.timerDuration,
      };
    }
  }

  componentDidUpdate() {
    const { data } = this.props;
    console.log('DATA', data);
  }

  componentWillUnmount() {
    this.socket.off('game:ready');
  }

  proceedFromRolecard() {
    this.setState({ rolecardShow: false });
  }

  timerStart() {
    this.setState({ timerStarted: true });
  }

  timerEnd() {
    this.setState({ timerEnded: true });
  }

  render() {
    const {
      allPlayersReady,
      isFacilitator,
      notReady,
      rolecardShow,
      timerStarted,
      timerEnded,
    } = this.state;
    const { data } = this.props;

    return (
      <div>
        {/* MEET PHASE UI */}
        <div id="meet">
          {/* ROLECARD */}

          {/* Skip if timer running */}
          {data && !data.timerRunning && rolecardShow && (
            <div>
              <h2>
Your role:
                {' '}
                <strong>
                  {data.role.title}
                </strong>

              </h2>
              <Role show data={data.role} />
              <button
                type="submit"
                name="submit"
                onClick={() => {
                  this.proceedFromRolecard();
                }}
              >
Continue

              </button>
            </div>
          )}

          <Interstitial title="Introduction" />
        </div>

        {/* ROLECARD VIEWED */}
        {!rolecardShow ? (
          <div className="screen">
            <Instructions
              show={!isFacilitator}
              heading="Introductions"
              body="Introduce your character and how this scenario impacts you. Try to mention your objective you need to meet."
            />
            <Instructions
              show={isFacilitator}
              heading="Introductions"
              body="Give each player an equal opportunity to introduce their character and how they are impacted by this scenario."
            />

            {!isFacilitator && notReady && (
              <button
                id="btn-ready"
                className="btn submit player"
                type="submit"
                name="submit"
                onClick={() => {
                  this.socket.emit('game:ready', GameData.get().assemble());
                  this.setState({ notReady: false });
                }}
              >
                Ready
              </button>
            )}

            <Timer
              show={isFacilitator}
              disabled={!allPlayersReady}
              started={this.timerStart}
              done={this.timerEnd}
              isRunningData={this.timerData}
            />

            <Speech
              facilitator={isFacilitator}
              body="Problem Scenario"
              subBody={data.shared.question}
              bold
            />

            {isFacilitator && !allPlayersReady ? (
              <div className="not-ready decider">
                Wait until every player is ready to continue
              </div>
            ) : null}

            {isFacilitator && timerEnded ? (
              <div id="times-up" className="hide">
                Time’s up! Consider wrapping this discussion up
              </div>
            ) : null}

            {/* Skip/go to next phase */}
            {timerStarted && isFacilitator && (
              <button
                type="button"
                id="skip-next"
                onClick={() => {
                  this.socket.emit('game:next', GameData.get().assemble());
                }}
              >
                {`${timerEnded ? 'Continue' : 'Skip'} to Phase 2`}
                <CdnImage
                  publicId="v1540488090/at-stake/icons/check-btn"
                  format="svg"
                />
              </button>
            )}
          </div>
        ) : null}

        {/* QUESTION (NON-FACILITATOR) */}
        <div className="screen bg">
          {/* Player ready */}
          {!notReady ? (
            <div className="player-roles col-sm-6">
              <h3>Team's Roles</h3>

              <div className="grid">
                {/* Show all player role names */}
                {Object.keys(data.shared.roles).map((key) => {
                  const role = data.shared.roles[key];

                  return (
                    <div key={key}>
                      <b>{role.username}</b>
                      <br />
                      {role.isFacilitator ? 'Facilitator' : role.title}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Timer over */}
          {timerEnded ? (
            <div id="time-up">
              <CdnImage
                publicId="v1540488090/at-stake/bg/clock"
                width={319}
                format="png"
              />
              <h1>Time's up!</h1>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const MeetWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Meet {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default MeetWithSocket;
