import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust path if needed
import { jwtDecode } from "jwt-decode";



export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { clearTokens, user ,accessToken } = useAuth(); 
  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };


const decoded = jwtDecode(accessToken);

// console.log(decoded);


  const handleProfile = () => {
    navigate("/profile"); // adjust this route if needed
    setIsOpen(false);
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
        <div className="absolute right-0 mt-5 w-60 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">
              Hi, {decoded?.username || "Guest"}
            </p>
            <p className="text-xs text-gray-500">
              {decoded?.email || "No email"}
            </p>
          </div>

          {/* Profile Button */}
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <FiUser className="text-lg" />
            <span>Profile</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-gray-100 transition duration-200"
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
