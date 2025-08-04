import React from "react";

export function EvervaultCard({ children, className = "", ...props }) {
  return (
    <div className={"rounded-xl bg-white/10 border border-gray-200 shadow-md p-4 " + className} {...props}>
      {children}
    </div>
  );
} 