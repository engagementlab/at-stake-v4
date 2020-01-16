import React, { PureComponent } from 'react';
import './Ranking.scss';
import SocketContext from '../../../SocketContext';
import Instructions from '../../Shared/Instructions/Instructions';

class Ranking extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      ratingEquity: 1,
      ratingInclusivity: 1,
      ratingCreativity: 1,
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

  sliderChange(evt) {

    console.log(evt)

  }

  render () {

    const { isFacilitator, ratingEquity, ratingCreativity, ratingInclusivity } = this.state,
          data = this.props.data;
    
    // RANKING UI
    return (
      <div id="ranking">
      
        {/* WAIT FOR RANK */}
        <div className="screen player">
      
          <Instructions
            heading="Call To Vote"
          />
      
          <div id="content" className="content">
      
                  <h1>Everyone agreed with the proposal!</h1>
                  Wait as the facilitator reviews.
      
              </div>
      
              <div id="results">
                  
              </div>
          
        </div>
      
        {/* RANKING */}
        <div className="screen decider">
      
          <Instructions
              show={isFacilitator}
              heading="Vote Ranking"
              body="Rate how well the team's proposal meets the criteria below."
          />
      
          <div id="pt1">
            <h2>Did the team meet any secret goals?</h2>

            {/* Show all player secret goals */}
            {data.players && Object.keys(data.players).map((id, i) => {

                let player = data.players[id];

                return (
                    <div className="check toggle">              
                    <p>{player.username}</p>
                    <div className="goal">{player.secretGoal}</div>

                    <label className="switch">
                        {i === 0 &&
                          <span className="tooltip-content">When a player meets their secret goal, you can check it off. They'll score extra points at the end of the game.</span>
                        }
                        {player.goalMet ?
                          <input type="checkbox" checked="checked" disabled="disabled" />
                          :
                          <input type="checkbox" className="btn submit" data-event="player:met_goal" data-package='{"uid":"{uid}"}' />
                        }
                        <span className="slider round">
                        </span>
                    </label>
                </div>
)
            })}
          </div>
  
              <div id="pt2" className="form">
                  <h2>Did the team meet their needs?</h2>
      
                  {data.players && Object.keys(data.players).map((id, i) => {
                    let player = data.players[id];
                    return (
                      <div className="toggle">
                          <p>{player.username}</p>
                          <div className="needs"> 
                              <div className="need">

                                  <label className="switch">
                                      <input type="checkbox" className="btn submit" data-event="player:met_need" data-package='{"uid":"{uid}", "index":"0"}' />
                                      <span className="slider round"></span>
                                  </label>
                                  
                                  <span>
                                    {player.needs ? player.needs[0] : 'Example need 1'}
                                  </span>

                              </div>
                              <div className="need">

                                  <label className="switch">
                                      <input type="checkbox" className="btn submit" data-event="player:met_need" data-package='{"uid":"{uid}", "index":"0"}' />
                                      <span className="slider round"></span>
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
      
                       
              <div id="pt3">
      
                  <h2>Equity</h2>
                  <input type="range" id="equity" min="1" max="5" step="1" value={ratingEquity} onChange={(e) => this.sliderChange(e, 0) } />
                  <div className="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
      
                  <h2>Inclusivity</h2>
                  <input type="range" id="inclusivity" min="1" max="5" step="1" value={ratingInclusivity} onChange={(e) => this.sliderChange(e, 1)  } />
                  <div className="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
      
                  <h2>Creativity</h2>
                  <input type="range" id="creativity" min="1" max="5" step="1" value={ratingCreativity} onChange={(e) => this.sliderChange(e, 2) } />
                  <div className="labels">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                  
              </div>
          
          <button id="btn-ready" className="btn" type="submit" name="submit">
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