import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Headers from "../../components/layouts/Header"; // Adjust path as needed
import { showSuccessToast, showErrorToast } from "../../utils/toaster"; // Adjust path as needed
import BASE_URL from "../../config";
import axios from 'axios';


const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, formData);
      const data = response.data;

      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);

      if (!data.profile_exists) {
        showSuccessToast("Profile incomplete! Redirecting to setup...");
        setTimeout(() => navigate("/profile-setup"), 2000);
      } else {
        showSuccessToast("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      }

      setAuth(true);
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.error || "Invalid credentials";
      showErrorToast(errorMsg);
    }

  };
  

  return (
    <>
    <Headers  />
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
        {/* Lottie Animation Section */}
        <div className="md:w-1/2 flex justify-center items-center p-4 bg-blue-50">
          <DotLottieReact
            src="https://lottie.host/57e7ecf3-af77-4460-98c4-820b5a8df60a/ilUAkNvREw.lottie"
            loop
            autoplay
            style={{ width: "100%", maxWidth: "300px" }}
          />
        </div>
        {/* Form Section */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
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
            <div> 
            <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
             Forgot Password?
             </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm font-medium text-red-500">{message}</p>}
          <p className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>

  </>
  );
};

export default Login;
