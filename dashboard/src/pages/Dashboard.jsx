import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExpenseCapsule from "./ExpenseCapsule";
import BASE_URL from "../config";
import {useAuth} from "../context/AuthContext"; // Adjust the path as needed
import RupeeSpinner from "../components/common/RupeeSpinner";
import { showSuccessToast ,showErrorToast  } from '../utils/toaster'; // make sure this path matches


export default function ExpenseTable() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [Loading , setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [refreshCapsule, setRefreshCapsule] = useState(false);

  const { accessToken , clearTokens } = useAuth(); // Access the token from context

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

useEffect(() => {
  const fetchExpenses = async () => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/expense/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setExpenses(response.data);
      setLoading(false)
    } catch (error) {
      clearTokens();
      navigate("/login");
    }
  };

  fetchExpenses();
}, [navigate, accessToken]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleCreateExpense = () => {

    const url = isEditing
      ? `${BASE_URL}/expense/${currentExpenseId}/`
      : `${BASE_URL}/expense/`;

    const request = isEditing
      ? axios.put(url, newExpense, { headers: { Authorization: `Bearer ${accessToken}` } })
      : axios.post(url, newExpense, { headers: { Authorization: `Bearer ${accessToken}` } });

    request
      .then((response) => {
        if (isEditing) {
          setExpenses((prev) =>
            prev.map((exp) => (exp.id === currentExpenseId ? response.data : exp))
          );
          showSuccessToast("Expense Edited Successfully")
        } else {
          setExpenses((prev) => [...prev, response.data]);
        }

        setShowModal(false);
        setIsEditing(false);
        setRefreshCapsule((prev) => !prev);
        setNewExpense({ amount: "", category: "", date: "", description: "", payment_method: "" });
      })
      .catch((err) => {
        showErrorToast('Failed to save. Please try again.');
        console.error("Error saving expense:", err)
  });
  };

  const handleEdit = (exp) => {
    setNewExpense(exp);
    setCurrentExpenseId(exp.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
    

    try {
      const response = await axios.delete(`${BASE_URL}/expense/${id}/`, {
        headers: {
          Authorization: `Bearer ${clearTokens}`,
        },
      });

      if (response.status === 204 || response.status === 200) {
        showSuccessToast("Expense Deleted Successfully")
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
        setRefreshCapsule((prev) => !prev);
      } else {
        showErrorToast('Failed to delete expense!')
        console.error("Failed to delete expense:", response);
      }

    } catch (err) {
      showErrorToast('Failed to delete expense!')

      console.error("Error deleting expense:", err);
    }

  };
  
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewExpense({
      amount: "",
      category: "",
      date: "",
      description: "",
      payment_method: "",
    });
  };

 
 

  if (error) return <div className="text-red-500">{error}</div>;

  if (Loading) {
    return (
     <RupeeSpinner/>
    );
  }

  return (
    <div className="p-4">

       {expenses.length === 0 ? (
  <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-700">No expenses found</h2>
  <p className="text-gray-500 mt-2">Add a new expense to get started!</p>
</div>

) : (
 

      <div className="p-6 bg-gray-100 min-h-screen">
     

      {/* Action Buttons Section */}
     <div className="flex justify-end gap-4 mb-6">
     <ExpenseCapsule  refreshCapsule={refreshCapsule} />

     </div>

<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div className="relative">
    {/* Horizontal scroll indicator - only shows when scrolled */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 hidden sm:block">
      <div className="h-full bg-blue-500 w-0 scroll-indicator"></div>
    </div>

    <div className="overflow-x-auto pb-1"> {/* Extra padding for scrollbar */}
      <table className="w-full min-w-[800px]"> {/* Minimum width to prevent column squishing */}
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm">
            <th className="text-left py-3 pl-4 pr-2 font-medium w-12">#</th>
            <th className="text-left py-3 px-2 font-medium w-24">Amount</th>
            <th className="text-left py-3 px-2 font-medium w-32">Category</th>
            <th className="text-left py-3 px-2 font-medium w-28">Date</th>
            <th className="text-left py-3 px-2 font-medium min-w-[180px]">Description</th>
            <th className="text-left py-3 px-2 font-medium w-36">Payment</th>
            <th className="text-center py-3 pl-2 pr-4 font-medium w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {expenses.map((exp, index) => (
            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pl-4 pr-2 text-gray-500">{index + 1}</td>
              <td className="py-3 px-2 font-medium text-green-600">₹{exp.amount}</td>
              <td className="py-3 px-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {exp.category}
                </span>
              </td>
              <td className="py-3 px-2 whitespace-nowrap text-sm text-gray-500">
                {new Date(exp.date).toLocaleDateString()}
              </td>
              <td className="py-3 px-2">
                <p className="line-clamp-2 text-sm text-gray-600" title={exp.description}>
                  {exp.description}
                </p>
              </td>
              <td className="py-3 px-2 text-sm text-gray-600">
                <span className="uppercase">{exp.payment_method}</span>
              </td>
              <td className="py-3 pl-2 pr-4 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    aria-label="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Optional: Add this script to make the scroll indicator work */}
  <script dangerouslySetInnerHTML={{
    __html: `
      document.querySelector('.overflow-x-auto').addEventListener('scroll', function(e) {
        const scrollable = e.target;
        const scrollWidth = scrollable.scrollWidth - scrollable.clientWidth;
        const scrollPercentage = (scrollable.scrollLeft / scrollWidth) * 100;
        document.querySelector('.scroll-indicator').style.width = scrollPercentage + '%';
      });
    `
  }} />
</div>
    </div>
)}

    {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Edit Expense</h2>

    {/* Amount Field */}
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
      <input
        type="number"
        name="amount"
        value={newExpense.amount}
        onChange={handleInputChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
        placeholder="Enter amount"
      />
    </div>

    {/* Date Field */}
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
      <input
        type="date"
        name="date"
        value={newExpense.date}
        onChange={handleInputChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
      />
    </div>

    {/* Category Dropdown */}
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
      <select
        name="category"
        value={newExpense.category}
        onChange={handleInputChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
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
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
      <select
        name="payment_method"
        value={newExpense.payment_method}
        onChange={handleInputChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
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
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <input
        type="text"
        name="description"
        value={newExpense.description}
        onChange={handleInputChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
        placeholder="Add a note (optional)"
      />
    </div>

    {/* Action Buttons */}
    <div className="flex justify-between gap-2">
      <button
        onClick={closeModal}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none transition-all text-sm"
      >
        Cancel
      </button>
      <button
        onClick={handleCreateExpense}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
      >
        Save Changes
      </button>
    </div>

    {error && <div className="text-red-500 text-center mt-2 text-sm">{error}</div>}
  </div>
</div>
)}

    </div>
  );
}  