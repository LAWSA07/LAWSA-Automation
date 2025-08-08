import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './components/LandingPage';
import './index.css';

// Create a root for the landing page
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
);