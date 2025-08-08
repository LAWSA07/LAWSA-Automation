"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-santi-black text-4xl md:text-5xl text-foreground mb-6">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From concept to deployment, LAWSA makes building AI agents as simple as drawing on a canvas.
          </p>
        </motion.div>
        
        <Tabs defaultValue="design" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-muted mb-8">
            <TabsTrigger value="design" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              1. Design
            </TabsTrigger>
            <TabsTrigger value="connect" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              2. Connect
            </TabsTrigger>
            <TabsTrigger value="launch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              3. Launch
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-left border-border">
                <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Design Your Workflow</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Visually map out your agent's logic by dragging LLM, tool, and memory nodes onto the canvas and connecting them to define the flow of tasks and decisions. Our React Flow interface makes complex AI workflows simple to understand and modify.
                    </p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Drag-and-drop React Flow interface
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Visual agent flow mapping
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Real-time workflow preview
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">Visual Workflow Editor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="connect" className="mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-left border-border">
                <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Connect Your Tools</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Integrate LLMs, search tools, memory systems, and services by simply adding them as nodes in your visual editor. Our Fernet-encrypted credential management keeps your API keys safe while enabling powerful agentic integrations.
                    </p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Multi-LLM support (OpenAI, Groq, Anthropic)
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Fernet-encrypted credential storage
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Tool and memory node integration
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">Integration Hub</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="launch" className="mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-left border-border">
                <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Launch Your Agent</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Execute your agentic workflow and watch it think, reason, and make decisions in real-time. Our LangGraph/LangChain backend translates your visual design into intelligent agents that stream results via Server-Sent Events.
                    </p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        LangGraph/LangChain execution
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Real-time streaming results
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Intelligent agentic behavior
                      </li>
                    </ul>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">Deployment Dashboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
} 