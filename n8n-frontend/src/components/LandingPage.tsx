"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Zap, Shield, Eye, Brain, Settings, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import { BentoGrid, BentoGridItem } from './ui/BentoGrid';
import { GlowingStarsBackgroundCard } from './ui/GlowingStarsBackgroundCard';
import { Vortex } from './ui/Vortex';

export function LandingPage() {
  return (
    <main className="w-full bg-brand-charcoal min-h-screen">
      {/* Hero Section */}
      <div className="h-[50rem] w-full bg-brand-charcoal relative flex flex-col items-center justify-center antialiased">
        <BackgroundBeams />
        <div className="max-w-2xl mx-auto p-4 text-center relative z-10">
          <TextGenerateEffect
            words="Orchestrate AI Agents. No Code Required."
            className="text-4xl md:text-7xl font-bold text-white mb-6"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-neutral-300 max-w-lg mx-auto my-4 text-sm md:text-base mb-8"
          >
            LAWSA is a visual automation platform that translates your ideas into powerful, multi-agent workflows. Drag, drop, and deploy.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-brand-gold to-brand-orange text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform duration-200"
          >
            Start Building for Free
          </motion.button>
        </div>
      </div>

      {/* Trust & Integration Bar */}
      <div className="py-16 px-4 bg-gradient-to-r from-brand-charcoal to-brand-navy border-y border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm text-gray-400 mb-8"
          >
            Built with enterprise-grade technologies trusted by developers worldwide
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-12 flex-wrap"
          >
            {[
              { name: 'LangChain', logo: '🔗' },
              { name: 'LangGraph', logo: '📊' },
              { name: 'FastAPI', logo: '⚡' },
              { name: 'React', logo: '⚛️' },
              { name: 'Groq', logo: '🚀' },
              { name: 'OpenAI', logo: '🤖' },
              { name: 'Anthropic', logo: '🧠' },
              { name: 'MongoDB', logo: '🍃' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-2xl">{tech.logo}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-20 px-4 bg-brand-navy">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-white">
          The <span className="text-brand-purple">"Aha!"</span> Moment, Visualized.
        </h2>
        <BentoGrid className="max-w-4xl mx-auto">
          {/* Main Feature - Visual Workflow Editor */}
          <BentoGridItem
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-brand-purple/20 to-brand-navy/20 border-brand-purple/30"
            title={
              <GlowingStarsBackgroundCard>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-white">Visual Workflow Editor</h3>
                  <p className="text-gray-300">The "Aha!" moment for non-technical users - drag, drop, and connect nodes to build complex AI workflows</p>
                </div>
              </GlowingStarsBackgroundCard>
            }
          />
          
          {/* Multi-Provider LLM Support */}
          <BentoGridItem
            className="bg-gradient-to-br from-brand-gold/20 to-brand-orange/20 border-brand-gold/30"
            title="Multi-Provider LLM Support"
            description="OpenAI • Groq • Anthropic • Together • Local Models"
            icon={<div className="w-6 h-6 bg-gradient-to-r from-brand-gold to-brand-orange rounded-full" />}
          />
          
          {/* Secure Credential Management */}
          <BentoGridItem
            className="bg-gradient-to-br from-brand-green/20 to-brand-purple/20 border-brand-green/30"
            title="Secure Credential Management"
            description="Bank-grade Fernet encryption for your API keys and secrets"
            icon={<div className="w-6 h-6 bg-gradient-to-r from-brand-green to-brand-purple rounded-full" />}
          />
          
          {/* Real-Time Streaming */}
          <BentoGridItem
            className="bg-gradient-to-br from-brand-purple/20 to-brand-navy/20 border-brand-purple/30"
            title="Real-Time Streaming Output"
            description="Watch your agents execute live with Server-Sent Events (SSE)"
            icon={<div className="w-6 h-6 bg-gradient-to-r from-brand-purple to-brand-gold rounded-full animate-pulse" />}
          />
        </BentoGrid>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-brand-charcoal via-brand-navy to-brand-charcoal relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It <span className="text-brand-gold">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Simple steps to create powerful AI agents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-brand-purple to-brand-gold rounded-full flex items-center justify-center text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Design</h3>
              <p className="text-gray-300 leading-relaxed">
                Visually map your workflow with our intuitive drag-and-drop editor. No coding required.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-brand-gold to-brand-orange rounded-full flex items-center justify-center text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Configure</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect your favorite LLMs, tools, and credentials in just a few clicks.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-brand-orange to-brand-green rounded-full flex items-center justify-center text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Execute</h3>
              <p className="text-gray-300 leading-relaxed">
                Run your agent and watch the results stream in, live and in real-time.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section with Vortex */}
      <Vortex
        containerClassName="py-20 px-4 bg-gradient-to-r from-brand-purple to-brand-navy"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <div className="text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-2xl md:text-6xl font-bold mb-6"
          >
            Ready to Build Your First AI Agent?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-sm md:text-2xl max-w-xl mx-auto mb-8"
          >
            Sign up for free. No credit card required.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-brand-gold to-brand-orange text-black font-bold rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-200"
          >
            Get Started Now
          </motion.button>
        </div>
      </Vortex>
    </main>
  );
}