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
  show: PropTypes.bool,
  heading: PropTypes.string,
  body: PropTypes.string,
  subBody: PropTypes.string,
};

Instructions.defaultProps = {
  show: false,
  heading: 'Instructions',
  body: 'Body Text',
  subBody: 'Sub-body Text',
};

export default Instructions;
