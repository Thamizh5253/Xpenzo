import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   // Simulate API call
  //   console.log("Sending reset link to:", email);
  //   setSubmitted(true);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setIsLoading(true);
    // setError('');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }
  
      setSubmitted(true);
    } catch (err) {
      // setError(err.message || 'Something went wrong. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              Forgot Your Password?
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your registered email and we’ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition duration-200"
                // className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Email Sent!</h2>
            <p className="text-gray-600">
              If an account with that email exists, a password reset link has been sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
