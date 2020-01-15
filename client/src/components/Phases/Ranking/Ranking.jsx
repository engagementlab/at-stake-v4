import React, { PureComponent } from 'react';
import './Ranking.scss';
import SocketContext from '../../../SocketContext';
import Instructions from '../../Shared/Instructions/Instructions';

class Ranking extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount = () => {
    
    this.socket = this.props.socket;

    /* Socket Listeners */

    // Tell facilitator all players ready for intros
    this.socket.on('game:ready', () => {

      this.setState({ allPlayersReady: true });

    });

  }

  componentWillUnmount = () => {
    console.log('Ranking will unmount');
  }

  render () {

    const { isFacilitator } = this.state,
          data = this.props.data;
    
    // RANKING UI
    return (
      <div id="ranking">
      
        {/* WAIT FOR RANK */}
        <div class="screen player">
      
          <Instructions
            heading="Call To Vote"
          />
      
          <div id="content" class="content">
      
                  <h1>Everyone agreed with the proposal!</h1>
                  Wait as the facilitator reviews.
      
              </div>
      
              <div id="results">
                  
              </div>
          
        </div>
      
        {/* RANKING */}
        <div class="screen decider">
      
          <Instructions
              show={isFacilitator}
              heading="Vote Ranking"
              body="Rate how well the team's proposal meets the criteria below."
          />
      
          <div id="pt1">
            <h2>Did the team meet any secret goals?</h2>

            {/* Show all player secret goals */}
            {Object.keys(data.players).map((id, i) => {

                let player = data.players[id];

                return (
                    <div class="check toggle">              
                    <p>{player.username}</p>
                    <div class="goal">{player.secretGoal}</div>

                    <label class="switch">
                        {i === 0 &&
                          <span class="tooltip-content">When a player meets their secret goal, you can check it off. They'll score extra points at the end of the game.</span>
                        }
                        {player.goalMet ?
                          <input type="checkbox" checked="checked" disabled="disabled" />
                          :
                          <input type="checkbox" class="btn submit" data-event="player:met_goal" data-package='{"uid":"{uid}"}' />
                        }
                        <span class="slider round">
                        </span>
                    </label>
                </div>
)
            })}
          </div>
  
              <div id="pt2" class="form">
                  <h2>Did the team meet their needs?</h2>
      
                  {Object.keys(data.players).map((id, i) => {
                    let player = data.players[id];
                    return (
                      <div class="toggle">
                          <p>{player.username}</p>
                          <div class="needs"> 
                              <div class="need">

                                  <label class="switch">
                                      <input type="checkbox" class="btn submit" data-event="player:met_need" data-package='{"uid":"{uid}", "index":"0"}' />
                                      <span class="slider round"></span>
                                  </label>
                                  
                                  <span>
                                    {player.needs ? player.needs[0] : 'Example need 1'}
                                  </span>

                              </div>
                              <div class="need">

                                  <label class="switch">
                                      <input type="checkbox" class="btn submit" data-event="player:met_need" data-package='{"uid":"{uid}", "index":"0"}' />
                                      <span class="slider round"></span>
                                  </label>
                                  
                                  <span>
                                    {player.needs ? player.needs[1] : 'Example need 2'}
                                  </span>

                              </div>
                          </div>      
                          <hr />
                      </div>
               )
                  })}

            </div>
      
                       
              <div id="pt3" class="form">
      
                  <h2>Equity</h2>
                  <input type="range" id="equity" min="1" value="1" max="5" step="1" />
                  <div class="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
      
                  <h2>Inclusivity</h2>
                  <input type="range" id="inclusivity" min="1" value="1" max="5" step="1" />
                  <div class="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
      
                  <h2>Creativity</h2>
                  <input type="range" id="creativity" min="1" value="1" max="5" step="1" />
                  <div class="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
              </div>
          
          <button id="btn-ready" class="btn" type="submit" name="submit">
            Continue
          </button>
      
        </div>
      
      </div>
    );
  }
}

const RankingWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Ranking {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default RankingWithSocket;