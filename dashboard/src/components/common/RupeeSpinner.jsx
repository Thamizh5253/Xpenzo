import React from "react";

const RupeeSpinner = ({ message = "Loading Xpenzo..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-indigo-500 text-xl font-bold">
          ₹
        </div>
      </div>
      <p className="mt-6 text-gray-600 text-base font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default RupeeSpinner;
