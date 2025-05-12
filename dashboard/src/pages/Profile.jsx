import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BASE_URL from "../config";
import { useAuth } from "../context/AuthContext";
import {  showSuccessToast, showErrorToast } from '../utils/toaster';

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        monthly_budget: "",
        savings_goal: "",
        income: "",
        phone_number: "",
        country: "",
        bio: "",
        upi_id  : "",
    });
    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/api/auth/profile/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                
                const data = response.data;
                setFormData(data);
                setOriginalData(data);
                setIsEditing(true);
                showSuccessToast("Profile loaded successfully");
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setIsEditing(false);
                } else {
                    console.error("Error fetching profile:", error);
                    showErrorToast("Failed to load profile data");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, accessToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const url = `${BASE_URL}/api/auth/profile/create_or_update/`;
            const method = isEditing ? "PUT" : "POST";

            const response = await axios({
                method,
                url,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                data: formData,
            });

            if (response.status === 200) {
                showSuccessToast("Profile saved successfully!");
                setOriginalData(formData);
                if (!isEditing) {
                    setTimeout(() => navigate("/dashboard"), 2000);
                }
            } else {
                showErrorToast("Failed to save profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            showErrorToast("An error occurred while saving");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (originalData) {
            setFormData(originalData);
            showSuccessToast("Changes discarded");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
                    {isEditing ? "Edit Your Profile" : "Set Up Your Profile"}
                </h2>
                
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (₹)</label>
                        <input
                            type="number"
                            name="monthly_budget"
                            value={formData.monthly_budget}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your monthly budget"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Savings Goal (₹)</label>
                        <input
                            type="number"
                            name="savings_goal"
                            value={formData.savings_goal}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your savings goal"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Income (₹)</label>
                        <input
                            type="number"
                            name="income"
                            value={formData.income}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your monthly income"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                            type="text"
                            name="upi_id"
                            value={formData.upi_id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your monthly income"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter your country"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">About You</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Tell us about yourself"
                        />
                    </div>
                </div>
                
                <div className="flex justify-between mt-6">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;