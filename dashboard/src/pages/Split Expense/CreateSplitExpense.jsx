import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import { showSuccessToast, showErrorToast } from "../../utils/toaster";
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const CreateSplitExpenseModal = ({ 
  isOpen, 
  onClose,
  // refreshExpenses // Add this prop to refresh parent component after creation
}) => {


  const [formData, setFormData] = useState({
    group_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    payment_method: '',
    split_type: 'EQUAL',
    splits:[]
  });
  
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
//   const token = localStorage.getItem('accessToken');
  const { accessToken } = useAuth(); // Use the access token from context
  const [members, setMembers] = useState([]); // Separate state for members

 
  // Fetch groups from the server
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsGroupsLoading(true);
        const response = await axios.get(`${BASE_URL}/split/groups/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setGroups(response.data);
        console.log('Fetched groups:', response.data);
        // Set default group if available
        // if (response.data.length > 0) {
        //   setFormData(prev => ({ ...prev, group_id: response.data[0].id }));
        // }
      } catch (error) {
        console.error('Error fetching groups:', error);
        showErrorToast('Failed to load groups');
      } finally {
        setIsGroupsLoading(false);
      }
    };

    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, accessToken]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  

  const handleChangeGroup = (e) => {
    const { value } = e.target;
    console.log('Selected group ID:', value);

    // Set the selected group ID to formData
    setFormData(prev => ({ ...prev, group_id: value }));

    // Find the group by ID
    const selectedGroup = groups.find(group => group.id === value);

    if (selectedGroup) {
        // If group found, update members state with that group's members
        setMembers(selectedGroup.all_members);
    } else {
        // If no group found, reset members
        setMembers([]);
    }

    console.log('Selected group members:', selectedGroup ? selectedGroup.all_members : []);
};


const handlePercentageChange = (userId, value) => {
    setFormData(prevState => {
      let updatedSplits = [...prevState.splits];
      const existingIndex = updatedSplits.findIndex(split => split.user_id === userId);
  
      const parsedValue = value === '' ? null : parseInt(value, 10);
  
      if (parsedValue === null || parsedValue === 0) {
        // Remove if empty or 0
        updatedSplits = updatedSplits.filter(split => split.user_id !== userId);
      } else {
        if (existingIndex !== -1) {
          updatedSplits[existingIndex].percentage = parsedValue; // 👈 updated to percentage
        } else {
          updatedSplits.push({
            user_id: userId,
            percentage: parsedValue   // 👈 updated to percentage
          });
        }
      }
  
      return {
        ...prevState,
        splits: updatedSplits
      };
    });
  };

  function handleSharesChange(userId, value) {
    setFormData(prevFormData => {
      const numericValue = Number(value); // Convert to number
  
      const updatedSplits = prevFormData.splits.map(split => {
        if (split.user_id === userId) {
          return { ...split, shares: numericValue };
        }
        return split;
      });
  
      const userExists = prevFormData.splits.some(split => split.user_id === userId);
      if (!userExists) {
        updatedSplits.push({ user_id: userId, shares: numericValue });
      }
  
      return {
        ...prevFormData,
        splits: updatedSplits
      };
    });
  }

  function handleExactAmountChange(userId, value) {
    setFormData(prevFormData => {
      const updatedSplits = prevFormData.splits.map(split => {
        if (split.user_id === userId) {
          return { ...split, amount_owed: value };
        }
        return split;
      });
  
      const userExists = prevFormData.splits.some(split => split.user_id === userId);
      if (!userExists) {
        updatedSplits.push({ user_id: userId, amount_owed: value });
      }
  
      return {
        ...prevFormData,
        splits: updatedSplits
      };
    });
  }
  
  // Clear form data
  const clearFromDataAndCloseModal = () => {
    setFormData({
      group_id: '',
      amount: '', 
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      payment_method: '',
      split_type: 'EQUAL',
      splits:[]

    });
    setMembers([]); // Clear members when closing the modal
    onClose();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/split/groups_expense/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        showSuccessToast('Expense created successfully!');
        // if (refreshExpenses) refreshExpenses(); // Refresh parent component

        clearFromDataAndCloseModal();
        // onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         'Error creating expense';
      showErrorToast(errorMessage);
      console.error('Error creating expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'food', 'transport', 'entertainment', 
     'health', 'shopping', 'other'
  ];

  const paymentMethods = [
    'cash', 'card', 'upi', 
    'other'
  ];

  
  const splitTypes = [
    { value: 'EQUAL', label: 'Equal' },
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'EXACT', label: 'Exact Amount' },
    { value: 'SHARES', label: 'Shares' },
  ];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Group Expense</h2>
              <p className="text-sm text-gray-500">Record a shared expense</p>
            </div>
            <button 
              onClick={clearFromDataAndCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Group Selection */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
  {isGroupsLoading ? (
    <div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
  ) : (
    <select
      name="group_id"
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
      value={formData.group_id}
      onChange={handleChangeGroup}
      required
      // disabled={groups.length === 0}
    >
       <option value="" disabled>
        {groups.length === 0 ? "No groups available" : "Select Group"}
      </option>

      {groups.map(group => (
        <option key={group.id} value={group.id}>
          {group.group_name}
        </option>
      ))}
    </select>
  )}
</div>


              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  name="description"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

           {/* Split Type Section */}
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Split Type
    </label>
    <div className="relative">
      <select
        name="split_type"
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-4 pr-10"
        value={formData.split_type}
        onChange={handleChange}
        required
      >
        {splitTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </div>

  {/* Percentage Split */}
  {formData.split_type === 'PERCENTAGE' && (
    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
      <h4 className="text-sm font-medium text-blue-800 mb-3">Percentage Distribution</h4>
      <div className="space-y-3">
        {members.map((user) => {
          const split = formData.splits.find(s => s.user_id === user.id) || {};
          return (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-medium text-gray-700">{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-32">
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="0"
                  value={split.percentage || ''}
                  onChange={(e) => handlePercentageChange(user.id, e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Shares Split */}
  {formData.split_type === 'SHARES' && (
    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
      <h4 className="text-sm font-medium text-purple-800 mb-3">Shares Distribution</h4>
      <div className="space-y-3">
        {members.map((user) => {
          const split = formData.splits.find(s => s.user_id === user.id) || {};
          return (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-medium text-gray-700">{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-32">
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="0"
                  value={split.shares || ''}
                  onChange={(e) => handleSharesChange(user.id, e.target.value)}
                  min="0"
                />
                <span className="text-gray-500 text-sm">shares</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Exact Amount Split */}
  {formData.split_type === 'EXACT' && (
    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
      <h4 className="text-sm font-medium text-green-800 mb-3">Exact Amounts</h4>
      <div className="space-y-3">
        {members.map((user) => {
          const split = formData.splits.find(s => s.user_id === user.id) || {};
          return (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-medium text-gray-700">{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-32">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder="0.00"
                    value={split.amount_owed || ''}
                    onChange={(e) => handleExactAmountChange(user.id, Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={clearFromDataAndCloseModal}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-100 disabled:opacity-50"
                disabled={isLoading || !formData.group_id || !formData.amount || !formData.description || !formData.category || !formData.payment_method}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSplitExpenseModal;