// src/components/StatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './StatusBadge.css';

const StatusBadge = ({ status = 'online', label, className = '' }) => {
  // Status can be 'online', 'offline', 'error', 'success', 'warning', 'busy'
  return (
    <span className={`status-badge status-badge--${status} ${className}`}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['online', 'offline', 'error', 'success', 'warning', 'busy']),
  label: PropTypes.string,
  className: PropTypes.string,
};

export default StatusBadge;
