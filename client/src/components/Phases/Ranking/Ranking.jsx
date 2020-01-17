import React, { PureComponent } from 'react';
import './Ranking.scss';
import SocketContext from '../../../SocketContext';
import Instructions from '../../Shared/Instructions/Instructions';
import GameData from '../../../GameData';

class Ranking extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      screenIndex: 1,
      ratingEquity: 1,
      ratingInclusivity: 1,
      ratingCreativity: 1,
    };

    this.needsMet = 0;
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

  nextScreen() {

    this.setState({
      screenIndex: this.state.screenIndex + 1
    });

  }

  playerMetGoal(id) {

    this.socket.emit('player:met_goal',
    GameData.get().assemble({
        uid: id
    }));

  }

  playerMetNeed(id, index) {

    // Cache increase for ranking submission
    this.needsMet++;

    this.socket.emit('player:met_need',
    GameData.get().assemble({
        uid: id,
        index: index
    }));

  }

  // Ranking sliders update
  sliderChange(evt, index) {

    let val = evt.currentTarget.value;
    let state = {};

    switch(index) {
      default:
      case 0:
        state = { ratingEquity: val };
        break;
      case 1:
        state = { ratingInclusivity: val };
        break;
      case 2:
        state = { ratingCreativity: val };
        break;
    }

    this.setState(state);

  }

  submitRating() {

  }

  render () {

    const { isFacilitator, ratingEquity, ratingCreativity, ratingInclusivity, screenIndex } = this.state,
          data = this.props.data;
    
    // RANKING UI
    return (
      <div id="ranking">
      
        {/* WAIT FOR RANK (Non-fac) */}
        {!isFacilitator && 
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
        }
      
        {/* RANKING */}
        <div className="screen decider">
      
          <Instructions
              show={isFacilitator}
              heading="Vote Ranking"
              body="Rate how well the team's proposal meets the criteria below."
          />
      
          {/* Goals */}
          {screenIndex === 0 &&
            <div id="pt1">
              <h2>Did the team meet any secret goals?</h2>

              {/* Show all player secret goals */}
              {data.players.map((player, i) => {

                return (
                  <div key={player.uid} className="check toggle">
                    <p>{player.username}</p>
                    <div className="goal">{player.secretGoal}</div>

                    <label className="switch">
                        {i === 0 &&
                          <span className="tooltip-content">When a player meets their secret goal, you can check it off. They'll score extra points at the end of the game.</span>
                        }

                        {player.goalMet ?
                          <input type="checkbox" checked="checked" disabled="disabled" />
                          :
                          <input type="checkbox" onClick={ () => this.playerMetGoal(player.uid) } />
                        }
                        <span className="slider round"></span>
                    </label>
                  </div>
                )

              })}
            </div>
          }

          {/* Needs */}
          {screenIndex === 1 &&
            <div id="pt2" className="form">
              <h2>Did the team meet their needs?</h2>

              {data.players && data.players.map((player, i) => {
                
                return (
                  <div key={player.uid} className="toggle">
                      <p>{player.username}</p>
                      <div className="needs"> 
                          <div className="need">

                              <label className="switch">
                                  <input type="checkbox" onClick={ () => this.playerMetNeed(player.uid, 0) } />
                                  <span className="slider round"></span>
                              </label>
                              
                              <span>
                                {player.needs ? player.needs[0] : 'Example need 1'}
                              </span>

                          </div>
                          <div className="need">

                              <label className="switch">
                                <input type="checkbox" onClick={ () => this.playerMetNeed(player.uid, 1) } />
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
          }

          {/* Rank */}
          {screenIndex === 2 &&
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
          }
      
          <button type="submit" name="submit" onClick={ () => { 
            screenIndex === 2 ? this.submitRating () : this.nextScreen()
          }}>
            { screenIndex === 2 ? 'Submit' : 'Continue' }
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