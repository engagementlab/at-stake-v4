import React from 'react';
import PropTypes from 'prop-types';
//import { Test } from './Rolecard.styles';

const Rolecard = (props) => (
  <div className="RolecardWrapper">
    {props.role.title}
  </div>
);

Rolecard.propTypes = {
  intro: PropTypes.bool,
  role: PropTypes.object,
};

export default Rolecard;
