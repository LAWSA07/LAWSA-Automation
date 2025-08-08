"use client";

import { motion } from "framer-motion";

const circleGroups = [
  { 
    id: 1, 
    x: "15%", 
    y: "20%", 
    circles: [
      { size: "w-16 h-16", opacity: "opacity-40", delay: 0.2 },
      { size: "w-14 h-14", opacity: "opacity-60", delay: 0.3 },
      { size: "w-12 h-12", opacity: "opacity-80", delay: 0.4 },
      { size: "w-10 h-10", opacity: "opacity-100", delay: 0.5 },
    ]
  },
  { 
    id: 2, 
    x: "80%", 
    y: "30%", 
    circles: [
      { size: "w-12 h-12", opacity: "opacity-40", delay: 0.6 },
      { size: "w-10 h-10", opacity: "opacity-60", delay: 0.7 },
      { size: "w-8 h-8", opacity: "opacity-80", delay: 0.8 },
    ]
  },
  { 
    id: 3, 
    x: "25%", 
    y: "70%", 
    circles: [
      { size: "w-20 h-20", opacity: "opacity-30", delay: 1.0 },
      { size: "w-18 h-18", opacity: "opacity-50", delay: 1.1 },
      { size: "w-16 h-16", opacity: "opacity-70", delay: 1.2 },
      { size: "w-14 h-14", opacity: "opacity-90", delay: 1.3 },
    ]
  },
  { 
    id: 4, 
    x: "70%", 
    y: "75%", 
    circles: [
      { size: "w-14 h-14", opacity: "opacity-40", delay: 1.4 },
      { size: "w-12 h-12", opacity: "opacity-60", delay: 1.5 },
      { size: "w-10 h-10", opacity: "opacity-80", delay: 1.6 },
    ]
  },
];

export function DecorativeBlocks() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {circleGroups.map((group) => (
        <div key={group.id} className="absolute" style={{ left: group.x, top: group.y }}>
          {group.circles.map((circle, index) => (
            <motion.div
              key={`${group.id}-${index}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: circle.delay,
                ease: "easeOut"
              }}
              className={`absolute ${circle.size} ${circle.opacity} bg-gradient-to-br from-orange-400 to-orange-600 rounded-full`}
              style={{
                left: `${index * 8}px`,
                top: `${index * 4}px`,
                zIndex: index,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
} 