"use client";
import { motion } from 'framer-motion';
import { Sparkles, Palette, Settings, Rocket } from 'lucide-react';
import { CardStack } from './ui/CardStack';

const HowItWorks = () => {
  const items = [
    {
      id: 1,
      name: "Design",
      designation: "Visual Workflow Mapping",
      content: "Visually map your workflow with our intuitive drag-and-drop editor. Connect nodes, define logic, and create complex automation flows without writing a single line of code.",
    },
    {
      id: 2,
      name: "Configure",
      designation: "Connect & Setup",
      content: "Connect your favorite LLMs, tools, and credentials in just a few clicks. Our platform supports 50+ AI models and 100+ integrations out of the box.",
    },
    {
      id: 3,
      name: "Execute",
      designation: "Deploy & Monitor",
      content: "Run your agent and watch the results stream in, live and in real-time. Monitor execution, debug issues, and optimize performance with built-in analytics.",
    },
  ];

  return (
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
            <Sparkles className="w-4 h-4" />
            How It Works
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            The Workflow Unveiled
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Demystify how LAWSA works and reinforce the message of simplicity and ease.
          </p>
        </motion.div>

        {/* Card Stack */}
        <CardStack items={items} />

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            {
              icon: <Palette className="w-8 h-8" />,
              title: "No Code Required",
              description: "Build complex AI workflows using our visual editor. No programming knowledge needed."
            },
            {
              icon: <Settings className="w-8 h-8" />,
              title: "Enterprise Ready",
              description: "Bank-grade security, real-time monitoring, and 99.9% uptime guarantee."
            },
            {
              icon: <Rocket className="w-8 h-8" />,
              title: "Deploy Instantly",
              description: "From idea to production in minutes. Scale from prototype to enterprise seamlessly."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-white">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 