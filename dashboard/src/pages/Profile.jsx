import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BASE_URL from "../config";
import { useAuth } from "../context/AuthContext";
import { showSuccessToast, showErrorToast } from '../utils/toaster';
import RupeeSpinner from "../components/common/RupeeSpinner";

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        monthly_budget: "",
        savings_goal: "",
        income: "",
        phone_number: "",
        country: "",
        bio: "",
        upi_id: "",
    });
    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    // Check if form data has changed
    const hasChanges = () => {
        if (!originalData) return false;
        return Object.keys(formData).some(key => formData[key] !== originalData[key]);
    };

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
                setLoading(false);
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
            const method = originalData ? "PUT" : "POST";

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
                setIsEditing(false);
                if (!originalData) {
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (originalData) {
            setFormData(originalData);
        }
        setIsEditing(false);
        showSuccessToast("Changes discarded");
    };

    if (loading) {
        return <RupeeSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Your Profile
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isEditing ? "Edit your profile details" : "View and manage your profile information"}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Budget (₹)
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="monthly_budget"
                                            value={formData.monthly_budget}
                                            onChange={handleChange}
                                            required
                                            disabled={!isEditing}
                                            className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            placeholder="10,000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Savings Goal (₹)
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="savings_goal"
                                            value={formData.savings_goal}
                                            onChange={handleChange}
                                            required
                                            disabled={!isEditing}
                                            className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            placeholder="5,000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Income (₹)
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name="income"
                                            value={formData.income}
                                            onChange={handleChange}
                                            required
                                            disabled={!isEditing}
                                            className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            placeholder="50,000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        UPI ID
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="upi_id"
                                        value={formData.upi_id}
                                        onChange={handleChange}
                                        required
                                        disabled={!isEditing}
                                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="yourname@upi"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="+91 9876543210"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="India"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        About You
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        disabled={!isEditing}
                                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="Tell us about yourself, your financial goals, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 sm:px-8 flex justify-end space-x-3">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!hasChanges() || isLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;