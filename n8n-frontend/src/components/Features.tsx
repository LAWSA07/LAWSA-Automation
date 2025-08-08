"use client";
import { motion } from 'framer-motion';
import { Zap, Brain, Link, Eye, Shield, BarChart3, ArrowRight, Sparkles, Play, Settings, Rocket } from 'lucide-react';
import { BentoGrid, BentoGridItem } from './ui/BentoGrid';
import { GlowingStarsBackgroundCard } from './ui/GlowingStarsBackgroundCard';

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Features
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            The "Aha!" Moment
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Visually explain the platform's core capabilities in a format that is both informative and engaging.
          </p>
        </motion.div>

        <BentoGrid className="max-w-4xl mx-auto">
          {/* Cell 1 (Large, Emphasized) - Visual Workflow Editor */}
          <BentoGridItem
            span={3}
            delay={0.1}
            className="row-span-2"
            header={
              <GlowingStarsBackgroundCard>
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-2xl font-bold mb-2">Visual Workflow Editor</h3>
                  <p className="text-gray-300">Drag, drop, and connect nodes to build complex AI workflows</p>
                </div>
              </GlowingStarsBackgroundCard>
            }
          />

          {/* Cell 2 - Multi-Provider LLM Support */}
          <BentoGridItem
            span={2}
            delay={0.2}
            icon={<Brain className="w-6 h-6" />}
            title="Multi-Provider LLM Support"
            description="Connect to OpenAI, Groq, Anthropic, and more"
          />

          {/* Cell 3 - Secure Credential Management */}
          <BentoGridItem
            span={2}
            delay={0.3}
            icon={<Shield className="w-6 h-6" />}
            title="Secure Credential Management"
            description="Bank-grade encryption for your API keys and secrets"
          />

          {/* Cell 4 - Real-Time Streaming Output */}
          <BentoGridItem
            span={2}
            delay={0.4}
            icon={<Eye className="w-6 h-6" />}
            title="Real-Time Streaming Output"
            description="Watch your workflows execute live with streaming results"
          />

          {/* Cell 5 - Tool Integration */}
          <BentoGridItem
            span={2}
            delay={0.5}
            icon={<Link className="w-6 h-6" />}
            title="100+ Tool Integrations"
            description="Slack, Email, HTTP APIs, and more"
          />

          {/* Cell 6 - Analytics & Insights */}
          <BentoGridItem
            span={2}
            delay={0.6}
            icon={<BarChart3 className="w-6 h-6" />}
            title="Analytics & Insights"
            description="Track performance and optimize your workflows"
          />
        </BentoGrid>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Explore All Features
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 