import React, { useState } from 'react';

const LoginPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    // Your login logic here
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // Your logout logic here
    setLoggedIn(false);
  };

  if (!loggedIn) {
    // Show login form
    return (
      <div>
        <h2>Login</h2>
        {/* Replace with your actual login form */}
        <button onClick={handleLogin}>Log In</button>
      </div>
    );
  } else {
    // Show logout confirmation
    return (
      <div>
        <h2>Welcome, User!</h2>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    );
  }
};

export default LoginPage;
