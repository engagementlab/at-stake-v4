import React from 'react';
import PropTypes from 'prop-types';
// import { Test } from './Instructions.styles';

const Instructions = (props) => {
  const { show, heading, body } = props;

  if (!show) return null;

  return (
    <div className="InstructionsWrapper">
      <h3>{heading}</h3>
      <p>{body}</p>
    </div>
  );
};

Instructions.propTypes = {
  body: PropTypes.string,
  heading: PropTypes.string,
  show: PropTypes.bool,
  subBody: PropTypes.string,
};

Instructions.defaultProps = {
  body: 'Body Text',
  heading: 'Instructions',
  show: false,
  subBody: 'Sub-body Text',
};

export default Instructions;
