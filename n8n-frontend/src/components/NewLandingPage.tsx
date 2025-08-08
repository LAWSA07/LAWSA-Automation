import React from "react";
import { motion } from "framer-motion";
import { Header } from "./landing/Header";
import { HeroSection } from "./landing/HeroSection";
import { FeaturesShowcase } from "./landing/FeaturesShowcase";
import { HowItWorks } from "./landing/HowItWorks";
import { FaqSection } from "./landing/FaqSection";
import { Footer } from "./landing/Footer";

export function NewLandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesShowcase />
      <HowItWorks />
      <FaqSection />
      <Footer />
    </main>
  );
}
