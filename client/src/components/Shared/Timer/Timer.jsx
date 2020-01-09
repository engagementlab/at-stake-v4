/* 
  COMPONENT: Timer 
  @param {Bool} preview - Just show timer 'start' button?
  @param {Bool} stopwatch - 
  @param {Bool} button - Timer is start button for decider?
  @param {String} body - Speech bubble body text for when 'preview' is true
*/

import React, { PureComponent } from 'react';
import PropTypes, { number } from 'prop-types';
import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

class Timer extends PureComponent { 
  
  constructor(props) {
    super(props);

    this.state = {

      countdown: true,
      countdownDuration: number

    }
  }

  componentDidMount = () => {
 
    /* Socket Listeners */

    // Start countdown
    this.socket.on('game:countdown', () => {
      
    });
      
  }

  render() {

    return (

      // TIMER at 0
      <div className="timer-wrap">
        {this.props.facilitator ? (
        
          <button 
            id="btn-start-timer" 
            className={this.props.disabled ? ("disabled") : ""} 
            disabled={this.props.disabled ? ("disabled") : null}
            onClick={() => { 
              this.props.socket.emit('game:start_timer', GameData.get().assemble()); 
            }}
            >

            <h1>
                Start Timer
            </h1>

          </button>

        ) : null}
      </div>

    );
  
  }

}

Timer.propTypes = {
  socket: PropTypes.any,
  facilitator: PropTypes.bool,
  disabled: PropTypes.bool
};

Timer.defaultProps = {
  // bla: 'test',
};

const TimerWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Timer {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default TimerWithSocket;
