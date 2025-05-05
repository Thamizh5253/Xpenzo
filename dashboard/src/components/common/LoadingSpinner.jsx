// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-12 h-12"></div>
    </div>
  );
};

export default LoadingSpinner;
