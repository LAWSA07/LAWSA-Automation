"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export const Vortex = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const vortexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vortexRef.current) return;

    const vortex = vortexRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = vortex.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      vortex.style.setProperty("--mouse-x", `${mouseX}px`);
      vortex.style.setProperty("--mouse-y", `${mouseY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={vortexRef}
      className={cn("relative h-[30rem] w-full overflow-hidden", containerClassName)}
      style={{
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-brand-purple via-brand-navy to-brand-gold opacity-20 blur-3xl animate-aurora",
          className
        )}
      />
      
      {/* Animated rings */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border border-white/10 rounded-full animate-spin"
            style={{
              animationDuration: `${8 + i * 2}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
              transform: `scale(${0.8 + i * 0.1})`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient following mouse */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(168, 85, 247, 0.3), transparent 40%)`,
        }}
      />

      {children}
    </div>
  );
}; 