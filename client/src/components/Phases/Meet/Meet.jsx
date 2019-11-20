import React, { PureComponent } from 'react';
import './Meet.scss';

import Interstitial from '../../Shared/Interstitial/Interstitial';
import Rolecard from '../../Shared/Rolecard/Rolecard';

class Meet extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentWillMount = () => {
    console.log('Meet will mount');
  }

  componentWillUnmount = () => {
    console.log('Meet will unmount');
  }

  render () {
    return (
<div>
  
        // MEET PHASE UI 
      <div id="meet">
      
        // ROLE
      
        // Skip if timer running
        {/* {{#ifeq timerRunning false}}
          <div class="screen initial">
            
            {{> shared/rolecard intro=true role=player.role}}
       */}

        <Interstitial title="Introduction" />
       {/* <Rolecard */}
       
        {/* {{/ifeq}} */}

      </div>
      
        // PROBLEM
        <div class="screen bg form">
      
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
          
          <button id="btn-ready" class="btn submit player" type="submit" name="submit" data-event="game:ready" data-package="timer">
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
      
          <div class="not-ready decider">Wait until every player is ready to continue</div>
          <div id="times-up" style="display:none">Time’s up! Consider wrapping this discussion up</div>
          <button id="skip" class="submit deciders" data-event="game:next" style="display:none;">
            Skip to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
          <button id="go-to" class="submit deciders" data-event="game:next" style="display:none;">
            Go to Phase 2
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/check-btn' format='svg'}}} */}
          </button>
           
        </div>
      
        // QUESTION (NON-FACILITATOR)
        <div class="screen bg">
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
          <div class="player-roles col-sm-6">
      
            <h3>Team's Roles</h3>
      
            <div class="grid">
              {/* {{#each playerMap}}
                <div class="player{{#if isFacilitator}} facilitator{{/if}}">
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
      
          <div id="time-up" class="player">
      
            {/* {{{cloudinaryUrl 'v1540488090/at-stake/bg/clock' width='319'}}} */}
            <h1>Time's up!</h1>
          </div>
      
        </div>
      
      </div>
    );
  }
}

export default Meet;
