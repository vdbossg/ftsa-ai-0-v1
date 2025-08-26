import React from "react";
import { NavLink } from "react-router-dom";
import { 
  FaHome, FaChartBar, FaBrain, FaServer, FaBitcoin, FaUserCog,
  FaUsers, FaBook, FaExchangeAlt, FaCogs, FaSignOutAlt, FaSignInAlt,
  FaInfoCircle, FaQuestionCircle, FaHandshake
} from "react-icons/fa";

const menuItems = [
  { label: "Home", path: "/", icon: <FaHome className="text-[#00FFFF]" /> },
  { label: "Dashboard", path: "/dashboard", icon: <FaChartBar className="text-[#00FFFF]" /> },
  { label: "AI Brain", path: "/brain", icon: <FaBrain className="text-[#00FFFF]" /> },
  { label: "Status", path: "/status", icon: <FaServer className="text-[#00FFFF]" /> },
  { label: "Binance", path: "/binance", icon: <FaBitcoin className="text-[#00FFFF]" /> },
  { label: "MT Accounts", path: "/mtaccounts", icon: <FaUserCog className="text-[#00FFFF]" /> },
  { label: "Prop Firm Accounts", path: "/propfirmaccounts", icon: <FaUsers className="text-[#00FFFF]" /> },
  { label: "Journal", path: "/journal", icon: <FaBook className="text-[#00FFFF]" /> },
  { label: "Trades", path: "/trades", icon: <FaExchangeAlt className="text-[#00FFFF]" /> },
  { label: "Settings", path: "/settings", icon: <FaCogs className="text-[#00FFFF]" /> },
  { label: "Login", path: "/login", icon: <FaSignInAlt className="text-[#00FFFF]" /> },
  { label: "Logout", path: "/logout", icon: <FaSignOutAlt className="text-[#00FFFF]" /> },
  { label: "About", path: "/about", icon: <FaInfoCircle className="text-[#00FFFF]" /> },
  { label: "Help", path: "/help", icon: <FaQuestionCircle className="text-[#00FFFF]" /> },
  { label: "Affiliates", path: "/affiliates", icon: <FaHandshake className="text-[#00FFFF]" /> },
];

const SidebarMenu = () => (
  <aside className="flex flex-col w-72 h-screen p-4 bg-black font-orbitron text-white shadow-[0_0_20px_#00FFFF]">
    {/* Logo */}
    <div className="flex items-center mb-6 p-2 rounded-lg border-2 border-[#00FFFF] shadow-[0_0_15px_#00FFFF]">
      <img
        src="/src/assets/logo.svg"
        alt="Logo"
        className="rounded-full w-12 h-12 border-2 border-[#00FFFF] shadow-[0_0_10px_#00FFFF]"
      />
      <span className="ml-3 font-bold text-lg text-[#00FFFF]">Admin Panel</span>
    </div>

    {/* Search */}
    <input
      type="text"
      placeholder="Search..."
      className="bg-black text-white rounded-lg p-2 mb-4 border-2 border-[#00FFFF] shadow-[0_0_8px_#00FFFF] focus:outline-none focus:border-[#00FF00] focus:shadow-[0_0_12px_#00FF00]"
    />

    {/* Scrollable Menu */}
    <nav className="flex-1 flex flex-col gap-3 overflow-auto">
      {menuItems.map(item => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 transform ${
              isActive
                ? "bg-[#00FFFF]/20 border-l-4 border-[#00FFFF] shadow-[0_0_12px_#00FFFF] scale-105"
                : "hover:bg-[#00FFFF]/10 hover:border-l-4 hover:border-[#00FFFF] hover:shadow-[0_0_8px_#00FFFF] hover:scale-105"
            }`
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default SidebarMenu;
