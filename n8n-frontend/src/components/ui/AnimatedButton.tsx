"use client";
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  icon?: ReactNode;
}

const AnimatedButton = ({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  onClick,
  icon
}: AnimatedButtonProps) => {
  const baseClasses = "relative font-medium transition-all duration-200 overflow-hidden rounded-xl flex items-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-400",
    outline: "border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Gradient Overlay for Primary */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {icon && (
          <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        {children}
      </span>
    </motion.button>
  );
};

export default AnimatedButton; 