import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toaster'; // Adjust path as needed
import Header from '../../components/layouts/AuthHeader';
import BASE_URL from '../../config';
import axios from 'axios';


const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!token) {
    showErrorToast('Invalid or missing reset token');
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setIsLoading(false);
      return showErrorToast("Please fill in both fields");
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      return showErrorToast("Passwords do not match");
    }


    try {
      const res = await axios.post(`${BASE_URL}/api/auth/reset-password/`, {
        token,
        new_password: password,
      });
    
      showSuccessToast('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password';
      showErrorToast(errorMsg);
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
    
  };

  return (

    <>
    <Header/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <div className="absolute top-9 right-3 cursor-pointer text-gray-500" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <div className="absolute top-9 right-3 cursor-pointer text-gray-500" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default ResetPassword;