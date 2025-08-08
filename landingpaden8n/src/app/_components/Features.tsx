"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Seamless Integration",
    description: "Connect all your favorite tools and apps in one place. No more switching between platforms.",
    icon: "🔗",
  },
  {
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time. See changes as they happen.",
    icon: "👥",
  },
  {
    title: "Advanced Analytics",
    description: "Get deep insights into your workflow with powerful analytics and reporting.",
    icon: "📊",
  },
  {
    title: "Automated Workflows",
    description: "Set up automated processes that save you hours of manual work every week.",
    icon: "⚡",
  },
  {
    title: "Secure & Compliant",
    description: "Enterprise-grade security with SOC 2 compliance and end-to-end encryption.",
    icon: "🔒",
  },
  {
    title: "24/7 Support",
    description: "Get help whenever you need it with our dedicated support team.",
    icon: "🎧",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful features designed to streamline your workflow and boost productivity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 