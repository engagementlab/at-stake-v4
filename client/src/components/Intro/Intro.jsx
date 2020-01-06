import React, { PureComponent } from 'react';

import Socket from '../../GameData';

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
    const { text, screenIndex } = this.state;
    const imageNames = ['street', 'evil', 'city', 'bunker'];
    const isHost = this.props.host;

    return (
      
      [0, 1, 2, 3].map((index) => {
        return (
          <div>
            {(screenIndex === index) ?
              <div className="intro panel">

                <div className="content">
                  <img src={"https://res.cloudinary.com/engagement-lab-home/image/upload/c_scale,f_auto,w_425/v1540490701/at-stake/bg/" + imageNames[index]} alt="Intro screen 1 image" />
                
                  <div className="text">{text[index]}</div>
                </div>
            
                {
                  isHost ?
                    <button className="submit" onClick={() => this.socket.send(screenIndex === 3 ? 'game:start' : 'game:next_screen')}>
                      <img src="https://res.cloudinary.com/engagement-lab-home/image/upload/v1540488090/at-stake/icons/check-btn.svg" alt="Go to next screen" />
                    </button>
                  : null
                }

              </div>
            : null}
          </div>
        )
      })

    );
  }
}
export default Intro;
