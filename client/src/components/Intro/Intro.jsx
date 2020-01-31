import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Socket from '../../GameData';
import CdnImage from '../Util/CdnImage/CdnImage';


class Intro extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {

      screenIndex: 0,
      text: [],

    };

    this.socket = null;
  }

  componentDidMount() {
    const { socket } = this.props;
    this.socket = socket;

    // Listeners
    this.socket.on('game:next_screen', (data) => {
      const { screenIndex } = this.state;
      this.setState({ screenIndex: screenIndex + 1 });
    });

    // Get intro text
    this.getData();
  }

  async getData() {
    fetch(`${process.env.REACT_APP_API_URL}/api/data/get/intro`)
      .then((response) => response.json())
      .then((response) => {
        this.setState({ text: response[0].text });
      });
  }

  render() {
    const { text, screenIndex } = this.state;
    const imageNames = ['street', 'evil', 'city', 'bunker'];
    const { host } = this.props;

    return (

      [0, 1, 2, 3].map((index) => (
        <Container>
          {(screenIndex === index) ? (
            <div className="intro panel">

              <div className="content">
                <CdnImage
                  publicId={`v1540490701/at-stake/bg/${imageNames[index]}`}
                  width={425}
                  format="png"
                />
                <div className="text">{text[index]}</div>
              </div>

              { host ? (
                <Button
                  variant="info"
                  size="lg"
                  onClick={() => this.socket.emit(screenIndex === 3 ? 'game:start' : 'game:next_screen')}
                >
                  <CdnImage
                    publicId="v1540488090/at-stake/icons/check-btn"
                    format="svg"
                  />
                </Button>
              ) : null }

            </div>
          ) : null }
        </Container>
      ))
    );
  }
}

Intro.propTypes = {
  host: PropTypes.bool,
  socket: PropTypes.object.isRequired,
};

Intro.defaultProps = {
  host: false,
};

export default Intro;
