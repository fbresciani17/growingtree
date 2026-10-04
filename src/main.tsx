import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { FamilyTreeProvider } from './context/FamilyTreeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FamilyTreeProvider>
        <App />
      </FamilyTreeProvider>
    </AuthProvider>
  </React.StrictMode>
);
