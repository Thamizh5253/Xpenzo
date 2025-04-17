import React, { useEffect, useState } from "react";
import axios from "axios";
import AddScheduleModal from "./AddSchedule";
import BASE_URL from "../../config";
import { FaTrash, FaEdit } from "react-icons/fa";

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const token = localStorage.getItem("accessToken");

  const refreshData = () => {
    if (!token) return;
    axios
      .get(`${BASE_URL}/scheduler/schedule/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSchedules(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
      });
  };

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BASE_URL}/scheduler/schedule/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSchedules(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await axios.delete(`${BASE_URL}/scheduler/schedule/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshData();
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  const handleEdit = (id) => {
    const schedule = schedules.find((item) => item.id === id); // Find the schedule by id
  
    setSelectedSchedule(schedule);      // Store selected schedule data
    setModalOpen(true);                 // Open modal
  };
  

  const renderCell = (value) => (value === null || value === "" ? "-" : value);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Schedules</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + New Schedule
        </button>
      </div>

      <div className="overflow-auto shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-sm text-gray-800">
          <thead className="bg-gray-800 text-white uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4 text-left">NAME</th>
              <th className="px-6 py-4 text-left">AMOUNT</th>
              <th className="px-6 py-4 text-left">FREQUENCY</th>
              <th className="px-6 py-4 text-left">START DATE</th>
              <th className="px-6 py-4 text-left">END DATE</th>
              <th className="px-6 py-4 text-left">CATEGORY</th>
              <th className="px-6 py-4 text-left">PAYMENT METHOD</th>
              <th className="px-6 py-4 text-left">ACTIVE</th>
              <th className="px-6 py-4 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                  <tr
  key={schedule.id}
  className="hover:bg-gray-50 transition-colors relative"
  onMouseEnter={() => setHoveredRow(schedule.id)}
  onMouseLeave={() => setHoveredRow(null)}
>

                  <td className="px-6 py-4">{renderCell(schedule.name)}</td>
                  <td className="px-6 py-4">₹{renderCell(schedule.amount)}</td>
                  <td className="px-6 py-4">{renderCell(schedule.frequency)}</td>
                  <td className="px-6 py-4">{renderCell(schedule.start_date)}</td>
                  <td className="px-6 py-4">{renderCell(schedule.end_date)}</td>
                  <td className="px-6 py-4">{renderCell(schedule.category)}</td>
                  <td className="px-6 py-4">{renderCell(schedule.payment_method)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        schedule.is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {schedule.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="py-3 pl-2 pr-4 text-center">
  <div className="flex justify-center space-x-2">
    <button
      onClick={() => handleEdit(schedule.id  )}
      className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 shadow-md transition-colors"
      aria-label="Edit"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>

    <button
      onClick={() => handleDelete(schedule.id)}
      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 shadow-md transition-colors"
      aria-label="Delete"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</td>


                  {hoveredRow === schedule.id && (
  <div className="absolute left-0 -top-5 z-10 bg-white border border-gray-300 rounded-md shadow-md p-2 text-xs w-64">
    <p><strong>Description:</strong> {renderCell(schedule.description)}</p>
    <p><strong>Next Occurrence:</strong> {renderCell(schedule.next_occurrence)}</p>
    <p><strong>Last Update:</strong> {renderCell(schedule.last_processed)}</p>
  </div>
)}

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center px-6 py-8 text-gray-400">
                  No schedules available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     <AddScheduleModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onCreated={refreshData}     // For create
  onEdited={refreshData}      // For edit
  editData={selectedSchedule} // Pass selected schedule for editing
  setSelectedSchedule={setSelectedSchedule} // Pass setter function
/>

    </div>
  );
};

export default ScheduleTable;
