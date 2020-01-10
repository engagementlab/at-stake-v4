/* 
  COMPONENT: Timer 
  @param {Bool} disabled - Timer button disabled state
*/

import React, { PureComponent } from 'react';
import PropTypes, { number } from 'prop-types';

import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';

import moment from 'moment';

class Timer extends PureComponent { 
  
  constructor(props) {
    super(props);

    this.state = {

      countdown: true,
      countdownDuration: number,
      countdownLabel: ''

    }
  }

  componentDidMount = () => {
 
    /* Socket Listeners */

    // Start countdown
    this.props.socket.on('game:countdown', (data) => {
      this.startTimer(data.duration); 

      if(this.props.started) this.props.started();
    });
      
  }

  startTimer(timerDuration, timerCurrent) {

    var currentTime = timerCurrent ? timerCurrent*1000 : 0,
    maxDuration = timerDuration*1000;

    let clockInterval = setInterval(() => {
    
      currentTime += 1000;
      var perc = (currentTime/maxDuration)*100;
      // timer.css('background', 
      //     'linear-gradient(90deg, #0067d8 ' + perc + '%, #000 ' + perc + '%)'); 
      this.setState({ countdownLabel: moment().startOf("day").add(currentTime).format('mm:ss') });

      if(perc === 100) {

          clearInterval(clockInterval);
          // timer.addClass('done');
          // timer.removeClass('running');
          // timer.css('background', '');
          // $('#skip').fadeOut(function() {
          //     $('#times-up, #go-to').fadeIn();
          // });

          if(this.props.done) this.props.done();

      }

  }, 1000);
  }

  render() {

    let { countdownLabel } = this.state;

    return (

      // TIMER at 0
      <div className="timer-wrap">
        {this.props.show ? (

          <div>
        
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

            <div>
              {countdownLabel}
            </div>

          </div>

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
