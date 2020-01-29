import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Rolecard(props) {
  const { role } = props;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if (!(role && role.bio)) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{role.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <Row>
            <h2>Rolecard</h2>
          </Row>
          <Row>
            <Col>{role.bio.html}</Col>
          </Row>

          <Row>
            <Col>
              <Container>
                <Row>
                  <Col>
                    <h1 className="header">Needs</h1>
                  </Col>
                </Row>

                {role.needs.map((need) => (
                  <Row key={need} className="agenda-item">
                    <Col className="agenda">{need}</Col>
                  </Row>
                ))}
              </Container>
            </Col>
          </Row>

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
                    {role.secretGoal}
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

// const Rolecard = (props) => props.role && props.role.bio ? (
//     <div className="rolecard-inner inner">
//       <div className="role-info{{#unless intro}} card{{/unless}}">
//         {/* {{#unless intro}}
//             <button id="btn-close-role-card" className="btn" type="submit"
//              name="submit" data-keep_enabled="true">
//               {{{cloudinaryUrl '/v1540845195/at-stake/icons/close.svg' height=25}}}
//             </button>
//           {{/unless}} */}

//         {props.intro ? (
//           <button
//             id="btn-role-next"
//             className="btn next-step"
//             type="submit"
//             name="submit"
//             onClick={() => {
//               props.close();
//             }}
//           >
//             Continue
//           </button>
//         ) : null}
//       </div>
//     </div>
//   ) : null;

Rolecard.propTypes = {
  role: PropTypes.shape({
    title: PropTypes.string.isRequired,
    bio: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
    needs: PropTypes.arrayOf(PropTypes.string),
    secretGoal: PropTypes.string,
  }),
};

Rolecard.defaultProps = {
  role: PropTypes.shape({
    needs: ['Example need one', 'Example need two'],
    secretGoal: 'Example Secret Goal',
  }),
};

export default Rolecard;
