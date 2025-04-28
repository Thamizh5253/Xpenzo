import React, { useEffect, useState } from "react";
import axios from 'axios';
import BASE_URL from "../config";
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed

const ExpenseSavingCapsule = ({ refreshCapsule }) => {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken} = useAuth();

  const smoothNumberTransition = (start, end, setValue) => {
    let current = start;
    const step = (end - start) / 50;
    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
        clearInterval(interval);
        setValue(end);
      } else {
        setValue(current);
      }
    }, 20);
  };

  useEffect(() => {
    const fetchData = async () => {  
      try {
        setIsLoading(true);
        // const token = localStorage.getItem("accessToken");
      
        const [profileResponse, expenseResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/auth/profile/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(`${BASE_URL}/analytics/monthly-trend/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);
      
        const profileData = profileResponse.data;
        const expenseData = expenseResponse.data;
      
        const fetchedIncome = parseFloat(profileData.income);
        const fetchedExpenses = parseFloat(expenseData.current_month_total);
      
        smoothNumberTransition(0, isNaN(fetchedIncome) ? 0 : fetchedIncome, setIncome);
        smoothNumberTransition(0, isNaN(fetchedExpenses) ? 0 : fetchedExpenses, setExpenses);
        smoothNumberTransition(0, fetchedIncome - fetchedExpenses, setSavings);
      
      } catch (error) {
        console.error("Error fetching data with axios:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [refreshCapsule]);

  const getSavingsPercentage = () => {
    if (income <= 0) return 0;
    return Math.min(Math.round((savings / income) * 100), 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value).replace('₹', '₹ ');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Financial Overview</h3>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { 
                label: "Income", 
                value: income, 
                bg: "bg-gradient-to-br from-green-50 to-green-100",
                text: "text-green-600",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                label: "Expenses", 
                value: expenses, 
                bg: "bg-gradient-to-br from-red-50 to-red-100",
                text: "text-red-600",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              { 
                label: "Balance", 
                value: savings, 
                bg: "bg-gradient-to-br from-blue-50 to-blue-100",
                text: "text-blue-600",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                )
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${item.bg} p-5 rounded-xl shadow-xs border border-gray-200/50 flex flex-col`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`${item.text} text-sm font-medium`}>{item.label}</span>
                  <span className={`${item.text} p-2 rounded-lg bg-white/50`}>
                    {item.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.value)}</p>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.text.replace('text', 'bg')} rounded-full`}
                    style={{ width: `${Math.min((item.value / (income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200/50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Savings Progress</h4>
              <span className="text-sm font-bold text-blue-600">{getSavingsPercentage()}%</span>
            </div>
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Goal: {savings >= 0 ? 'Achieved' : 'Deficit'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    {formatCurrency(Math.abs(savings))} {savings >= 0 ? 'saved' : 'over'}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mt-2 flex rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getSavingsPercentage()}%` }}
                  transition={{ duration: 1 }}
                  className={`rounded-full ${savings >= 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                ></motion.div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseSavingCapsule;