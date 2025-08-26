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

import "./sidebarMenu.css"; // Import your custom CSS

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
  { label: "Affiliates", path: "/affiliates", icon: <FaHandshake /> }
];

const SidebarMenu = () => {
  return (
    <aside className="sidebar-menu">
      {/* Logo */}
      <div className="logo-container">
        <img src="/src/assets/logo.svg" alt="Logo" className="logo" />
        <span className="logo-text">Admin Panel</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
      />

      {/* Menu Items */}
      <ul>
        {menuItems.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarMenu;
