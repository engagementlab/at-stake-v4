import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/Modal';
import Role from './Role/Role';

function Rolecard(props) {
  const { show, role } = props;
  const [setShow] = useState(false);

  const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header>
        <Modal.Title>{role.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Role data={role} />
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
  show: PropTypes.bool,
};

Rolecard.defaultProps = {
  role: PropTypes.shape({
    needs: ['Example need one', 'Example need two'],
    secretGoal: 'Example Secret Goal',
  }),
  show: false,
};

export default Rolecard;
