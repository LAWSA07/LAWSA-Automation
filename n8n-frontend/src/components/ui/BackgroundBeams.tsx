"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-0 overflow-hidden",
        className
      )}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-brand-charcoal"></div>
        
        {/* Animated beam lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 1, 0.3, 0], 
              scaleY: [0, 1, 0.8, 0],
              x: [0, Math.random() * 100 - 50, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              ease: "easeInOut", 
              repeat: Infinity, 
              repeatDelay: Math.random() * 3,
              delay: i * 0.2 
            }}
            className={`absolute h-full w-0.5 bg-gradient-to-b from-transparent via-brand-purple to-transparent blur-sm`}
            style={{
              left: `${10 + i * 10}%`,
              top: 0,
              transformOrigin: 'center'
            }}
          />
        ))}
        
        {/* Central glowing orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.3, 0.8, 0.4], 
            scale: [0.8, 1.2, 0.9],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-1/2 left-1/2 h-96 w-96 bg-gradient-to-r from-brand-purple/30 via-brand-gold/20 to-brand-orange/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
        />
        
        {/* Additional floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0.2, 0],
              x: [0, Math.random() * 200 - 100, Math.random() * 100 - 50],
              y: [0, Math.random() * 200 - 100, Math.random() * 150 - 75],
              scale: [0.5, 1, 0.3]
            }}
            transition={{ 
              duration: 4 + Math.random() * 3, 
              ease: "easeInOut", 
              repeat: Infinity, 
              repeatDelay: Math.random() * 4,
              delay: i * 0.3 
            }}
            className="absolute w-2 h-2 bg-brand-gold rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};
