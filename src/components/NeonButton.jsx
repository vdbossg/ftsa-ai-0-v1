// src/components/NeonButton.jsx
import React from 'react';
import './NeonButton.css';

const NeonButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`neon-button neon-button--${variant} neon-button--${size} ${disabled ? 'neon-button--disabled' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default NeonButton;
