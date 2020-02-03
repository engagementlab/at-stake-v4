import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

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
      screenIndex: 0,
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
    console.log('data:', data);
    console.log('socket:', socket);

    // Set if facilitator, if rolecard shows, & if timer is running (player is 'ready')
    const skipInitScreen = data.timerRunning;
    this.setState({
      isFacilitator: data.role.isFacilitator,
      timerStarted: skipInitScreen,
      screenIndex: data.screen,
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
    this.setState({ screenIndex: 1 });
  }

  timerStart() {
    this.setState({ screenIndex: 2 });
  }

  timerEnd() {
    this.setState({ screenIndex: 3 });
  }

  render() {
    const {
      allPlayersReady,
      isFacilitator,
      notReady,
      rolecardShow,
      screenIndex,
      timerStarted,
      timerEnded,
    } = this.state;
    const { data } = this.props;

    return (
      <Container>
        {/* ROLECARD - FIRST SCREEN */}
        {/* Skipped if timer is running */}
        {screenIndex === 0 && (
          <>
            <Row>
              <Col>
                <h2>
                  Your role:
                  {' '}
                  <strong>{data.role.title}</strong>
                </h2>
              </Col>
            </Row>

            <Row>
              <Col>
                <Role show data={data.role} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => { this.proceedFromRolecard(); }}
                >
                  Continue
                </Button>
              </Col>
            </Row>
          </>
        )}

        <Interstitial title="Introduction" />

        {/* ROLECARD VIEWED - SECOND SCREEN */}
        {screenIndex === 1 && (
          <>
            <Row>
              <Col>
                <h2>Introductions</h2>
              </Col>
            </Row>
            <Row>
              <Col>
                {isFacilitator ? (
                  <Instructions
                    body={`Give each player an equal opportunity to introduce
                      their character and how they are impacted by this scenario.`}
                  />
                ) : (
                  <Instructions
                    body={`Introduce your character and how this scenario
                      impacts you. Try to mention your objective you need to meet.`}
                  />
                )}
              </Col>
            </Row>

            {/* Ready button for participants */}
            {!isFacilitator && notReady && (
              <Row>
                <Col>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => {
                      this.socket.emit('game:ready', GameData.get().assemble());
                      this.setState({ notReady: false });
                    }}
                  >
                    Ready
                  </Button>
                </Col>
              </Row>
            )}

            <Speech
              facilitator={isFacilitator}
              body="Problem Scenario"
              subBody={data.shared.question}
              bold
            />

            {isFacilitator && !allPlayersReady && (
              <Row className="not-ready decider">
                <Col>
                  <p>Wait until every player is ready to continue.</p>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* TIMER RUNNING - THIRD SCREEN */}
        {screenIndex === 2 && (
          <>
            <Row>
              <Col>
                {isFacilitator ? (
                  <Instructions
                    body={`Give each player an equal opportunity to introduce
                      their character and how they are impacted by this scenario.`}
                  />
                ) : (
                  <Instructions
                    body={`Introduce your character and how this scenario
                      impacts you. Try to mention your objective you need to meet.`}
                  />
                )}
              </Col>
            </Row>

            <Speech
              facilitator={isFacilitator}
              body="Problem Scenario"
              subBody={data.shared.question}
              bold
            />

            {/* List players & roles */}
            {!isFacilitator && (
              <>
                <Row>
                  <Col>
                    <h3>Team's Roles</h3>
                  </Col>
                </Row>

                <Table striped border size="sm" responsive="sm">
                  <thead>
                    <th>Player</th>
                    <th>Role</th>
                  </thead>

                  <tbody>
                    {/* Show all player role names */}
                    {Object.keys(data.shared.roles).map((key) => {
                      const role = data.shared.roles[key];
                      return (
                        <tr key={key}>
                          <td>{role.username}</td>
                          <td>{role.isFacilitator ? 'Facilitator' : role.title}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            )}

            {/* Skip to next phase */}
            <Row>
              <Col>
                {isFacilitator && (
                  <Button
                    variant="warning"
                    size="lg"
                    onClick={() => { this.socket.emit('game:next', GameData.get().assemble()); }}
                  >
                    Skip to Phase 2
                    <CdnImage publicId="v1540488090/at-stake/icons/check-btn" format="svg" />
                  </Button>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* TIMER OVER - FOURTH SCREEN */}
        {screenIndex === 3 && (
          // {/* Go to next phase */}
          isFacilitator ? (
            <>
              <Row>
                <Col>
                  <p>Time’s up! Consider wrapping this discussion up</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => { this.socket.emit('game:next', GameData.get().assemble()); }}
                  >
                    Go to Phase 2
                    <CdnImage publicId="v1540488090/at-stake/icons/check-btn" format="svg" />
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row>
                <Col>
                  <CdnImage
                    publicId="v1540488090/at-stake/bg/clock"
                    width={319}
                    format="png"
                  />
                </Col>
              </Row>
              <Row>
                <Col><h1>Time's up!</h1></Col>
              </Row>
            </>
          )
        )}

        <Timer
          show={isFacilitator && screenIndex >= 1}
          disabled={!allPlayersReady}
          started={this.timerStart}
          done={this.timerEnd}
          isRunningData={this.timerData}
        />
      </Container>
    );
  }
}

Meet.propTypes = {
  data: PropTypes.shape({
    connected: PropTypes.bool,
    decider: PropTypes.bool,
    name: PropTypes.string,
    phase: PropTypes.number,
    prior_roles: PropTypes.array,
    ready: PropTypes.bool,
    role: PropTypes.shape({
      __v: PropTypes.number,
      _id: PropTypes.string,
      bio: PropTypes.shape({
        html: PropTypes.array,
      }),
      dateCreated: PropTypes.string,
      isFacilitator: PropTypes.bool,
      needs: PropTypes.array,
      title: PropTypes.string,
    }),
    screen: PropTypes.number,
    shared: PropTypes.shape({
      decider: PropTypes.string,
      question: PropTypes.string,
      repeatScreen: PropTypes.bool,
      roles: PropTypes.object,
      timerRunning: PropTypes.bool,
    }),
    socket_id: PropTypes.string,
    timerDuration: PropTypes.number,
    timerLength: PropTypes.number,
    timerRunning: PropTypes.bool,
    uid: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  socket: PropTypes.shape({
    _callbacks: PropTypes.object,
    acks: PropTypes.object,
    connected: PropTypes.bool,
    disconnected: PropTypes.bool,
    flags: PropTypes.object,
    id: PropTypes.string,
    ids: PropTypes.number,
    io: PropTypes.object,
    json: PropTypes.object,
    nsp: PropTypes.string,
    receiveBuffer: PropTypes.array,
    sendBuffer: PropTypes.array,
    subs: PropTypes.array,
  }).isRequired,
};

const MeetWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Meet {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default MeetWithSocket;
