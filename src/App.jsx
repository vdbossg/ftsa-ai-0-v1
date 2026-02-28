//FTSA_AI_0.v1\src\App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarMenu from './components/SidebarMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrainDataProvider } from './contexts/BrainDataContext'; // ✅ Import BrainDataProvider
import { LanguageProvider } from "./contexts/LanguageContext";


// Import pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BrainPage from './pages/BrainPage'; // 🧠 New brain control page
import StatusPage from './pages/StatusPage';
import BinancePage from './pages/BinancePage';
import MTAccountsPage from './pages/MTAccountsPage';
import PropFirmAccountsPage from './pages/PropFirmAccountsPage';
import JournalPage from './pages/JournalPage';
import TradesPage from './pages/TradesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import AffiliatesPage from './pages/AffiliatesPage';
import TradingViewPage from './pages/TradingViewPage'; // <-- ADD THIS
import EADownloadPage from './pages/EA_DownloadPage';
import TopNav from "./components/TopNav";
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';



import { FaHome, FaChartBar, FaInfoCircle, FaSignOutAlt, FaSignInAlt, FaChartLine, FaServer, FaBitcoin, FaUserCog, FaBook, FaCog, FaExchangeAlt, FaQuestionCircle, FaHandshake, FaRegQuestionCircle, FaUser } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa';
import { FaDownload } from 'react-icons/fa';


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  const links = isAuthenticated
    ? [
        { label: 'Home', path: '/', icon: <FaHome /> },
        { label: 'Dashboard', path: '/dashboard', icon: <FaChartBar /> },
        { label: 'AI Brain', path: '/brain', icon: <FaBrain /> },
        { label: 'Status', path: '/status', icon: <FaServer /> },
        { label: 'EA Download', path: '/ea-download', icon: <FaDownload /> },
        { label: 'Binance', path: '/binance', icon: <FaBitcoin /> },
        { label: 'TradingView', path: '/tradingview', icon: <FaChartLine /> },
        { label: 'MT Accounts', path: '/mtaccounts', icon: <FaUserCog /> },
        { label: 'Prop Firm Accounts', path: '/propfirmaccounts', icon: <FaUser /> },
        { label: 'Journal', path: '/journal', icon: <FaBook /> },
        { label: 'Trades', path: '/trades', icon: <FaExchangeAlt /> },
        { label: 'Settings', path: '/settings', icon: <FaCog /> },
        { label: 'About', path: '/about', icon: <FaInfoCircle /> },
        { label: 'Help', path: '/help', icon: <FaRegQuestionCircle /> },
        { label: 'Affiliates', path: '/affiliates', icon: <FaHandshake /> },
        { label: 'Logout', path: '/logout', icon: <FaSignOutAlt /> },
      ]
    : [
        { label: 'Login', path: '/login', icon: <FaSignInAlt /> },
        { label: 'About', path: '/about', icon: <FaInfoCircle /> },
        { label: 'Help', path: '/help', icon: <FaQuestionCircle /> },

      ];

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
  <SidebarMenu links={links} />
  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
    <TopNav />
    <main style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
         
          />
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>

          <Route
            path="/brain"
            element={
              <ProtectedRoute>
                <BrainPage />
               </ProtectedRoute>
            }
          />
          <Route
            path="/status"
            element={
              <ProtectedRoute>
                <StatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/binance"
            element={
              <ProtectedRoute>
                <BinancePage />
              </ProtectedRoute>
            }
          />
          <Route
  path="/ea-download"
  element={
    <ProtectedRoute>
      <EADownloadPage />
    </ProtectedRoute>
  }
/>

          <Route
  path="/tradingview"
  element={
    <ProtectedRoute>
      <TradingViewPage />
    </ProtectedRoute>
  }
/>

          <Route
            path="/mtaccounts"
            element={
              <ProtectedRoute>
                <MTAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/propfirmaccounts"
            element={
              <ProtectedRoute>
                <PropFirmAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trades"
            element={
              <ProtectedRoute>
                <TradesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/affiliates"
            element={
              <ProtectedRoute>
                <AffiliatesPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all unmatched route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>      {/* <-- ADD THIS */}
        <BrainDataProvider>
          <Router>
            <AppContent />
          </Router>
        </BrainDataProvider>
      </LanguageProvider>     {/* <-- CLOSE HERE */}
    </AuthProvider>
  );
}
