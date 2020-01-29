/*
  COMPONENT: Timer
  @param {Bool} disabled - Timer button disabled state
*/

import React, { PureComponent } from 'react';
import PropTypes, { number } from 'prop-types';

import moment from 'moment';
import GameData from '../../../GameData';
import SocketContext from '../../../SocketContext';


class Timer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      countdown: true,
      countdownDuration: number,
      countdownLabel: '',
    };

    this.clockInterval = null;
  }

  componentDidMount() {
    const { socket, started, isRunningData } = this.props;
    /* Socket Listeners */

    // Start countdown
    socket.on('game:countdown', (data) => {
      this.startTimer(data.duration);

      if (started) started();
    });

    // Is timer already running based on prop data from parent?
    if (isRunningData) {
      const data = isRunningData;
      this.startTimer(data.timerLength, data.timerDuration);
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    // Cleanup
    clearTimeout(this.clockInterval);
    socket.off('game:countdown');
  }

  startTimer(timerDuration, timerCurrent) {
    let currentTime = timerCurrent ? timerCurrent * 1000 : 0;
    const maxDuration = timerDuration * 1000;

    this.clockInterval = setInterval(() => {
      currentTime += 1000;
      const perc = (currentTime / maxDuration) * 100;
      // timer.css('background',
      //     'linear-gradient(90deg, #0067d8 ' + perc + '%, #000 ' + perc + '%)');
      this.setState({
        countdownLabel: moment()
          .startOf('day')
          .add(currentTime)
          .format('mm:ss'),
      });

      if (perc === 100) {
        clearInterval(this.clockInterval);
        // timer.addClass('done');
        // timer.removeClass('running');
        // timer.css('background', '');
        // $('#skip').fadeOut(function() {
        //     $('#times-up, #go-to').fadeIn();
        // });

        if (this.props.done) this.props.done();
      }
    }, 1000);
  }

  render() {
    const { countdownLabel } = this.state;
    const { show, disabled, socket } = this.props;

    return (
      // TIMER at 0
      <div className="timer-wrap">
        {show ? (
          <div>
            <button
              id="btn-start-timer"
              type="button"
              className={disabled ? 'disabled' : ''}
              disabled={disabled ? 'disabled' : null}
              onClick={() => {
                socket.emit(
                  'game:start_timer',
                  GameData.get().assemble(),
                );
              }}
            >
              <h1>Start Timer</h1>
            </button>

            <div>{countdownLabel}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

Timer.propTypes = {
  socket: PropTypes.any,
  facilitator: PropTypes.bool,
  disabled: PropTypes.bool,
  show: PropTypes.bool,
  isRunningData: PropTypes.object,
};

Timer.defaultProps = {
  facilitator: false,
  disabled: true,
  show: false,
};

const TimerWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Timer {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default TimerWithSocket;
