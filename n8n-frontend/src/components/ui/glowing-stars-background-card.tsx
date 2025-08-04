import React, { ReactNode } from "react";
export function GlowingStarsBackgroundCard({ children, className = "", ...props }: { children: ReactNode, className?: string }) {
  return (
    <div className={"relative bg-white/10 border border-gray-200 shadow-lg rounded-xl p-4 " + className} {...props}>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
} 