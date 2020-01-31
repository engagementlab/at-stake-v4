import React from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Speech = (props) => {
  const { body, subBody } = props;

  return (
    <>
      <hr />
      <Row className="SpeechWrapper">
        <Col>
          <p><em>{body}</em></p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h5>{subBody}</h5>
        </Col>
      </Row>
      <hr />
    </>
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
