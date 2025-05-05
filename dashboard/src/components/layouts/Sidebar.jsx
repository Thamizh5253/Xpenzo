import { Link, useLocation } from "react-router-dom";
import { Home, BarChart, PlusCircle, Scan, Info, Menu  ,User ,Bot ,CalendarClock , Split} from "lucide-react";
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Analysis", icon: <BarChart size={20} />, path: "/charts" },
    { name: "New Expense", icon: <PlusCircle size={20} />, path: "/new-expense" },
    // { name: "Scan Bills", icon: <Scan size={20} />, path: "/ocr" },
    {name:"Schedules", icon:<CalendarClock size={20} />, path:"/schedules"},
    { name: "ASKai", icon: <Bot size={20} />, path: "/askai" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
    // { name: "About", icon: <Info size={20} />, path: "/about" },
    { name: "Split", icon: <Split size={20} />, path: "/split" },
  ];
  return (
    <div
      className={`bg-white shadow-lg ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300 p-4 flex flex-col`}
    >
      <button onClick={toggleSidebar} className="text-gray-600 mb-6 hover:text-gray-900">
        <Menu size={24} />
      </button>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-gray-200 transition ${
                location.pathname === item.path ? "bg-gray-100" : ""
              }`}
            >
              <span className="text-gray-600">{item.icon}</span>
              {isOpen && <span className="text-base font-medium text-gray-700">{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
