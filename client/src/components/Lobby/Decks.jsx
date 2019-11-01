import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Decks extends Component {
  callback(deck) { }


  render() {
    const { decks, callback } = this.props;

    return (

      // {i === 0 ?( <div>Room Code: </div>) : (null)}
      decks && decks.map((deck, i) => {
        return (
          <button key={deck._id} type="button" onClick={() => callback(deck)}>
            <h2 className="deck">
              <div className="header">
                <span>{deck.name}</span>
                {/*
                {{{cloudinaryUrl 'v1540488090/at-stake/icons/magnify'
                    className='open' format='svg' alt='Magnifying glass icon'}}}
                */}
              </div>

              <div className="description">
                {/* {deck.description} */}
              </div>
            </h2>
          </button>
        );
      })
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
