import React, { useEffect, useState } from "react";
import axios from 'axios';
import BASE_URL from "../config";


const ExpenseSavingCapsule = ({ refreshCapsule }) => {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);

  const smoothNumberTransition = (start, end, setValue) => {
    let current = start;
    const step = (end - start) / 50; // Smooth transition with 50 steps
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

  // Fetch income only once on first render
  useEffect(() => {
    const fetchData = async () => {  
      try {
        const token = localStorage.getItem("accessToken");
      
        const [profileResponse, expenseResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/auth/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/analytics/monthly-trend/`, {
            headers: { Authorization: `Bearer ${token}` },
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
      }
    };
  
    fetchData();
  }, [refreshCapsule]);
  


  return (
    <div className="flex justify-center items-center gap-4 p-2 flex-wrap">
      {[
        { label: "Income", value: income, color: "from-green-400 to-green-600" },
        { label: "Expenses", value: expenses, color: "from-red-400 to-red-600" },
        { label: "Balance", value: savings, color: "from-blue-400 to-blue-600" },
      ].map((item, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${item.color} text-white p-4 rounded-3xl shadow-xl w-44 text-center transition-all duration-300`}
        >
          <h5 className="text-lg font-semibold tracking-wide">{item.label}</h5>
          <p className="font-bold text-xl">₹{item.value.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default ExpenseSavingCapsule;
