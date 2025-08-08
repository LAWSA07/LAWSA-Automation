"use client";
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Zap, Users, CheckCircle, Brain, Shield } from 'lucide-react';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { TextGenerateEffect } from './ui/TextGenerateEffect';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Beams */}
      <BackgroundBeams />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Automation Platform
          </motion.div>

          {/* Main Headline with Text Generate Effect */}
          <div className="mb-6">
            <TextGenerateEffect 
              words="Orchestrate AI Agents. No Code Required."
              className="text-white"
            />
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            LAWSA is a visual automation platform that translates your ideas into powerful, multi-agent workflows. 
            <br />
            <span className="text-purple-400 font-semibold">Drag, drop, and deploy.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Start Building for Free
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              className="group flex items-center gap-3 px-8 py-4 text-white font-semibold text-lg hover:text-purple-300 transition-colors duration-200"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span>Watch Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Trust & Integration Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <p className="text-sm text-gray-400 mb-6">Built with enterprise-grade technologies</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { name: 'LangChain', icon: '🔗' },
                { name: 'LangGraph', icon: '📊' },
                { name: 'FastAPI', icon: '⚡' },
                { name: 'React', icon: '⚛️' },
                { name: 'Groq', icon: '🚀' },
                { name: 'OpenAI', icon: '🤖' },
                { name: 'Anthropic', icon: '🧠' },
                { name: 'Tavily', icon: '🔍' }
              ].map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-sm font-medium">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center gap-8 text-gray-400"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-slate-800"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Trusted by 10,000+ developers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-200 z-50 flex items-center justify-center"
      >
        <Users className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default Hero; 