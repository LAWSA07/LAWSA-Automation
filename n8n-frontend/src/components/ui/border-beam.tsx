import React from "react";
export function BorderBeam({ className = "", ...props }: { className?: string }) {
  return (
    <div className={"absolute inset-0 border-2 border-purple-400 rounded-xl pointer-events-none " + className} {...props} />
  );
} 