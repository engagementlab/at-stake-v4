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

          // <button key={deck._id} type="button" onClick={() => callback(deck)}>
          //   <h2 className="deck">
          //     <div className="header">
          //       <span>{deck.name}</span>
          //       {/*
          //       {{{cloudinaryUrl 'v1540488090/at-stake/icons/magnify'
          //           className='open' format='svg' alt='Magnifying glass icon'}}}
          //       */}
          //     </div>

          //     <div className="description">
          //       {/* {deck.description} */}
          //     </div>
          //   </h2>
          // </button>
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
