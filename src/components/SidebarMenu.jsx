import React from "react";
import { NavLink } from "react-router-dom";
import { 
    FaHome, 
  FaChartBar, 
  FaBrain, 
  FaServer, 
  FaBitcoin, 
  FaUserCog, 
  FaUsers, 
  FaBook, 
  FaExchangeAlt, 
  FaCogs, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaInfoCircle, 
  FaQuestionCircle, 
  FaHandshake
} from "react-icons/fa";

const menuItems = [
  { label: "Home", path: "/", icon: <FaHome /> },
  { label: "Dashboard", path: "/dashboard", icon: <FaChartBar /> },
  { label: "AI Brain", path: "/brain", icon: <FaBrain /> },
  { label: "Status", path: "/status", icon: <FaServer /> },
  { label: "Binance", path: "/binance", icon: <FaBitcoin /> },
  { label: "MT Accounts", path: "/mtaccounts", icon: <FaUserCog /> },
  { label: "Prop Firm Accounts", path: "/propfirmaccounts", icon: <FaUsers /> },
  { label: "Journal", path: "/journal", icon: <FaBook /> },
  { label: "Trades", path: "/trades", icon: <FaExchangeAlt /> },
  { label: "Settings", path: "/settings", icon: <FaCogs /> },
  { label: "Login", path: "/login", icon: <FaSignInAlt /> },
  { label: "Logout", path: "/logout", icon: <FaSignOutAlt /> },
  { label: "About", path: "/about", icon: <FaInfoCircle /> },
  { label: "Help", path: "/help", icon: <FaQuestionCircle /> },
  { label: "Affiliates", path: "/affiliates", icon: <FaHandshake /> },
];

const SidebarMenu = () => (
  <aside className="flex flex-col w-72 bg-[#075E54] text-white h-screen p-4">
    {/* Logo */}
    <div className="flex items-center mb-6">
      <img
        src="/src/assets/logo.svg"
        alt="Logo"
        className="rounded-full w-12 h-12 border-2 border-white"
      />
      <span className="ml-3 font-bold text-lg">Admin Panel</span>
    </div>

    {/* Search */}
    <input
      type="text"
      placeholder="Search..."
      className="bg-[#ECE5DD] text-black rounded-lg p-2 mb-4 focus:outline-none"
    />

    {/* Scrollable Menu */}
    <nav className="flex-1 flex flex-col gap-2 overflow-auto">
      {menuItems.map(item => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              isActive ? "bg-[#128C7E]" : "hover:bg-[#128C7E]/70"
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default SidebarMenu;
