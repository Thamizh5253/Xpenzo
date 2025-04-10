import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        monthly_budget: "",
        savings_goal: "",
        income: "",
        phone_number: "",
        country: "",
        bio: "",
    });
    const [originalData, setOriginalData] = useState(null); // Store original profile data
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false); // Track if the form is in edit mode
    const navigate = useNavigate();

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setFormData(data); // Pre-fill the form with existing data
                    setOriginalData(data); // Store original data for cancel functionality
                    setIsEditing(true); // Enable edit mode
                } else if (response.status === 404) {
                    setMessage("You have not set up your profile yet.");
                    setIsEditing(false); // Disable edit mode
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage("⚠️ An error occurred while fetching profile data.");
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = "http://127.0.0.1:8000/api/auth/profile/create_or_update/";
            const method = isEditing ? "PUT" : "POST"; // Use PUT for updates, POST for creation
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Profile saved successfully!");
                setOriginalData(formData); // Update original data after saving
                if (!isEditing) {
                    setTimeout(() => navigate("/dashboard"), 2000); // Redirect after setup
                }
            } else {
                setMessage("❌ Failed to save profile");
            }
        } catch (error) {
            setMessage("⚠️ An error occurred");
        }
    };

    const handleCancel = () => {
        if (originalData) {
            setFormData(originalData); // Revert to original data
            setMessage(""); // Clear any messages
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    {isEditing ? "Edit Your Profile" : "Set Up Your Profile"}
                </h2>
                {message && <p className="text-center mb-4 text-red-500">{message}</p>}
                <input
                    type="number"
                    name="monthly_budget"
                    placeholder="Monthly Budget"
                    value={formData.monthly_budget}
                    onChange={handleChange}
                    required
                    className="w-full mb-3 p-2 border rounded"
                />
                <input
                    type="number"
                    name="savings_goal"
                    placeholder="Savings Goal"
                    value={formData.savings_goal}
                    onChange={handleChange}
                    required
                    className="w-full mb-3 p-2 border rounded"
                />
                <input
                    type="number"
                    name="income"
                    placeholder="Income"
                    value={formData.income}
                    onChange={handleChange}
                    required
                    className="w-full mb-3 p-2 border rounded"
                />
                <input
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                />
                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                />
                <textarea
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                />
                <div className="flex justify-between">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;



