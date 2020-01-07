import React from 'react';
import PropTypes from 'prop-types';
//import { Test } from './Instructions.styles';

const Instructions = (props) => (
  <div className="InstructionsWrapper">
    <h3>{props.heading}</h3>
    <p>{props.body}</p>
  </div>
);

Instructions.propTypes = {
  facilitator: PropTypes.bool,
  heading: PropTypes.string,
  body: PropTypes.string,
  subBody: PropTypes.string
};

Instructions.defaultProps = {
  heading: 'Instructions',
  body: 'Body Text',
  subBody: 'Sub-body Text'
};

export default Instructions;
