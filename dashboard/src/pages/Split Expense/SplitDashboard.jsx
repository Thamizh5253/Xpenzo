import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import GroupCreationModal from './CreateGroup';
import { showSuccessToast, showErrorToast } from "../../utils/toaster"; // Adjust path as needed
import CreateSplitExpenseModal from './CreateSplitExpense'; // Adjust path as needed
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const SplitExpenseDashboard = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  // const [datachanged, setDataChanged] = useState(true);
  const [expenses, setExpenses] = useState({
    userOwes: [],
    userPaid: []
  });
  const [userData, setUserData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({
    expenses: true,
    groups: true
  });
  const [error, setError] = useState(null);
  // const token = localStorage.getItem('accessToken');
  const { accessToken } = useAuth(); // Use the access token from context
  
  // useEffect(() => {
    
  //   console.log("Expenses updated:", expenses);
  // }, [expenses]);
  
    const fetchData = async () => {
      try {
        // Fetch expenses
        const expensesResponse = await axios.get(`${BASE_URL}/split/user_expense/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("Expenses Response:", expensesResponse.data);
        
        setExpenses({
          userOwes: expensesResponse.data.expenses_user_owes,
          userPaid: expensesResponse.data.expenses_user_paid
        });
        setLoading(prev => ({ ...prev, expenses: false }));

        // Fetch groups
        const groupsResponse = await axios.get(`${BASE_URL}/split/groups/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        setGroups(groupsResponse.data);
        setLoading(prev => ({ ...prev, groups: false }));
      } catch (err) {
        setError(err.message);
        setLoading({ expenses: false, groups: false });
      }
    };

  const fetchUsers = async () => {
    try {
      // setIsUsersLoading(true);
      const response = await axios.get(`${BASE_URL}/api/auth/groups/members/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setUserData(response.data);
      console.log('Fetched members:', response.data);
      
    } catch (error) {
      console.error('Error fetching members:', error);
      showErrorToast('Failed to load members');
    // } finally {
    //   // setIsUsersLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchData();
  }, [accessToken , isModalOpen, isExpenseModalOpen]);

  const handleEditGroup = (group) => {

    
    setIsModalOpen(true);


    console.log("Edit", group);
  };
  
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${BASE_URL}/split/groups/delete/${groupId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      // Update UI
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
  
      // Optional: success message
      // alert("Group deleted successfully.");
      showSuccessToast("Group deleted successfully");

  
    } catch (err) {

      if (err.response && err.response.status === 403) {
        showErrorToast("Only admin can delete the group.");
      } else {
        showErrorToast("Failed to delete group");
        console.error("Failed to delete group:", err.message);
      }
    }
    
  };
  const requestSettlement = async (expenseId, username) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/split/request_settlement/`, 
        { expense_id: expenseId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Expense settled:', response.data);
      showSuccessToast(response.data.detail);
      fetchData(); // Refresh data after settlement request
     

    } catch (error) {
      console.error('Error settling expense:', error);
      showErrorToast(error.response?.data?.detail || 'Failed to settle expense');
    }
  };

const confirmSettlement = async (expenseId , username) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/split/confirm_settlement/`, 
      { expense_id: expenseId,
        username: username
       },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    console.log('Expense settled:', response.data);
    showSuccessToast(response.data.detail);
    fetchData(); // Refresh data after settlement request
    // Refresh expense data or update local state
  } catch (error) {
    console.error('Error settling expense:', error);
    showErrorToast(error.response?.data?.detail || 'Failed to settle expense');
  }
};

const rejectSettlement = async (expenseId , username) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/split/reject_settlement/`, 
      { expense_id: expenseId ,
        username: username
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log('Expense settled:', response.data);
    showSuccessToast(response.data.detail);
    fetchData(); // Refresh data after settlement request
    // Refresh expense data or update local state
  } catch (error) {
    console.error('Error settling expense:', error);
    showErrorToast(error.response?.data?.detail || 'Failed to settle expense');
  }
};


  if (loading.expenses || loading.groups) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Calculate summary data
  const totalOwed = expenses.userOwes.reduce((sum, exp) => sum + exp.amount_owed, 0);
  const totalOwedToYou = expenses.userPaid.reduce((sum, exp) => sum + exp.amount_owed, 0);
  const netBalance = totalOwedToYou - totalOwed;

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('groups')}
              className={`${activeTab === 'groups' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`${activeTab === 'expenses' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Split Expenses
            </button>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">You owe</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">₹{totalOwed.toFixed(2)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Owed to you</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">₹{totalOwedToYou.toFixed(2)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white overflow-hidden shadow rounded-lg ${netBalance < 0 ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total balance</dt>
                  <dd className="flex items-baseline">
                    <div className={`text-2xl font-semibold ${netBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {netBalance < 0 ? '- ' : ''}₹{Math.abs(netBalance).toFixed(2)}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'expenses' ? (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Expenses</h2>
              <button onClick = {()=> setIsExpenseModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Expense
              </button>
            </div>

            {/* Expenses You Owe */}
            <div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">Expenses You Owe</h3>
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {expenses.userOwes.length > 0 ? (
      <ul className="divide-y divide-gray-100">
        {expenses.userOwes.map((expense) => (
          <li key={`owe-${expense.expense_id}`} className="hover:bg-gray-50/50 transition-colors">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 rounded-lg p-2.5 ${
                    expense.status === 'requested' ? 'bg-blue-50' :
                    expense.status === 'pending' ? 'bg-amber-50' : 
                    expense.status === 'confirmed' ? 'bg-emerald-50' :
                    'bg-gray-50'
                  }`}>
                    {(() => {
                      switch(expense.status) {
                        case 'pending':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                        case 'requested':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                        case 'confirmed':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                        default:
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                      }
                    })()}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{expense.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>Paid to {expense.paid_to}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{expense.group}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{expense.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-base font-semibold text-gray-900">₹{expense.amount_owed.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 flex justify-between items-center border-t border-gray-100">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  expense.status === 'requested' ? 'bg-blue-50 text-blue-700' :
                  expense.status === 'pending' ? 'bg-amber-50 text-amber-700' : 
                  expense.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  You owe ₹{expense.amount_owed.toFixed(2)}
                </span>

                <button
                  onClick={() => {
                    if (expense.status === 'pending') {
                      requestSettlement(expense.expense_id);
                    }
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    expense.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : expense.status === 'requested'
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : expense.status === 'confirmed' ?
                       'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-800 cursor-default'
                  }`}
                  disabled={expense.status !== 'pending'}
                >
                  {expense.status === 'pending'
                    ? 'Settle up'
                    : expense.status === 'requested'
                    ? 'Request sent'
                    : 'Settled'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="px-4 py-10 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-50 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">All settled up!</h3>
        <p className="mt-1 text-sm text-gray-500">You don't owe anyone any money.</p>
      </div>
    )}
  </div>
</div>

            {/* Expenses You're Owed */}
            <div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900">Expenses You're Owed</h3>
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {expenses.userPaid.length > 0 ? (
      <ul className="divide-y divide-gray-100">
        {expenses.userPaid.map((expense) => (
          <li key={`paid-${expense.expense_id}-${expense.user_owes}`} className="hover:bg-gray-50/50 transition-colors">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 rounded-lg p-2.5 ${
                    expense.status === 'confirmed' ? 'bg-emerald-50' :
                    expense.status === 'pending' ? 'bg-amber-50' :
                    expense.status === 'requested' ? 'bg-blue-50' :
                   'bg-gray-50'
                  }`}>
                    {(() => {
                      switch(expense.status) {
                        case 'pending':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                        case 'requested':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                        case 'confirmed':
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                       
                        default:
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          );
                      }
                    })()}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{expense.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>{expense.user_owes} owes you</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{expense.group}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{expense.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-base font-semibold text-gray-900">₹{expense.amount_owed.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 flex justify-between items-center border-t border-gray-100">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  expense.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                  expense.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  expense.status === 'requested' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  You lent ₹{expense.amount_owed.toFixed(2)}
                </span>

                <div className="flex items-center gap-2">
                  {expense.status === 'pending' && (
                    <button className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                      Pending
                    </button>
                  )}

                  {expense.status === 'requested' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmSettlement(expense.expense_id, expense.user_owes)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => rejectSettlement(expense.expense_id, expense.user_owes)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {expense.status === 'confirmed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700">
                      Settled
                    </span>
                  )}

                  {expense.status === 'REJECTED' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="px-4 py-10 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-50 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">No pending payments</h3>
        <p className="mt-1 text-sm text-gray-500">No one owes you any money.</p>
      </div>
    )}
  </div>
</div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Groups</h2>
              <button  onClick = {()=> setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Group
              </button>
            </div>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
  {groups.length > 0 ? (
    <ul className="divide-y divide-gray-200">
      {groups.map((group) => (
        <li key={group.id} className="hover:bg-gray-50 transition-colors px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="bg-indigo-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{group.group_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {group.all_members.slice(0, 5).map(member => (
                    <span
                      key={member.id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.nickname || member.username}
                      {member.is_admin && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  ))}
                  {group.all_members.length > 5 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{group.all_members.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-1">
              <button
                onClick={() => handleEditGroup(group)}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 shadow-md transition-colors"
                aria-label="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 shadow-md transition-colors"
                aria-label="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
  <div className="flex gap-4">
    {/* Existing content (e.g., logo and group details) */}
  </div>
  <div className="text-sm text-gray-400">
    {new Date(group.created_at).toLocaleDateString('en-US', { 
      year: 'numeric' , month: 'short', day: 'numeric' 
    })}
  </div>
</div>
        </li>
      ))}
    </ul>
  ) : (
    <div className="px-4 py-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
      <p className="mt-1 text-sm text-gray-500">Create a new group to get started with splitting expenses.</p>
    </div>
  )}
</div>


          </div>
        )}
          <GroupCreationModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  users={userData}
  
  setGroups={setGroups}
                                                                

/>

<CreateSplitExpenseModal 
  isOpen={isExpenseModalOpen} 
  onClose={() => setIsExpenseModalOpen(false)}
  // refreshExpenses={fetchExpenses} // Pass your expense refresh function here
/>

      </main>                                                                           
    </div>


   
    </>
  );
};

export default SplitExpenseDashboard;