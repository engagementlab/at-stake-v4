import React from 'react';
import PropTypes from 'prop-types';

function RankingRange(props) {
  const {
    id, min, max, value, onChangeFunc, onChangeTarget,
  } = props;

  return (
    <>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step="1"
        value={value}
        // FIXME: Need a way to update parent state from child object
        onChange={(e) => onChangeFunc(e, onChangeTarget)}
      />
      <div className="labels">
        {/* Construct an array [min - 1, ..., max - 1], then iterate over it */}
        {Array.from(Array(max).keys()).map((key) => (
          <span key={key}>{key + 1}</span>
        ))}
      </div>
    </>
  );
}

RankingRange.propTypes = {
  id: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChangeFunc: PropTypes.func.isRequired,
  onChangeTarget: PropTypes.number.isRequired,
};

RankingRange.defaultProps = {
  min: 1,
  max: 5,
};

export default RankingRange;
