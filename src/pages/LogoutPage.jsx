import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout(); // clear user
    navigate('/login'); // go to login page
  }, [logout, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Logging out...</p>
    </div>
  );
}
