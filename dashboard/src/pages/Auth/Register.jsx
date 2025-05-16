import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Headers from "../../components/layouts/AuthHeader";
import BASE_URL from "../../config";
import axios from 'axios';
import { showSuccessToast, showErrorToast } from "../../utils/toaster";


const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register/`, formData);
    
    // Show success toast and message
    showSuccessToast(response.data.message || "Registration successful!");
    
    // Redirect after delay
    setTimeout(() => navigate("/login"), 2000);

  } catch (error) {
    let errorMsg = "Registration failed. Please try again.";
    
    // Handle different error cases
    if (error.response) {
      if (error.response.status === 409) {
        // Conflict - user already exists
        errorMsg = error.response.data?.error || "User already exists";
      } else if (error.response.status === 400) {
        // Bad request - validation errors
        errorMsg = "Validation errors: " + 
          (error.response.data?.error || 
           Object.values(error.response.data).join(" ") || 
           "Please check your input");
      }
    } else if (error.request) {
      errorMsg = "No response from server. Please check your connection.";
    }
    
    // Show error and set message
    showErrorToast(errorMsg);
    
    console.error("Registration error:", error);
  } 
};

  return (
    <>
    <Headers />
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
        {/* Lottie Animation Section */}
        <div className="md:w-1/2 flex justify-center items-center p-4 bg-blue-50">
          <DotLottieReact
            src="https://lottie.host/9609c43d-0656-44d8-ba07-7091bdb74643/BfTznYVkNT.lottie"
            loop
            autoplay
            style={{ width: "100%", maxWidth: "300px" }}
          />
        </div>
        {/* Form Section */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
