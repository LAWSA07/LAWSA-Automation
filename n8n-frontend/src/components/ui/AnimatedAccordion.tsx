"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionItem {
  title: string;
  content: string;
  icon?: string;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  className?: string;
}

const AnimatedAccordion = ({ items, className }: AnimatedAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm text-left transition-all duration-200 hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-2xl">{item.icon}</span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 dark:text-gray-400"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedAccordion; 