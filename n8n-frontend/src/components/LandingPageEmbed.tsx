import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './LandingPage';

// This component is designed to be embedded in the HTML landing page
const LandingPageEmbed: React.FC = () => {
  return <LandingPage />;
};

// Function to mount the React component to a DOM element
export function mountLandingPage(elementId: string) {
  const container = document.getElementById(elementId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <LandingPageEmbed />
      </React.StrictMode>
    );
    return true;
  }
  return false;
}

// Auto-mount when this script is loaded directly
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Look for a container with id 'react-landing-page'
    const success = mountLandingPage('react-landing-page');
    if (success) {
      console.log('React landing page mounted successfully');
    }
  });
}