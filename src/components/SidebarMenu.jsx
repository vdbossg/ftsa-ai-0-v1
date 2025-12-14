//import React from "react";
import React, { useState } from "react";
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
            FaHandshake,
            FaChartLine,
            FaDownload,
            FaBell
} from "react-icons/fa";

import "../styles/sidebarMenu.css";

const defaultLinks = [
  { label: "Home", path: "/", icon: <FaHome /> }, 
  { label: "Dashboard", path: "/dashboard", icon: <FaChartBar /> },
   { label: "AI Brain", path: "/brain", icon: <FaBrain /> }, 
   { label: "Status", path: "/status", icon: <FaServer /> },
   { label: "EA Download", path: "/ea-download", icon: <FaDownload /> },
    { label: "Binance", path: "/binance", icon: <FaBitcoin /> }, 
    { label: "TradingView", path: "/tradingview", icon: <FaChartLine /> },
    { label: "MT Accounts", path: "/mtaccounts", icon: <FaUserCog /> }, 
    { label: "Prop Firm Accounts", path: "/propfirmaccounts", icon: <FaUsers /> }, 
    { label: "Journal", path: "/journal", icon: <FaBook /> }, 
    { label: "Trades", path: "/trades", icon: <FaExchangeAlt /> }, 
    { label: "Settings", path: "/settings", icon: <FaCogs /> },
     { label: "Login", path: "/login", icon: <FaSignInAlt /> }, 
     { label: "Logout", path: "/logout", icon: <FaSignOutAlt /> },
      { label: "About", path: "/about", icon: <FaInfoCircle /> }, 
      { label: "Help", path: "/help", icon: <FaQuestionCircle /> }, 
      { label: "Notifications", path: "/notifications", icon: <FaBell /> },
      { label: "Affiliates", path: "/affiliates", icon: <FaHandshake /> },
];

const SidebarMenu = ({ links = defaultLinks }) => {
  const location = useLocation();

  return (
  <aside className="sidebar">
    <nav className="sidebar-menu" aria-label="Main navigation">
      <ul className="sidebar-list">
        {links.map(({ label, path, icon }, index) => {
          const isActive = location.pathname === path;
          return (
            <li key={index} className={isActive ? "active" : ""}>
              <Link to={path} className="sidebar-link">
                <span className="icon">{icon}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
);
};

export default SidebarMenu;
