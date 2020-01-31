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
  publicId: PropTypes.string.isRequired,
  format: PropTypes.string,
  width: PropTypes.number,
};

CdnImage.defaultProps = {
  width: 1080,
  format: 'auto',
};

export default CdnImage;
