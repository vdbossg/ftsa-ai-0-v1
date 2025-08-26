import React from "react";
import { Link, useLocation } from "react-router-dom";
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

import "../styles/sidebarMenu.css";

const defaultLinks = [
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
