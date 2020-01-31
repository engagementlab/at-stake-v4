import React from 'react';
import PropTypes from 'prop-types';

import { Image, Transformation } from 'cloudinary-react';

const CdnImage = (props) => {
  const { publicId, width, format } = props;

  return (
    <Image publicId={publicId} secure="true">
      <Transformation width={width} format={format} />
    </Image>
  );
};

CdnImage.propTypes = {
  format: PropTypes.string,
  publicId: PropTypes.string.isRequired,
  width: PropTypes.number,
};

CdnImage.defaultProps = {
  format: 'auto',
  width: 1080,
};

export default CdnImage;
