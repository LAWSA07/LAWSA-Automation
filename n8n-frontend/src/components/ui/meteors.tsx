import React from "react";
export function Meteors({ className = "", ...props }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" {...props}>
      <line x1="10" y1="10" x2="100" y2="100" stroke="#FFD700" strokeWidth="2" />
    </svg>
  );
} 