import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarMenu from './components/SidebarMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrainDataProvider } from './contexts/BrainDataContext'; // ✅ Import BrainDataProvider


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



import { FaHome, FaChartBar, FaInfoCircle, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa';


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
        { label: 'Status', path: '/status' },
        { label: 'Binance', path: '/binance' },
        { label: 'MT Accounts', path: '/mtaccounts' },
        { label: 'Prop Firm Accounts', path: '/propfirmaccounts' },
        { label: 'Journal', path: '/journal' },
        { label: 'Trades', path: '/trades' },
        { label: 'Settings', path: '/settings' },
        { label: 'About', path: '/about', icon: <FaInfoCircle /> },
        { label: 'Help', path: '/help' },
        { label: 'Affiliates', path: '/affiliates' },
        { label: 'Logout', path: '/logout', icon: <FaSignOutAlt /> },
      ]
    : [
        { label: 'Login', path: '/login', icon: <FaSignInAlt /> },
        { label: 'About', path: '/about', icon: <FaInfoCircle /> },
        { label: 'Help', path: '/help' },

      ];

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
      <SidebarMenu links={links} />
      <main style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/logout" element={<LogoutPage />} />

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
</div> ); } export default function App() { return ( <AuthProvider> <BrainDataProvider> <Router> <AppContent /> </Router> </BrainDataProvider> </AuthProvider> ); }