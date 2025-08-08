"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

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
          <h1 className="font-santi-black text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6 text-foreground">
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

        {/* Product Visual - GIF Implementation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="relative p-2 bg-muted/20 rounded-xl shadow-2xl">
            <div className="aspect-video bg-muted/5 rounded-lg overflow-hidden border border-border">
              {/* GIF Display - Now Active */}
              <Image
                src="/workflow-demo.gif"
                alt="LAWSA Interactive Workflow Editor Demo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 