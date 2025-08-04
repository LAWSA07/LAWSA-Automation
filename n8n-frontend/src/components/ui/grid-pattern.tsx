import React from "react";
export function GridPattern({ className = "", ...props }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" {...props}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#eee" strokeWidth="1" />
      <line x1="20" y1="0" x2="20" y2="100%" stroke="#eee" strokeWidth="1" />
      <line x1="0" y1="20" x2="100%" y2="20" stroke="#eee" strokeWidth="1" />
    </svg>
  );
}