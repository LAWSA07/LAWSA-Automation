import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="bg-background text-foreground">
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6 text-foreground font-bold">
            Build AI Agents. Visually.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Transform complex AI workflows into simple drag-and-drop designs. LAWSA democratizes agentic automation by giving you the power of LangGraph and LangChain with none of the code.
          </p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg font-bold transition-transform hover:scale-105"
            >
              Start Your Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-border text-foreground hover:bg-accent h-14 px-10 text-lg"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Product Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="relative p-2 bg-muted/20 rounded-xl shadow-2xl">
            <div className="aspect-video bg-muted/5 rounded-lg overflow-hidden border border-border">
              {/* Placeholder for demo video/image */}
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">LAWSA Workflow Editor Demo</p>
                  <p className="text-sm opacity-70">Interactive drag-and-drop interface</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
