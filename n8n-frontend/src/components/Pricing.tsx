"use client";
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import AnimatedButton from './ui/AnimatedButton';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small teams getting started with automation.",
      features: [
        "Up to 5 workflows",
        "Basic AI models",
        "Email support",
        "Community forum",
        "1GB storage"
      ],
      icon: "🚀",
      popular: false,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing teams that need more power and advanced features.",
      features: [
        "Unlimited workflows",
        "All AI models",
        "Priority support",
        "Advanced analytics",
        "10GB storage",
        "Custom integrations",
        "Team collaboration"
      ],
      icon: "⚡",
      popular: true,
      gradient: "from-purple-500 to-blue-500"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations with complex automation needs.",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom AI training",
        "Advanced security",
        "Unlimited storage",
        "SLA guarantee",
        "On-premise option"
      ],
      icon: "🏢",
      popular: false,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
          >
            💰 Pricing
          </motion.div>
          
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
            Choose the perfect plan for your needs
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </motion.div>
              )}
              
              <AnimatedCard
                delay={index * 0.2}
                icon={plan.icon}
                title={plan.name}
                description={plan.description}
                className={plan.popular ? "ring-2 ring-purple-500/50" : ""}
              >
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /{plan.period}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 + featureIndex * 0.1 }}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <AnimatedButton
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    // Handle plan selection
                    console.log(`Selected ${plan.name} plan`);
                  }}
                >
                  {plan.popular ? "Get Started" : "Choose Plan"}
                </AnimatedButton>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Can I change plans anytime?",
                  content: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
                },
                {
                  title: "Is there a free trial?",
                  content: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
                },
                {
                  title: "What payment methods do you accept?",
                  content: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
                },
                {
                  title: "Do you offer refunds?",
                  content: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 