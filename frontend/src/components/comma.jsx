import React from 'react';

export const NumberWithCommas = ({ value }) => {
  return (
    <div>
      <p>Formatted Number: {value.toLocaleString('en-IN')}</p>
    </div>
  );
};
