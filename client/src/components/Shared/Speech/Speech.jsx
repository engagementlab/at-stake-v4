import React from 'react';
import PropTypes from 'prop-types';

const Speech = (props) => (
  <div className="SpeechWrapper">
    <hr />
    <p><em>{props.body}</em></p>
    <h5>{props.subBody}</h5>
    <hr />
  </div>
);

Speech.propTypes = {  
  facilitator: PropTypes.bool,
  body: PropTypes.string,
  subBody: PropTypes.string,
  bold: PropTypes.bool
};

Speech.defaultProps = {  
  body: 'Speech Text',
  subBody: 'Speech Secondary Text'
};

export default Speech;
