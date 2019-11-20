import React from 'react';
import PropTypes from 'prop-types';

import { Image, Transformation } from 'cloudinary-react';

const CdnImage = (props) => (
  
  <Image publicId={props.publicId} secure="true">
    <Transformation width={props.width} format={props.format} />
  </Image>

);

CdnImage.propTypes = {
  publicId: PropTypes.string,
  format: PropTypes.string,
  width: PropTypes.number
};

CdnImage.defaultProps = {
  publicId: null,
  width: 1080,
  format: 'auto'
};

export default CdnImage;
