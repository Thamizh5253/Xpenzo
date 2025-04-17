import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../config";
import { X, Calendar, Clock, Repeat, Tag, CreditCard, Info, DollarSign } from "react-feather";
import { IndianRupee } from "lucide-react";


const AddScheduleModal = ({ isOpen, onClose, onCreated , onEdited, editData , setSelectedSchedule }) => {
  const initialFormData = {
    name: "",
    amount: "",
    frequency: "",
    interval: 1,
    start_date: "",
    end_date: "",
    category: "",
    payment_method: "",
    description: "",
    is_active: true,
  };


  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;


  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        amount: editData.amount || "",
        frequency: editData.frequency || "",
        interval: editData.interval || 1,
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        category: editData.category || "",
        payment_method: editData.payment_method || "",
        description: editData.description || "",
        is_active: editData.is_active ?? true, // explicitly handle boolean

        
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData, isOpen]);
  
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setSelectedSchedule(null);
    editData ? onEdited() : onCreated();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      if (editData?.id) {
        // Edit existing schedule
        await axios.post(
          `${BASE_URL}/scheduler/schedule/update/${editData.id}/`,
          formData,
          { headers }
        );
      } else {
        // Create new schedule
        await axios.post(
          `${BASE_URL}/scheduler/schedule/create/`,
          formData,
          { headers }
        );
      }
  
      onCreated();
      onClose();
      // Reset form and step
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (err) {
      console.error("Error submitting schedule:", err);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl w-full max-w-xl shadow-xl my-8"> {/* Added my-8 for vertical spacing */}
        <div className="flex justify-between items-center mb-6">
          <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {editData ? "Edit Schedule" : "Create New Schedule"}
          </h2>

            <div className="flex items-center mt-1">
              {[...Array(totalSteps)].map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm 
                      ${currentStep > i + 1 ? 'bg-blue-100 text-blue-600' : 
                       currentStep === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${currentStep > i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Schedule Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Netflix Subscription"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <IndianRupee  className="absolute left-3 top-3 text-gray-400" size={18}/>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Active</label>
                  <label className="flex items-center h-[42px]">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full shadow-inner ${formData.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition ${formData.is_active ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <div className="relative">
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <Repeat className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Interval</label>
                  <input
                    type="number"
                    name="interval"
                    placeholder="1"
                    min="1"
                    value={formData.interval}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                  <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <div className="relative">
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div className="relative">
                  <textarea
                    name="description"
                    placeholder="Add any notes about this schedule..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Info className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {editData ? "Save Changes" : "Create Schedule"}
              </button>
            )}

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;