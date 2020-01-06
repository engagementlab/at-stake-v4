import React, { PureComponent } from 'react';
import './Meet.scss';

import Socket from '../../../GameData';

import Interstitial from '../../Shared/Interstitial/Interstitial';
import Rolecard from '../../Shared/Rolecard/Rolecard';


class Meet extends PureComponent { 
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
    };
    
    this.socket = null;
  }

  componentDidMount = () => {
    
    this.socket = Socket.get();
    
    // Listeners
    // this.socket._current.on('game:next_screen', (data) => {
      
      //   this.setState({ screenIndex: this.state.screenIndex+1 });
      
      // });
      
    }
    
  componentDidUpdate = () => {
    console.log('DATA', this.props.data)   
  }

  componentWillUnmount = () => {
    console.log('Meet will unmount');
  }

  render () {

    const data = this.props.data;

    return (
      <div>
  
        {/* MEET PHASE UI  */}
        <div id="meet">
      
        {/* ROLE */}
      
        {/* Skip if timer running */}
        {data && !data.timerRunning ?
          <div className="screen initial">
            <Rolecard intro={true} role={data.role} />
          </div>
          : null
        }

        <Interstitial title="Introduction" />

      </div>
      
        // PROBLEM
        <div className="screen bg form">
      
          {/* {{> component/instructions 
              decider=true
              heading="Introductions"
              body="Introduce your character and how this scenario impacts you. Try to mention your objective you need to meet."
          }}
      
          {{> component/instructions 
              heading="Introductions"
              body="Introduce your character and how this scenario impacts you. Try to mention your objective you need to meet."
          }}
      
          {{> component/speech
              body="Problem Scenario"
              secondary=question
              bold=true
          }} */}
          
          <button id="btn-ready" className={`btn submit player`} type="submit" name="submit" onClick={() => { this.props.socket.emit('game:ready'); }}>
            Ready
          </button>
      
          {/* {{> component/speech
              decider=true
              body="Problem Scenario"
              secondary=question
              bold=true
          }}
      
          {{> component/timer 
              decider=true
              disabled=true
          }} */}
      
          <div className="not-ready decider">Wait until every player is ready to continue</div>
          <div id="times-up" className="hide">Time’s up! Consider wrapping this discussion up</div>
          <button id="skip" className={`hide submit`} data-event="game:next">
            Skip to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
          <button id="go-to" className={`hide submit`} data-event="game:next">
            Go to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
           
        </div>
      
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
      
          <div id="time-up" className="player">
      
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/bg/clock' width='319'}}} */}
            <h1>Time's up!</h1>
          </div>
      
        </div>
      
      </div>
    );
  }
}

export default Meet;
