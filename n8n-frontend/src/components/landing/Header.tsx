import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-6">
        <a href="#" className="flex items-center">
          <div className="text-2xl font-bold text-primary">LAWSA</div>
        </a>
        
        <nav className="hidden md:flex space-x-8">
          <a 
            href="#features" 
            className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            FAQ
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-border text-foreground hover:bg-accent">
            Sign In
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Start Building
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
