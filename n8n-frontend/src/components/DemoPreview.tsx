"use client";
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, Brain, Mail, CheckCircle } from 'lucide-react';

const DemoPreview = () => (
  <section className="py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
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
          <Play className="w-4 h-4" />
          Live Demo
        </motion.div>
        
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
          See it in
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            action
          </span>
        </h2>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Watch how easy it is to build powerful automation workflows with LAWSA
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Main Demo Container */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl border border-white/10 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          {/* Browser Header */}
          <div className="relative z-10 flex items-center justify-between mb-8 p-4 bg-slate-800 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-300 font-medium">Workflow Builder</div>
            <div className="w-32 h-6 bg-slate-700 rounded"></div>
          </div>
          
          {/* Interactive Workflow Demo */}
          <div className="relative z-10 p-8 bg-slate-900 rounded-2xl shadow-xl border border-white/10">
            <div className="space-y-8">
              {/* Workflow Nodes with Enhanced Animations */}
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex items-center space-x-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="flex-1 h-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
              </motion.div>
              
              {/* Connection Line */}
              <div className="flex items-center space-x-6">
                <div className="w-20"></div>
                <motion.div
                  className="flex-1 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 2 }}
                />
                <div className="w-20"></div>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="flex items-center space-x-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="flex-1 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                  />
                </div>
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Mail className="w-8 h-8" />
                </div>
              </motion.div>
              
              {/* Connection Line */}
              <div className="flex items-center space-x-6">
                <div className="w-20"></div>
                <motion.div
                  className="flex-1 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 4 }}
                />
                <div className="w-20"></div>
              </div>
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                className="flex items-center space-x-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="flex-1 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 5 }}
                  />
                </div>
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-8 flex items-center justify-between text-sm text-gray-400 p-4 bg-slate-800 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-medium">Workflow Running</span>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Processing... 75%
              </motion.div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-4 right-4 w-8 h-8 bg-purple-500/20 rounded-full"
          />
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-4 left-4 w-6 h-6 bg-blue-500/20 rounded-full"
          />
        </div>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Try the Demo
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default DemoPreview; 