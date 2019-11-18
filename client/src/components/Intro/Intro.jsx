import React, { PureComponent } from 'react';

import Socket from '../../socket';

class Intro extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {

      screenIndex: 0,
      text: []
      
    };

    this.socket = null;
  }

  componentDidMount = () => {
    console.log('Intro mounted');

    this.socket = Socket.get();

    // Listeners
    this.socket._current.on('game:next_screen', (data) => {
      
      this.setState({ screenIndex: this.state.screenIndex+1 });

    });

    // Get intro text
    this.getData();
  }
  
  async getData() {

    fetch(`${process.env.REACT_APP_API_URL}/api/data/get/intro`)
    .then((response) => response.json())
    .then((response) => {

      this.setState({text: response[0].text});

    });
  
  }

  render () {
    const { text } = this.state;

    return (

      <div>
        <div className="intro panel">
    
        <button className="submit" onClick={() => this.socket.send('game:next_screen')}>
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/v1540488090/at-stake/icons/check-btn.svg" alt="Go to next screen" />
        </button>

        <div className="content">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,f_auto,w_425/v1540490701/at-stake/bg/street" alt="Intro screen 1 image" />
        
          <div className="text">{text[0]}</div>
        </div>

      </div>

      <div className="intro panel">
        <button className="submit" data-event="game:next_screen">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/v1540488090/at-stake/icons/check-btn.svg" alt="Go to next screen" />
        </button>
        <div className="content">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,f_auto,w_425/v1540490701/at-stake/bg/evil" alt="Intro screen 2 image" />
        
          <div className="text">{text[1]}</div>
        </div>
      </div>

      <div className="intro panel">
        <button className="submit" data-event="game:next_screen">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/v1540488090/at-stake/icons/check-btn.svg" alt="Go to next screen" />
        </button>
        <div className="content">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,f_auto,w_425/v1540490701/at-stake/bg/city" alt="Intro screen 3 image" />
          <div className="text">{text[2]}</div>
        </div>
      </div>

      <div className="intro panel">
        <button className="submit" data-event="game:start">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/v1540488090/at-stake/icons/check-btn.svg" alt="Start game" />
        </button>
        <div className="content">
          <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,f_auto,w_425/v1540490701/at-stake/bg/bunker" alt="Intro screen 4 image" />
          <div className="text">{text[3]}</div>
        </div>
      </div>
    </div>
    );
  }
}
export default Intro;
