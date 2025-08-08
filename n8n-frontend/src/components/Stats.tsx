"use client";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, Shield } from 'lucide-react';

// Custom CountUp component
const CountUp = ({ end, duration = 3, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);
  
  return <span>{count}{suffix}</span>;
};

const Stats = () => {
  const stats = [
    {
      number: 10000,
      suffix: "+",
      label: "Active Users",
      description: "Trusted by developers worldwide",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      number: 50,
      suffix: "+",
      label: "AI Models",
      description: "GPT-4, Claude, Groq & more",
      icon: <Zap className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      number: 99.9,
      suffix: "%",
      label: "Uptime",
      description: "Enterprise-grade reliability",
      icon: <Shield className="w-8 h-8" />,
      gradient: "from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      number: 24,
      suffix: "/7",
      label: "Support",
      description: "Round-the-clock assistance",
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      delay: 0.4
    }
  ];

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
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Trusted by
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              thousands of users
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join the growing community of developers and businesses automating their workflows with LAWSA
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div className="relative rounded-3xl bg-white/5 backdrop-blur-sm p-8 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Animated Border */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20`}
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </motion.div>
                  
                  {/* Number */}
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <CountUp end={stat.number} suffix={stat.suffix} />
                  </div>
                  
                  {/* Label */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stat.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {stat.description}
                  </p>
                  
                  {/* Hover Effect Line */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { number: "1M+", label: "Workflows Created", description: "Automation workflows built by our community" },
            { number: "500+", label: "Integrations", description: "Connect with your favorite tools and services" },
            { number: "10x", label: "Faster Development", description: "Build and deploy automations in minutes" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-white mb-2">{stat.label}</div>
              <div className="text-gray-300 text-sm">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats; 