import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

class Decks extends Component {
  callback(deck) { }


  render() {
    const { decks, callback } = this.props;

    return (

      <ButtonGroup>
        {decks && decks.map((deck, i) => (
          <Row>
            <Col>
              <Button key={deck._id} variant="secondary" size="lg" onClick={() => callback(deck)}>
                {deck.name}
              </Button>
            </Col>
          </Row>
        ))}
      </ButtonGroup>
    );
  }
}

Decks.defaultProps = {
  callback: Decks.callback,
  decks: {},
};

Decks.propTypes = {
  callback: PropTypes.func,
  decks: PropTypes.arrayOf(PropTypes.object),
};

export default Decks;
