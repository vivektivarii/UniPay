import React from 'react';

export const Button = ({ variant = 'primary', children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    white: 'bg-white text-blue-600 hover:bg-gray-100',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
