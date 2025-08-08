"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const GlowingStarsBackgroundCard = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const [mouseEnter, setMouseEnter] = useState(false);

  return (
    <div
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      className={cn(
        "bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 max-w-md max-h-[20rem] h-full w-full rounded-xl border border-neutral-600",
        className
      )}
    >
      <div className="flex justify-center items-center">
        <Illustration mouseEnter={mouseEnter} />
      </div>
      <div className="px-2 pb-6">{children}</div>
    </div>
  );
};

const Illustration = ({ mouseEnter }: { mouseEnter: boolean }) => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    const randomStar = () => ({
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      opacity: Math.random(),
      scale: Math.random() * 0.5 + 0.5,
    });
    setStars(Array.from({ length: 20 }).map(randomStar));
  }, []);

  return (
    <motion.div
      className="h-48 w-full relative"
      animate={{
        scale: mouseEnter ? 1.2 : 1,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <AnimatePresence>
        {stars.map((star, i) => (
          <motion.span
            key={i}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: star.opacity,
              scale: star.scale,
              x: (Math.random() - 0.5) * 50,
              y: (Math.random() - 0.5) * 50,
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: "2px",
              height: "2px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
            className="inline-block"
          ></motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}; 