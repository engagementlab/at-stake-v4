import React, { Component } from 'react';

class Decks extends Component {

    callback(deck) {
       
    }


    render() {
        return (

        // {i === 0 ?( <div>Room Code: </div>) : (null)}
        this.props.decks && this.props.decks.map((deck, i) => {
            return (
                <a href="#" onClick={() =>  this.props.callback(deck)}>
                    <h2 className="deck">
                    <div className="header">
                    <span>{deck.name}</span>
                    {/* {{{cloudinaryUrl 'v1540488090/at-stake/icons/magnify' className='open' format='svg' alt='Magnifying glass icon'}}} */}
                    </div>
                
                    <div className="description">
                    {/* {deck.description} */}
                    </div>
                </h2>
                    </a>
            )
        })
        )
    }
}

export default Decks;