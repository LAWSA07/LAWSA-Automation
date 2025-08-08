"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Is LAWSA truly no-code?",
    a: "Yes, absolutely. You can build, test, and execute powerful AI agents without writing a single line of code. All logic is handled through our visual React Flow editor with drag-and-drop functionality."
  },
  {
    q: "What AI models does LAWSA support?",
    a: "LAWSA supports OpenAI (GPT-4), Groq, Anthropic (Claude), Together AI, and other leading LLM providers. Our dynamic backend can integrate with any LLM via API endpoints."
  },
  {
    q: "How secure is my data and API keys?",
    a: "Security is our top priority. All API keys and sensitive data are encrypted using Fernet encryption. We use enterprise-grade security practices and never store your credentials in plain text."
  },
  {
    q: "What makes LAWSA different from other automation tools?",
    a: "LAWSA creates intelligent agents using LangGraph and LangChain that can think, reason, and make decisions. Unlike traditional automation, our agents have memory, context, and can handle complex branching logic."
  },
  {
    q: "Can I add custom tools and memory to my agents?",
    a: "Yes! LAWSA supports custom tools, memory systems, and search capabilities as nodes. You can add Tavily search, custom APIs, and persistent memory to make your agents more intelligent."
  },
  {
    q: "How does real-time execution work?",
    a: "LAWSA uses Server-Sent Events (SSE) to stream agent execution results in real-time. Watch your agents think and work as they execute complex tasks with live feedback."
  },
  {
    q: "What kind of support do you offer?",
    a: "We offer comprehensive support including documentation, video tutorials, and dedicated support. Our team is always ready to help you succeed with agentic automation."
  },
  {
    q: "Is there a free trial available?",
    a: "Yes, we offer a free trial with full access to all features. No credit card required to start building your first AI agent."
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-santi-black text-4xl md:text-5xl text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about LAWSA and building AI agents.
          </p>
        </motion.div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem 
                value={`item-${index}`} 
                className="border-border mb-4"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline text-lg font-medium py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-6">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Contact Support
            </button>
            <button className="border border-border text-foreground px-8 py-3 rounded-lg hover:bg-accent transition-colors">
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 