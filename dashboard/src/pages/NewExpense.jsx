import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import { useAuth } from "../context/AuthContext"; // Adjust the path as needed

export default function CreateExpense() {
  const [error, setError] = useState(null);

  const { accessToken } = useAuth(); // Use the access token from context
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    payment_method: "",
  });

  const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "other", label: "Other" },
  ];

  const CATEGORIES = [
    { value: "food", label: "Food" },
    { value: "transport", label: "Transport" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health" },
    { value: "shopping", label: "Shopping" },
    { value: "other", label: "Other" },
  ];

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateExpense = () => {
    // const token = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    axios
      .post(`${BASE_URL}/expense/`, newExpense, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        setNewExpense({
          amount: "",
          category: "",
          date: "",
          description: "",
          payment_method: "",
        });
        navigate("/"); // Redirect to expenses list after creation
      })
      .catch((err) => {
        console.error("Error saving expense:", err);
        setError("Failed to save expense. Please try again.");
      });
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Expense</h2>

        {/* Amount Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            name="amount"
            value={newExpense.amount}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Enter amount"
          />
        </div>

        {/* Date Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={newExpense.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            name="payment_method"
            value={newExpense.payment_method}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
          >
            <option value="">Select Payment Method</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={newExpense.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Add a note (optional)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleCreateExpense}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            Save Expense
          </button>
        </div>
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    </div>
  );
}