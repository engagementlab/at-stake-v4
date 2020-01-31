import React from 'react';
import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Role.scss';

function Role(props) {
  const { data } = props;
  return (
    <Container>
      <Row>
        <Col>
          {data.bio.html.map((block) => (
            <Row>
              <p>
                {block.replace('<p>', '').replace('</p>', '').replace(/&#39;/g, '\'')}
              </p>
            </Row>
          ))}
        </Col>
      </Row>

      {/* Do not show needs for facilitator */}
      {(data.needs && data.needs.length > 0) && (
      <Row>
        <Col>
          <Container>
            <Row>
              <Col>
                <h1 className="header">Needs</h1>
              </Col>
            </Row>

            {data.needs.map((need) => (
              <Row key={need} className="agenda-item">
                <Col className="agenda">{need}</Col>
              </Row>
            ))}
          </Container>
        </Col>
      </Row>
      )}

      {/* Do not show goal for facilitator */}
      {data.secretGoal && (
      <Row>
        <Col>
          <Container>
            <Row>
              <Col>
                <h1 className="header">
                  <span className="star">&#9733;</span>
                  Secret Goal
                  <span className="star">&#9733;</span>
                </h1>
              </Col>
            </Row>
            <Row>
              <Col>
                {data.secretGoal}
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
      )}

    </Container>
  );
}

Role.propTypes = {

  data: PropTypes.shape({
    title: PropTypes.string.isRequired,
    bio: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
    needs: PropTypes.arrayOf(PropTypes.string),
    secretGoal: PropTypes.string,
  }),
};

Role.defaultProps = {
  data: null,
};

export default Role;
