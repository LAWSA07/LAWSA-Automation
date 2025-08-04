import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LAWSA! 🚀',
    description: 'Let\'s take a quick tour to get you started with building powerful automation workflows.',
    target: '.topbar-grid',
    position: 'bottom'
  },
  {
    id: 'sidebar',
    title: 'Node Library',
    description: 'Drag nodes from the sidebar to your canvas. Each node has a specific function in your workflow.',
    target: '.sidebar',
    position: 'right'
  },
  {
    id: 'canvas',
    title: 'Workflow Canvas',
    description: 'This is where you\'ll build your automation. Connect nodes by dragging from output to input handles.',
    target: '.main-canvas-grid',
    position: 'top'
  },
  {
    id: 'run',
    title: 'Run Your Workflow',
    description: 'Click "Run Workflow" to execute your automation and see it in action!',
    target: 'button:contains("Run Workflow")',
    position: 'bottom'
  },
  {
    id: 'export',
    title: 'Export & Share',
    description: 'Export your workflows to share with your team or save for later use.',
    target: 'button:contains("Export")',
    position: 'bottom'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentTourStep = tourSteps[currentStep];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
            }}
            onClick={onClose}
          />

          {/* Tour Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              zIndex: 10000,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              color: '#1a1a2e',
              fontFamily: 'Inter, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}>
                {tourSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === currentStep 
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                        : 'rgba(0, 0, 0, 0.2)',
                    }}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <motion.button
                onClick={handleSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Skip Tour
              </motion.button>
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {currentTourStep.title}
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: 1.5,
                color: '#666',
                marginBottom: '20px',
              }}>
                {currentTourStep.description}
              </p>
            </motion.div>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                style={{
                  background: currentStep === 0 ? 'rgba(0, 0, 0, 0.1)' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: currentStep === 0 ? '#999' : '#000',
                  fontWeight: 600,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
                whileHover={currentStep === 0 ? {} : { scale: 1.05 }}
                whileTap={currentStep === 0 ? {} : { scale: 0.95 }}
              >
                Previous
              </motion.button>

              <motion.button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started!' : 'Next'}
              </motion.button>
            </div>
          </motion.div>

          {/* Spotlight Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          >
            {/* This would be positioned dynamically based on the target element */}
            <div style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
              animation: 'pulse 2s infinite',
            }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour; 