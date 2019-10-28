import React, { Component, useState } from 'react';
import axios from 'axios';

import Socket from '../../socket';

import Decks from './Decks'

class Lobby extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: null,
			status: null,
			showDecks: true,
			joinCode: '',
			username: ''
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
				status: 'Session created',
				showDecks: false
			});
		}
	}

	playerJoin() {

		let playerUID = Math.floor(Math.pow(10, 10-1) + Math.random() * (Math.pow(10, 10) - Math.pow(10, 10-1) - 1));
		// Log player in
		Socket.get().send('login:submit', {username: this.state.username, code: this.state.joinCode, uid: playerUID });
	
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
						{this.state.showDecks && this.props.mode==='host' ?	<Decks decks={this.state.data.decks} callback={this.selectDeck} /> : null}
					</div>
				)
				: null}

				{ this.props.mode==='join' ?
				<p>
					Player Join:
					<input type="text" placeholder="room code" onChange={event => this.setState({joinCode: event.target.value})}></input>
					<input type="text" placeholder="name" onChange={event => this.setState({username: event.target.value})}></input>
					<button onClick={() => this.playerJoin()}>Join</button>
				</p> 
				: null
				}

				<p>
					<b>Lobby Status</b>: {this.state.status}
				</p>
			</div>
				
	)
  }
}
export default Lobby; 
