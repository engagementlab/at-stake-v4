import React from 'react';
import PropTypes from 'prop-types';

const Speech = (props) => {
  const { body, subBody } = props;

  return (
    <div className="SpeechWrapper">
      <hr />
      <p><em>{body}</em></p>
      <h5>{subBody}</h5>
      <hr />
    </div>
  );
};

Speech.propTypes = {
  body: PropTypes.string,
  bold: PropTypes.bool,
  facilitator: PropTypes.bool,
  subBody: PropTypes.string,
};

Speech.defaultProps = {
  body: 'Default Speech Text',
  bold: false,
  facilitator: false,
  subBody: 'Default Speech Secondary Text',
};

export default Speech;
