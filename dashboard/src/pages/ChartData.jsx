import React, { useEffect, useState } from 'react';
import ExpenseTrackerCharts from './Charts';
import BASE_URL from '../config';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed
import RupeeSpinner from "../components/common/RupeeSpinner";

const BaseExpenseTracker = () => {
    const [data, setData] = useState(null);
    const [loading , setLoading] = useState(true)
    const { accessToken } = useAuth(); // Use the access token from context

    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryResponse = await fetch(`${BASE_URL}/analytics/summary/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                
                const categoryResponse = await fetch(`${BASE_URL}/analytics/category-wise/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!summaryResponse.ok || !categoryResponse.ok) {
                    throw new Error('Failed to fetch data');
                }


                const summaryData = await summaryResponse.json();
                const categoryData = await categoryResponse.json();

                // console.log(summaryData, categoryData);
                setData({
                    category_spending: categoryData.category_spending,
                    total_spent: summaryData.total_spent,
                    monthly_trend: summaryData.monthly_trend,
                    daily_trend: summaryData.daily_trend
                });
                setLoading(false)
                // category_spending, monthly_trend, daily_trend
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <RupeeSpinner/>
    )

    return (
        <div className="container mx-auto p-4">
            {!data ? (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No expenses found</h2>
            <p className="text-gray-500 mt-2">Add a new expense to get started!</p>
            </div>

) : (
            <>
            <h1 className="text-3xl font-bold text-center mb-4">Expense Tracker Analysis</h1>
            <ExpenseTrackerCharts data={data} />
            </>
)}
        </div>
    );
};

export default BaseExpenseTracker;
