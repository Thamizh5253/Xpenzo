import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function UserDropdown({ setAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth(false);
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Icon */}
      <FaUserCircle
        className="text-4xl cursor-pointer text-blue-500 hover:text-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md animate-fade-in">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-gray-100 rounded-md transition duration-200"
            onClick={handleLogout}
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
