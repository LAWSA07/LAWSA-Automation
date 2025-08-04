import React from "react";

export function SparklesCore({ className = "", ...props }) {
  // Placeholder: just a static set of dots for now
  return (
    <div className={"absolute inset-0 pointer-events-none z-0 " + className} {...props}>
      {/* You can replace this with a real animated effect later */}
      <svg width="100%" height="100%">
        <circle cx="20" cy="20" r="2" fill="#fff" opacity="0.5" />
        <circle cx="80" cy="40" r="1.5" fill="#fff" opacity="0.3" />
        <circle cx="60" cy="80" r="2.5" fill="#fff" opacity="0.4" />
      </svg>
    </div>
  );
} 