"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { NewLandingPage } from './NewLandingPage';

interface HomePageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NewLandingPage />
    </div>
  );
};

export default HomePage; 