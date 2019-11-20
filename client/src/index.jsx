import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import Config from './config/config';

ReactDOM.render(<App cloudName={Config.cloud_name} />, document.getElementById('root'));
