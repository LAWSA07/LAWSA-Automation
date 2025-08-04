import React from 'react';
import { motion } from 'framer-motion';

interface HomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: '#fff'
      }}
    >
      {/* Hero Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', maxWidth: '800px' }}
      >
        <motion.h1 
          style={{
            fontSize: '4rem',
            fontWeight: 900,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          LAWSA
        </motion.h1>
        
        <motion.p 
          style={{
            fontSize: '1.5rem',
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: 1.6
          }}
        >
          Intelligent workflow automation powered by AI agents
        </motion.p>

        <motion.div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <motion.button
            onClick={onGetStarted}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>

          <motion.button
            onClick={onLogin}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #FFD700',
              background: 'transparent',
              color: '#FFD700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          width: '100%'
        }}
      >
        {[
          {
            icon: '🧠',
            title: 'AI Agents',
            description: 'Intelligent automation with AI-powered decision making'
          },
          {
            icon: '🔧',
            title: 'Visual Workflows',
            description: 'Drag-and-drop interface for building complex workflows'
          },
          {
            icon: '⚡',
            title: 'Real-time Execution',
            description: 'Monitor and control workflow execution in real-time'
          },
          {
            icon: '🔗',
            title: 'Integrations',
            description: 'Connect with your favorite tools and services'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>
              {feature.title}
            </h3>
            <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={{
          marginTop: '80px',
          textAlign: 'center',
          opacity: 0.6,
          fontSize: '0.9rem'
        }}
      >
        <p>© 2024 LAWSA. Intelligent workflow automation.</p>
      </motion.div>
    </motion.div>
  );
};

export default HomePage; 