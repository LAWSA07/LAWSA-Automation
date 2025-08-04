import React from "react";

export function BackgroundGradient({ className = "", ...props }) {
  return (
    <div
      className={"absolute inset-0 bg-gradient-to-br from-purple-200/40 to-blue-200/30 blur-2xl " + className}
      style={{ zIndex: 0 }}
      {...props}
    />
  );
} 