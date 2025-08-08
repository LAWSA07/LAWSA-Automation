'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Settings } from 'lucide-react';

interface NodeConfig {
  provider?: string;
  model?: string;
  api_key?: string;
  tool_type?: string;
  temperature?: number;
  max_tokens?: number;
  webhook_url?: string;
  schedule_cron?: string;
  format?: string;
  destination?: string;
  config?: Record<string, any>;
}

interface NodeConfigPanelProps {
  node: any;
  onUpdate: (config: NodeConfig) => void;
  onClose: () => void;
}

const AVAILABLE_PROVIDERS = [
  { value: 'groq', label: 'Groq', description: 'Ultra-fast inference' },
  { value: 'openai', label: 'OpenAI', description: 'GPT models' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude models' },
  { value: 'together', label: 'Together AI', description: 'Open source models' },
  { value: 'cohere', label: 'Cohere', description: 'Command models' },
  { value: 'mistral', label: 'Mistral AI', description: 'Mistral models' },
];

const AVAILABLE_MODELS = {
  groq: [
    { value: 'llama3-70b-8192', label: 'Llama 3 70B' },
    { value: 'llama3-8b-8192', label: 'Llama 3 8B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4 Omni' },
    { value: 'gpt-4o-mini', label: 'GPT-4 Omni Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  ],
  together: [
    { value: 'meta-llama/Llama-2-70b-chat-hf', label: 'Llama 2 70B' },
    { value: 'meta-llama/Llama-2-13b-chat-hf', label: 'Llama 2 13B' },
  ],
  cohere: [
    { value: 'command', label: 'Command' },
    { value: 'command-light', label: 'Command Light' },
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium' },
    { value: 'mistral-small-latest', label: 'Mistral Small' },
  ],
};

const AVAILABLE_TOOLS = [
  { value: 'tavily_search', label: 'Tavily Search', description: 'Web search' },
  { value: 'multiply', label: 'Multiply', description: 'Math operation' },
  { value: 'send_email', label: 'Send Email', description: 'Email sending' },
  { value: 'post_to_slack', label: 'Post to Slack', description: 'Slack integration' },
  { value: 'http_request', label: 'HTTP Request', description: 'API calls' },
  { value: 'database_query', label: 'Database Query', description: 'Database operations' },
];

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onUpdate, onClose }) => {
  const [config, setConfig] = useState<NodeConfig>(node.data.config || {});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  const handleSave = () => {
    onUpdate(config);
  };

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Provider
        </label>
        <select
          value={config.provider || 'groq'}
          onChange={(e) => setConfig({ ...config, provider: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {AVAILABLE_PROVIDERS.map(provider => (
            <option key={provider.value} value={provider.value}>
              {provider.label} - {provider.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Model
        </label>
        <select
          value={config.model || ''}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {AVAILABLE_MODELS[config.provider as keyof typeof AVAILABLE_MODELS]?.map(model => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          )) || []}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Temperature
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature || 0.7}
          onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-400 mt-1">
          {config.temperature || 0.7} (0 = deterministic, 2 = very creative)
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Tokens
        </label>
        <input
          type="number"
          value={config.max_tokens || 1000}
          onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          API Key
        </label>
        <input
          type="password"
          value={config.api_key || ''}
          onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Enter API key"
        />
      </div>
    </div>
  );

  const renderToolConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tool Type
        </label>
        <select
          value={config.tool_type || 'tavily_search'}
          onChange={(e) => setConfig({ ...config, tool_type: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {AVAILABLE_TOOLS.map(tool => (
            <option key={tool.value} value={tool.value}>
              {tool.label} - {tool.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          API Key
        </label>
        <input
          type="password"
          value={config.api_key || ''}
          onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Enter API key"
        />
      </div>
    </div>
  );

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      {node.data.type === 'webhook' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Webhook URL
          </label>
          <input
            type="url"
            value={config.webhook_url || ''}
            onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="https://your-webhook-url.com"
          />
        </div>
      )}

      {node.data.type === 'schedule' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cron Expression
          </label>
          <input
            type="text"
            value={config.schedule_cron || '0 0 * * *'}
            onChange={(e) => setConfig({ ...config, schedule_cron: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="0 0 * * *"
          />
          <div className="text-sm text-gray-400 mt-1">
            Format: minute hour day month weekday
          </div>
        </div>
      )}
    </div>
  );

  const renderOutputConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Output Format
        </label>
        <select
          value={config.format || 'json'}
          onChange={(e) => setConfig({ ...config, format: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="json">JSON</option>
          <option value="text">Text</option>
          <option value="html">HTML</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Destination
        </label>
        <input
          type="text"
          value={config.destination || ''}
          onChange={(e) => setConfig({ ...config, destination: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Output destination"
        />
      </div>
    </div>
  );

  const renderGeneralConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Node Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => {
            // Update node label (this would need to be handled by parent)
            console.log('Label changed:', e.target.value);
          }}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Node name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => setConfig({ ...config, description: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={3}
          placeholder="Node description"
        />
      </div>
    </div>
  );

  const getConfigContent = () => {
    switch (node.data.type) {
      case 'llm':
        return renderLLMConfig();
      case 'tool':
        return renderToolConfig();
      case 'input':
      case 'webhook':
      case 'schedule':
        return renderTriggerConfig();
      case 'output':
      case 'slack':
      case 'database':
        return renderOutputConfig();
      default:
        return renderGeneralConfig();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: node.data.color + '20' }}
          >
            {node.data.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold">{node.data.label}</h3>
            <p className="text-sm text-gray-400">{node.data.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && renderGeneralConfig()}
        {activeTab === 'config' && getConfigContent()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSave}
          className="w-full bg-yellow-400 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </motion.div>
  );
};

export default NodeConfigPanel;
