/*
  COMPONENT: Timer
  @param {Bool} disabled - Timer button disabled state
*/

import React, { PureComponent } from 'react';
import PropTypes, { number } from 'prop-types';

import Button from 'react-bootstrap/Button';

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
    this.showButton = true;
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
      const { timerLength, timerDuration } = isRunningData;
      this.startTimer(timerLength, timerDuration);
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    // Cleanup
    clearTimeout(this.clockInterval);
    socket.off('game:countdown');
  }

  startTimer(timerDuration, timerCurrent) {
    const { done } = this.props;

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

        if (done) done();
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
            {this.showButton && (
            <Button
              id="btn-start-timer"
              variant="info"
              size="lg"
              disabled={disabled}
              onClick={() => {
                this.showButton = false;
                socket.emit(
                  'game:start_timer',
                  GameData.get().assemble(),
                );
              }}
            >
              <h1>Start Timer</h1>
            </Button>
            )}

            <div>{countdownLabel}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

Timer.propTypes = {
  disabled: PropTypes.bool,
  done: PropTypes.func.isRequired,
  facilitator: PropTypes.bool,
  isRunningData: PropTypes.shape({
    timerDuration: PropTypes.number,
    timerLength: PropTypes.number,
  }),
  show: PropTypes.bool,
  socket: PropTypes.object,
  started: PropTypes.func,
};

Timer.defaultProps = {
  disabled: true,
  facilitator: false,
  isRunningData: {
    timerDuration: 5,
    timerLength: 5,
  },
  show: false,
  started: null,
};

const TimerWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Timer {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default TimerWithSocket;
