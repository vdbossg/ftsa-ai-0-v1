// src/components/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 40, color = '#00d8ff', className = '' }) => {
  const style = {
    width: size,
    height: size,
    borderColor: `${color} transparent transparent transparent`,
  };

  return (
    <div
      className={`loading-spinner ${className}`}
      style={style}
      aria-label="Loading"
    />
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
