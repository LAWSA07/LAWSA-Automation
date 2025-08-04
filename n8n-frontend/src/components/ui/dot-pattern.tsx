import React from "react";
export function DotPattern({ className = "", ...props }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" {...props}>
      <circle cx="10" cy="10" r="2" fill="#bbb" />
      <circle cx="30" cy="30" r="2" fill="#bbb" />
      <circle cx="50" cy="50" r="2" fill="#bbb" />
    </svg>
  );
} 