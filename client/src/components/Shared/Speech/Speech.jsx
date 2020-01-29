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
  facilitator: PropTypes.bool,
  body: PropTypes.string,
  subBody: PropTypes.string,
  bold: PropTypes.bool,
};

Speech.defaultProps = {
  body: 'Speech Text',
  subBody: 'Speech Secondary Text',
  bold: false,
  facilitator: false,
};

export default Speech;
