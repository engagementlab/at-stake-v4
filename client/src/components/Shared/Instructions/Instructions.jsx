import React from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Instructions = (props) => {
  const { heading, body } = props;

  return (
    <>
      <Row>
        <Col>
          <h3>{heading}</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>{body}</p>
        </Col>
      </Row>
    </>
  );
};

Instructions.propTypes = {
  body: PropTypes.string,
  heading: PropTypes.string,
  subBody: PropTypes.string,
};

Instructions.defaultProps = {
  body: 'Default Body Text',
  heading: 'Default Instructions',
  subBody: 'Default Sub-body Text',
};

export default Instructions;
