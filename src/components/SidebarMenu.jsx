import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaChartBar, 
  FaInfoCircle, 
  FaSignOutAlt, 
  FaSignInAlt 
} from "react-icons/fa";

import "../styles/sidebarMenu.css";

const defaultLinks = [
  { label: "Home", path: "/", icon: <FaHome /> },
  { label: "Dashboard", path: "/dashboard", icon: <FaChartBar /> },
  { label: "AI Brain", path: "/brain" }, // ✅ New Brain page link
  { label: "Status", path: "/status" },
  { label: "Binance", path: "/binance" },
  { label: "MT Accounts", path: "/mtaccounts" },
  { label: "Prop Firm Accounts", path: "/propfirmaccounts" },
  { label: "Journal", path: "/journal" },
  { label: "Trades", path: "/trades" },
  { label: "Settings", path: "/settings" },
  { label: "Login", path: "/login", icon: <FaSignInAlt /> },
  { label: "Logout", path: "/logout", icon: <FaSignOutAlt /> },
  { label: "About", path: "/about", icon: <FaInfoCircle /> },
  { label: "Help", path: "/help" },
  { label: "Affiliates", path: "/affiliates" },
];

const SidebarMenu = ({ links = defaultLinks }) => {
  const location = useLocation();

  return (
    <nav className="sidebar-menu" aria-label="Main navigation">
      <ul>
        {links.map(({ label, path, icon }, index) => {
          const isActive = location.pathname === path;
          return (
            <li key={index} className={isActive ? "active" : ""}>
              <Link to={path} className="sidebar-link" tabIndex={0}>
                {icon && <span className="icon">{icon}</span>}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
