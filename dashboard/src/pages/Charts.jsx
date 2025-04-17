import React, { useState } from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Tab = ({ children, onClick, active }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
    >
        {children}
    </button>
);

const Tabs = ({ children }) => (
    <div className="flex justify-center gap-4 mb-4">{children}</div>
);

const ExpenseTrackerCharts = ({ data }) => {
    const { category_spending, monthly_trend, daily_trend } = data;
    const categoryColors = [
        "#FF6B6B", "#4ECDC4", "#5567FF", "#FFCA3A", "#FF5C8A", "#6A4C93"
    ];

    const categoryData = {
        labels: Object.keys(category_spending),
        datasets: [{
            data: Object.values(category_spending),
            backgroundColor: categoryColors,
        }]
    };

    const monthlyData = {
        labels: Object.keys(monthly_trend),
        datasets: [{
            label: 'Monthly Spending',
            data: Object.values(monthly_trend),
            borderColor: '#4CAF50',
            fill: false,
        }]
    };

    const dailyData = {
        labels: Object.keys(daily_trend),
        datasets: [{
            label: 'Daily Spending',
            data: Object.values(daily_trend),
            backgroundColor: '#FF6384',
        }]
    };

    const [activeTab, setActiveTab] = useState('category');

    return (
        <div className="p-5 bg-gray-100 shadow-lg rounded-lg">
            <Tabs>
                <Tab onClick={() => setActiveTab('category')} active={activeTab === 'category'}>Category</Tab>
                <Tab onClick={() => setActiveTab('monthly')} active={activeTab === 'monthly'}>Monthly</Tab>
                <Tab onClick={() => setActiveTab('daily')} active={activeTab === 'daily'}>Daily</Tab>
            </Tabs>

            <div className="bg-white shadow-xl p-4 rounded-lg">
                {activeTab === 'category' && (
                    <>
                        <h2 className="text-xl font-bold mb-2">Category Wise Spending</h2>
                        <div className="w-80 h-80 mx-auto">
                            <Pie data={categoryData} />
                        </div>
                    </>
                )}
                {activeTab === 'monthly' && (
                    <>
                        <h2 className="text-xl font-bold mb-2">Monthly Spending Trend</h2>
                        <div className="w-80 h-80 mx-auto">
                            <Line data={monthlyData} />
                        </div>
                    </>
                )}
                {activeTab === 'daily' && (
                    <>
                        <h2 className="text-xl font-bold mb-2">Daily Spending Trend</h2>
                        <div className="w-80 h-80 mx-auto">
                            <Bar data={dailyData} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExpenseTrackerCharts;