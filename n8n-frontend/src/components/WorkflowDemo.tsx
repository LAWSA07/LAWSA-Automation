"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

const WorkflowDemo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Watch how easy it is to build and execute workflows
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-white">Live Workflow Demo</h3>
            
            <div className="space-y-6">
              {[
                { name: 'Trigger', icon: '⚡', color: 'bg-green-500', description: 'Webhook or schedule starts the workflow' },
                { name: 'AI Model', icon: '🤖', color: 'bg-purple-500', description: 'Process data with intelligent AI' },
                { name: 'Tool', icon: '🔧', color: 'bg-blue-500', description: 'Integrate with external services' },
                { name: 'Output', icon: '📤', color: 'bg-orange-500', description: 'Send results to your destination' }
              ].map((step, i) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0.7, 
                    x: isHovered ? 0 : -20 
                  }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">{step.name}</h4>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {i < 3 && (
                    <motion.div
                      animate={{ opacity: isHovered ? 1 : 0.3 }}
                      className="text-purple-400 text-2xl"
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all"
              >
                Try It Yourself →
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowDemo; 