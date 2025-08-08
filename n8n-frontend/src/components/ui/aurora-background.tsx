"use client";
import { cn } from "../../utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export const AuroraBackground = ({
  children,
  showRadialGradient = true,
  className,
}: {
  children?: React.ReactNode;
  showRadialGradient?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center overflow-hidden bg-slate-950 w-full",
        className
      )}
    >
      <div className="absolute inset-0 w-full h-full bg-slate-950">
        <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent)]">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-auto right-1/2 h-56 overflow-visible w-1/2 bg-gradient-conic from-purple-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 h-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
            <div className="absolute w-[100%] left-0 h-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute inset-auto left-1/2 h-32 w-[0.5rem] bg-gradient-to-b from-purple-500 via-transparent to-transparent text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute inset-auto left-1/2 h-56 w-1/2 bg-gradient-conic from-transparent via-purple-500 to-transparent text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 h-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
            <div className="absolute w-[100%] left-0 h-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute inset-auto right-1/2 h-32 w-[0.5rem] bg-gradient-to-b from-transparent via-purple-500 to-purple-500 text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute inset-auto left-1/2 h-32 w-[0.5rem] bg-gradient-to-b from-purple-500 via-transparent to-transparent text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
            <div className="absolute w-[100%] left-0 h-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[100px] opacity-70" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}; 