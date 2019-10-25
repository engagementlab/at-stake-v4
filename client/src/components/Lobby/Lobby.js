import React, { Component } from 'react';
import axios from 'axios';

import Decks from './Decks'

class Lobby extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: null,
			status: null
		};
		this.baseUrl = process.env.NODE_ENV === 'production' ? 'https://aaa.bbb' : 'http://localhost:3001';

		this.selectDeck = this.selectDeck.bind(this);
	}
	componentDidMount() {		
		fetch(this.baseUrl + '/api/generate')
			.then((response) => {
				return response.json()
			})
			.then((response) => {
				this.setState({
					data: response
				});
			})
	}

	async selectDeck(deck) {

        // Controller to abort fetch, if needed and duration counter
        const controller = new AbortController(),
			  signal = controller.signal;
			  
		let data = {};
		data.deciderName = 'Decider';

		// if(!data.deciderName) {
		// 	$('.submission .error').text('Please enter your name!').fadeIn();
		// 	return;
		// }

		data.deckId = deck._id;
		data.accessCode = this.state.data.code;

		const response = await axios.post(
			this.baseUrl + '/api/create',
			data,
			{ headers: { 'Content-Type': 'application/json' } }
		);

		if(response.data.sessionCreated) {
			this.setState({
				status: 'Session created'
			});
		}
	}

	render() {
			return (

			<div>
				{this.state.data ?
				(
				<div>
				<p>
					Room Code: {this.state.data.code}
				</p>
					<Decks decks={this.state.data.decks} callback={this.selectDeck} /> 
				</div>
				)
				: null}
				<p>
					<b>Lobby Status</b>: {this.state.status}
				</p>
			</div>
				
	)
  }
}
export default Lobby;
