"use client";

import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
          <Image
            src="/lawsa-logo.png"
            alt="LAWSA Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </a>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink 
                href="#features" 
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Features
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                href="#how-it-works" 
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                How It Works
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                href="#faq" 
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                FAQ
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent">
              Sign In
            </Button>
          </Link>
          <Link href="/workflow">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Start Building
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
} 