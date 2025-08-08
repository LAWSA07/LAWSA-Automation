"use client";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'demo', 'stats', 'how-it-works', 'pricing', 'cta'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      let currentSection = 'home';
      sectionElements.forEach((element, index) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = sections[index];
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'demo', label: 'Demo', icon: '🎬' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'how-it-works', label: 'How It Works', icon: '⚙️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'cta', label: 'Get Started', icon: '🚀' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
      className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
    >
      <div className="flex flex-col space-y-4">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 + index * 0.1 }}
            onClick={() => scrollToSection(item.id)}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              activeSection === item.id
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 hover:bg-purple-600 hover:text-white shadow-md hover:shadow-lg'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Active Indicator */}
            {activeSection === item.id && (
              <motion.div
                layoutId="floatingActive"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 text-lg">
              {item.icon}
            </span>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 px-3 py-1 bg-gray-900 dark:bg-slate-700 text-white text-sm rounded-lg whitespace-nowrap"
            >
              {item.label}
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-slate-700 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default FloatingNav; 