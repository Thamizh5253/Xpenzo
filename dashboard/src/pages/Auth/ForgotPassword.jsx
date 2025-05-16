import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../utils/toaster";
import Header from "../../components/layouts/AuthHeader";
import BASE_URL from "../../config";
import axios from 'axios';
import { IoIosArrowRoundBack } from "react-icons/io";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorToast("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password/`, { email });
      const data = response.data;
      
      setSubmitted(true);
      showSuccessToast(data.message || 'Reset link sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      const message = error.response?.data?.message || 'Failed to send reset link';
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <>
  <Header />
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-6 py-8 relative">

      {/* Back Button - Always visible at top */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Go back"
        >
          <IoIosArrowRoundBack size={24} className="mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {!submitted ? (
        <div className="pt-10">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-3">
            Forgot Your Password?
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your registered email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200 ${
                isLoading || !email ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center pt-12">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-green-600 mb-2">Email Sent!</h2>
          <p className="text-gray-600 mb-3">
            If an account with that email exists, a password reset link has been sent.
          </p>
          <p className="text-sm text-gray-500">
            Didn’t receive the email? Check your spam folder or try again.
          </p>
        </div>
      )}
    </div>
  </div>
</>

  );
}