"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="mx-auto max-w-4xl px-4 py-32 text-center">
      {/* Use motion.div for animations */}
      <motion.div
        // Animation properties
        initial={{ opacity: 0, y: 20 }} // Starts invisible and 20px down
        animate={{ opacity: 1, y: 0 }}   // Animates to visible and its original position
        transition={{ duration: 0.5 }}     // Animation takes 0.5 seconds
      >
        {/* Main Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          The Ultimate SaaS Platform to <span className="text-blue-600">Boost Your Productivity</span>
        </h1>

        {/* Sub-headline/Description */}
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Stop juggling between tools. Our platform integrates everything you need
          to streamline your workflow, collaborate with your team, and achieve your goals faster.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg">
            Get Started for Free
          </Button>
          <Button size="lg" variant="outline">
            Learn More →
          </Button>
        </div>
      </motion.div>
    </section>
  );
}; 