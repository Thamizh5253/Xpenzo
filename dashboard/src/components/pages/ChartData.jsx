import React, { useEffect, useState } from 'react';
import ExpenseTrackerCharts from './Charts';

const BaseExpenseTracker = () => {
    const [data, setData] = useState(null);
    // const token = localStorage.getItem('token');
    const token = localStorage.getItem("accessToken");

    // console.log(token);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryResponse = await fetch('http://127.0.0.1:8000/analytics/summary/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const categoryResponse = await fetch('http://127.0.0.1:8000/analytics/category-wise/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!summaryResponse.ok || !categoryResponse.ok) {
                    throw new Error('Failed to fetch data');
                }


                const summaryData = await summaryResponse.json();
                const categoryData = await categoryResponse.json();

                console.log(summaryData, categoryData);
                setData({
                    category_spending: categoryData.category_spending,
                    total_spent: summaryData.total_spent,
                    monthly_trend: summaryData.monthly_trend,
                    daily_trend: summaryData.daily_trend
                });
                // category_spending, monthly_trend, daily_trend
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!data) return <div className="text-center p-5">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-4">Expense Tracker Analysis</h1>
            <ExpenseTrackerCharts data={data} />
        </div>
    );
};

export default BaseExpenseTracker;
