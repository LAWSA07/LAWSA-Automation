"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "Visual Workflow Editor",
    description: "Design complex AI workflows with an intuitive drag-and-drop interface using React Flow. No coding required.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    badge: "Core Feature",
    image: "/workflow-editor-demo.png"
  },
  {
    title: "Dynamic Agentic Backend",
    description: "Translates visual workflows into LangGraph/LangChain agents that can think, reason, and make decisions.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: "AI Engine",
    image: "/llm-support-demo.png"
  },
  {
    title: "Multi-LLM Support",
    description: "Connect to OpenAI, Groq, Anthropic, Together, and other leading AI models seamlessly.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: "Enterprise",
    image: "/llm-support-demo.png"
  },
  {
    title: "Secure Credential Management",
    description: "Safely store and manage API keys with Fernet encryption. Enterprise-grade security for your sensitive data.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    badge: "Security",
    image: "/security-demo.png"
  },
  {
    title: "Real-Time Streaming",
    description: "Watch your AI agents execute tasks in real-time with Server-Sent Events. Live feedback and results.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    badge: "Live Execution",
    image: "/monitoring-demo.png"
  },
  {
    title: "Tool & Memory Integration",
    description: "Add search tools, memory systems, and custom logic as nodes. Build intelligent agents with context.",
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    badge: "Intelligence",
    image: "/api-integration-demo.png"
  }
];

export function FeaturesShowcase() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-santi-black text-4xl md:text-5xl text-foreground mb-6">
            Everything You Need for Agentic AI
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From simple workflows to complex AI agents with memory and reasoning, LAWSA provides all the tools you need to build intelligent automation solutions.
          </p>
        </motion.div>
        
        {/* Horizontal Scrolling Cards */}
        <div className="relative">
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-background to-transparent w-8 h-16 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-background to-transparent w-8 h-16 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
          </div>
          
          {/* Scrollable Container */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-4 -mx-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80"
              >
                <Card className="bg-card text-card-foreground h-full hover:bg-card/80 transition-all duration-300 hover:scale-105 border-border group">
                  <CardHeader className="p-6">
                    {/* Image Section */}
                    <div className="relative h-48 mb-6 rounded-lg overflow-hidden bg-muted/20 border border-border">
                      {/* Display all demo images */}
                      <Image
                        src={feature.image}
                        alt={`${feature.title} Demo`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground leading-tight">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 