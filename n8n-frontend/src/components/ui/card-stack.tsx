import React, { ReactNode } from "react";
export function CardStack({ children, className = "", ...props }: { children: ReactNode, className?: string }) {
  return (
    <div className={"flex flex-col gap-2 " + className} {...props}>
      {children}
    </div>
  );
} 