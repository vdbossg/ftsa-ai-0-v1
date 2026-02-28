// index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import Modal from "react-modal";

// Log when React starts
console.log("React app starting...");

Modal.setAppElement("#root");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log when React has rendered
console.log("React app rendered");