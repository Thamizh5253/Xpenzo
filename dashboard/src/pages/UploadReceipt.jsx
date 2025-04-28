import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";
import { useAuth } from "../context/AuthContext"; // Adjust the path as needed

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setError("");

      // const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${BASE_URL}/ocr/extract-receipt/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );

      setReceiptData(response.data.receipt_data);
      setNewExpense(response.data.receipt_data);
      setLoading(false);
      setShowModal(true); // Open the modal after successful upload
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateExpense = () => {
    // const token = localStorage.getItem("accessToken");
    const url = `${BASE_URL}/expense/`;
  
    axios
      .post(url, newExpense, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((response) => {
        setExpenses((prev) => [...prev, response.data]);
        setShowModal(false);
        setNewExpense({ amount: "", category: "", date: "", description: "", payment_method: "" });
        navigate("/dashboard");
      })
      .catch((err) => {
        if (err.response?.status === 422) {
          alert("Profile is missing. Please update your profile first.");
          navigate("/profile-setup");
        } else {
          console.error("Error saving expense:", err);

          // alert("Failed to save expense. Please try again.");
        }
      });
  };
  




  const closeModal = () => {
    setShowModal(false);
    
    setNewExpense({
      amount: "",
      category: "",
      date: "",
      description: "",
      payment_method: "",
    });
  };

 

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {!showModal && (
        <div className="bg-white p-8 shadow-lg rounded-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Upload Receipt</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-4 w-full p-2 border"
              accept="image/*"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>

            
          </form>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {showModal && (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Expense</h2>

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

            <div className="flex justify-end gap-4 mt-4">
  <button
    onClick={closeModal}
    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-300 ease-in-out"
  >
    Cancel
  </button>
  <button
    onClick={handleCreateExpense}
    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 ease-in-out"
  >
    Save Expense
  </button>
</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReceipt;