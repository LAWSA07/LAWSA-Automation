"use client";
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  icon?: string;
  title?: string;
  description?: string;
}

const AnimatedCard = ({ 
  children, 
  className, 
  delay = 0, 
  icon, 
  title, 
  description 
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        "group relative rounded-2xl bg-white/80 dark:bg-slate-800/80 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        {icon && (
          <motion.div 
            className="text-4xl mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        
        {title && (
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {description}
          </p>
        )}
        
        {children}
        
        {/* Hover Effect Line */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default AnimatedCard; 