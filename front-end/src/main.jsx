import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { Web3AuthProvider } from './context/Web3AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3AuthProvider>
  </React.StrictMode>
);
