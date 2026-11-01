import React from 'react';

const Spinner: React.FC<{ className?: string; label?: string }> = ({ className = 'w-5 h-5', label = 'Loading' }) => (
  <span
    role="status"
    aria-label={label}
    className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
  />
);

export default Spinner;
