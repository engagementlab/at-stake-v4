import React, { PureComponent } from 'react';
import './Meet.scss';

import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

import Interstitial from '../../Shared/Interstitial/Interstitial';
import Rolecard from '../../Shared/Rolecard/Rolecard';
import Instructions from '../../Shared/Instructions/Instructions';
import Speech from '../../Shared/Speech/Speech';
import Timer from '../../Shared/Timer/Timer';


class Meet extends PureComponent { 
  constructor(props) {
    super(props);
    
    this.state = {
      allPlayersReady: false,
      hasError: false,
      isFacilitator: false,
      notReady: true,
      rolecardShow: true
    };
    
    this.socket = null;
    this.proceedFromRolecard = this.proceedFromRolecard.bind(this);
  }

  componentDidMount = () => {

    // Set if facilitator
    this.setState({ isFacilitator: this.props.data.role.isFacilitator });

    this.socket = this.props.socket;
    
    /* Socket Listeners */

    // Tell facilitator all players ready for intros
    this.socket.on('game:ready', () => {
      
      this.setState({ allPlayersReady: true });
      
    });
      
  }
    
  componentDidUpdate = () => {
    console.log('DATA', this.props.data)
  }

  componentWillUnmount = () => {
    console.log('Meet will unmount');
  }

  proceedFromRolecard() {

    this.setState({ rolecardShow: false });

  }


  render () {

    const { notReady, allPlayersReady, isFacilitator, rolecardShow } = this.state;
    const data = this.props.data;

    return (
      <div>
  
        {/* MEET PHASE UI  */}
        <div id="meet">
      
        {/* ROLE */}
      
        {/* Skip if timer running */}
        {data && !data.timerRunning && rolecardShow ?
          <div className="screen initial">
            <Rolecard visible={rolecardShow} intro={true} role={data.role} close={this.proceedFromRolecard} />
          </div>
          : null
        }

        <Interstitial title="Introduction" />

      </div>
      
        {/* PROBLEM */}
        {!rolecardShow ?
        (
          <div className="screen bg form">

          <Instructions 
            heading="Introductions"
            body="Introduce your character and how this scenario impacts you. Try to mention your objective you need to meet."
            />
          
          <h1>{isFacilitator}</h1>
          {!isFacilitator && notReady ? (

            <button id="btn-ready" className={`btn submit player`} type="submit" name="submit" onClick={() => { 
              this.socket.emit('game:ready', GameData.get().assemble()); 
              this.setState({ notReady: false });
            }}>
              Ready
            </button>

          ) : null}

          <Timer socket={this.socket} facilitator={isFacilitator} disabled={!allPlayersReady} />

          <Speech
            facilitator={isFacilitator}
            body="Problem Scenario"
            subBody={this.props.data.shared.question}
            bold={true}
          />

          {isFacilitator && !allPlayersReady ? <div className="not-ready decider">Wait until every player is ready to continue</div> : null}

          {isFacilitator ? <div id="times-up" className="hide">Time’s up! Consider wrapping this discussion up</div> : null}
          <button id="skip" className={`hide submit`} data-event="game:next">
            Skip to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
          <button id="go-to" className={`hide submit`} data-event="game:next">
            Go to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
           
        </div>
        ) 
        : null}

        // QUESTION (NON-FACILITATOR)
        <div className="screen bg">
{/*       
          {{> component/instructions 
              decider=true
              heading="Introductions"
              body="Give each player an equal opportunity to introduce their character and how they are impacted by this scenario."
          }}
      
          {{> component/instructions 
              heading="Introductions"
          }}
      
          {{> component/speech
              body="Problem Scenario"
              secondary=question
              bold=true
          }}
      
          {{> component/speech
              decider=true
              body="Problem Scenario"
              secondary=question
              bold=true
          }}
       */}
       {!notReady ? (
          <div className="player-roles col-sm-6">
      
            <h3>Team's Roles</h3>
      
            <div className="grid">
              {/* {{#each playerMap}}
                <div className="player{{#if isFacilitator}} facilitator{{/if}}">
                  {{username}}
                  {{#if isFacilitator}}
                    <div>Facilitator</div>
                  {{else}}
                    <div>{{title}}</div>
                  {{/if}}
                </div>
              {{/each}} */}
            </div>
      
          </div>
       ) : null}
      
          <div id="time-up" className="player">
      
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/bg/clock' width='319'}}} */}
            <h1>Time's up!</h1>
          </div>
      
        </div>
      
      </div>
    );
  }
}

const MeetWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Meet {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default MeetWithSocket;