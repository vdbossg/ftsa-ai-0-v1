import React from "react";
import React, { useState } from "react"; 
import MessageModal from "./MessageModal";
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
            FaDownload
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
      { label: "Affiliates", path: "/affiliates", icon: <FaHandshake /> },
];

const SidebarMenu = ({ links = defaultLinks, unreadMessages = 0, messages = [] }) => {

  const location = useLocation();
const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // ✅ Fixed
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
        <li>
  <div
    className="sidebar-link"
    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    onClick={() => setIsMessageModalOpen(true)}
    tabIndex={0}
  >
    <span className="icon"><FaEnvelope /></span>
    Messages
    {unreadMessages > 0 && (
      <span style={{
        marginLeft: "auto",
        background: "red",
        color: "#fff",
        borderRadius: "50%",
        width: 18,
        height: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem"
      }}>{unreadMessages}</span>
    )}
  </div>
</li>

      </ul>
      {/* Messages Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        messages={messages}
      />
    </nav>
  );
};

export default SidebarMenu;
