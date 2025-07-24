// Available models from major AI providers
export interface ModelInfo {
  name: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding';
  contextLength?: number;
  description?: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // OpenAI Models
  {
    name: 'gpt-4o',
    provider: 'openai',
    type: 'chat',
    contextLength: 128000,
    description: 'GPT-4 Omni - Latest and most capable model'
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    type: 'chat',
    contextLength: 128000,
    description: 'GPT-4 Omni Mini - Faster and more cost-effective'
  },
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    type: 'chat',
    contextLength: 128000,
    description: 'GPT-4 Turbo - Previous generation'
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    type: 'chat',
    contextLength: 16385,
    description: 'GPT-3.5 Turbo - Fast and efficient'
  },
  {
    name: 'gpt-4',
    provider: 'openai',
    type: 'chat',
    contextLength: 8192,
    description: 'GPT-4 - Original version'
  },

  // Anthropic Models
  {
    name: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    type: 'chat',
    contextLength: 200000,
    description: 'Claude 3.5 Sonnet - Latest and most capable'
  },
  {
    name: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    type: 'chat',
    contextLength: 200000,
    description: 'Claude 3.5 Haiku - Fast and efficient'
  },
  {
    name: 'claude-3-opus-20240229',
    provider: 'anthropic',
    type: 'chat',
    contextLength: 200000,
    description: 'Claude 3 Opus - Most capable'
  },
  {
    name: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    type: 'chat',
    contextLength: 200000,
    description: 'Claude 3 Sonnet - Balanced performance'
  },
  {
    name: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    type: 'chat',
    contextLength: 200000,
    description: 'Claude 3 Haiku - Fast and cost-effective'
  },

  // Groq Models
  {
    name: 'llama3-70b-8192',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3 70B - High performance'
  },
  {
    name: 'llama3-8b-8192',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3 8B - Fast and efficient'
  },
  {
    name: 'mixtral-8x7b-32768',
    provider: 'groq',
    type: 'chat',
    contextLength: 32768,
    description: 'Mixtral 8x7B - High performance'
  },
  {
    name: 'gemma2-9b-it',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Gemma 2 9B - Google\'s efficient model'
  },
  {
    name: 'llama3.1-8b-instant',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 8B Instant - Ultra fast'
  },
  {
    name: 'llama3.1-70b-versatile',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 70B Versatile - High performance'
  },
  {
    name: 'llama3.1-405b-reasoning',
    provider: 'groq',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 405B Reasoning - Best reasoning'
  },

  // Together AI Models
  {
    name: 'meta-llama/Llama-3.1-8B-Instruct',
    provider: 'together',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 8B Instruct'
  },
  {
    name: 'meta-llama/Llama-3.1-70B-Instruct',
    provider: 'together',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 70B Instruct'
  },
  {
    name: 'meta-llama/Llama-3.1-405B-Instruct',
    provider: 'together',
    type: 'chat',
    contextLength: 8192,
    description: 'Llama 3.1 405B Instruct'
  },
  {
    name: 'microsoft/DialoGPT-medium',
    provider: 'together',
    type: 'chat',
    contextLength: 1024,
    description: 'Microsoft DialoGPT Medium'
  },
  {
    name: 'google/flan-t5-xxl',
    provider: 'together',
    type: 'chat',
    contextLength: 512,
    description: 'Google Flan-T5 XXL'
  },
  {
    name: 'tiiuae/falcon-40b-instruct',
    provider: 'together',
    type: 'chat',
    contextLength: 2048,
    description: 'Falcon 40B Instruct'
  },
  {
    name: 'mosaicml/mpt-30b-instruct',
    provider: 'together',
    type: 'chat',
    contextLength: 8192,
    description: 'MPT 30B Instruct'
  },
  {
    name: 'bigcode/starcoder',
    provider: 'together',
    type: 'chat',
    contextLength: 8192,
    description: 'StarCoder - Code generation'
  },
  {
    name: 'codellama/CodeLlama-34b-Instruct-hf',
    provider: 'together',
    type: 'chat',
    contextLength: 16384,
    description: 'Code Llama 34B Instruct'
  },

  // Cohere Models
  {
    name: 'command',
    provider: 'cohere',
    type: 'chat',
    contextLength: 32768,
    description: 'Command - General purpose'
  },
  {
    name: 'command-light',
    provider: 'cohere',
    type: 'chat',
    contextLength: 32768,
    description: 'Command Light - Faster and cheaper'
  },
  {
    name: 'command-nightly',
    provider: 'cohere',
    type: 'chat',
    contextLength: 32768,
    description: 'Command Nightly - Experimental features'
  },

  // Mistral AI Models
  {
    name: 'mistral-large-latest',
    provider: 'mistral',
    type: 'chat',
    contextLength: 32768,
    description: 'Mistral Large - Most capable'
  },
  {
    name: 'mistral-medium-latest',
    provider: 'mistral',
    type: 'chat',
    contextLength: 32768,
    description: 'Mistral Medium - Balanced performance'
  },
  {
    name: 'mistral-small-latest',
    provider: 'mistral',
    type: 'chat',
    contextLength: 32768,
    description: 'Mistral Small - Fast and efficient'
  },
  {
    name: 'open-mistral-7b',
    provider: 'mistral',
    type: 'chat',
    contextLength: 32768,
    description: 'Open Mistral 7B - Open source'
  },
  {
    name: 'open-mixtral-8x7b',
    provider: 'mistral',
    type: 'chat',
    contextLength: 32768,
    description: 'Open Mixtral 8x7B - High performance'
  }
];

// Group models by provider for easier selection
export const MODELS_BY_PROVIDER = AVAILABLE_MODELS.reduce((acc, model) => {
  if (!acc[model.provider]) {
    acc[model.provider] = [];
  }
  acc[model.provider].push(model);
  return acc;
}, {} as Record<string, ModelInfo[]>);

// Provider information
export const PROVIDERS = [
  {
    name: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models'
  },
  {
    name: 'anthropic',
    displayName: 'Anthropic',
    description: 'Claude 3.5, Claude 3, and other Anthropic models'
  },
  {
    name: 'groq',
    displayName: 'Groq',
    description: 'Ultra-fast inference with Llama, Mixtral, and other models'
  },
  {
    name: 'together',
    displayName: 'Together AI',
    description: 'Open source models including Llama, Falcon, and more'
  },
  {
    name: 'cohere',
    displayName: 'Cohere',
    description: 'Command and other Cohere models'
  },
  {
    name: 'mistral',
    displayName: 'Mistral AI',
    description: 'Mistral Large, Medium, Small, and open source models'
  }
];

// Memory backends
export const MEMORY_BACKENDS = [
  {
    name: 'window_buffer',
    displayName: 'Window Buffer',
    description: 'In-memory buffer with sliding window',
    configFields: [
      { name: 'window_size', label: 'Window Size', type: 'number', default: 10 }
    ]
  },
  {
    name: 'mongodb',
    displayName: 'MongoDB',
    description: 'MongoDB database for persistent storage',
    configFields: [
      { name: 'connection_string', label: 'Connection String', type: 'text', default: 'mongodb://localhost:27017' }
    ]
  },
  {
    name: 'postgresql',
    displayName: 'PostgreSQL',
    description: 'PostgreSQL database for persistent storage',
    configFields: [
      { name: 'connection_string', label: 'Connection String', type: 'text', default: 'postgresql://user:pass@localhost:5432/db' },
      { name: 'table_name', label: 'Table Name', type: 'text', default: 'conversations' }
    ]
  },
  {
    name: 'sqlite',
    displayName: 'SQLite',
    description: 'Lightweight SQLite database',
    configFields: [
      { name: 'database_path', label: 'Database Path', type: 'text', default: './memory.db' },
      { name: 'table_name', label: 'Table Name', type: 'text', default: 'conversations' }
    ]
  }
];

// Tools
export const AVAILABLE_TOOLS = [
  {
    name: 'tavily_search',
    displayName: 'Tavily Web Search',
    description: 'Web search and information retrieval',
    configFields: [
      { name: 'api_key', label: 'Tavily API Key', type: 'text', required: false },
      { name: 'search_depth', label: 'Search Depth', type: 'select', options: ['basic', 'advanced'], default: 'basic' },
      { name: 'query', label: 'Query', type: 'text', required: true }
    ]
  },
  {
    name: 'multiply',
    displayName: 'Multiply',
    description: 'Multiply two numbers',
    configFields: [
      { name: 'a', label: 'A', type: 'number', required: true },
      { name: 'b', label: 'B', type: 'number', required: true }
    ]
  },
  {
    name: 'send_email',
    displayName: 'Send Email',
    description: 'Send an email via SMTP',
    configFields: [
      { name: 'to', label: 'To', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', required: true }
    ]
  },
  {
    name: 'post_to_slack',
    displayName: 'Post to Slack',
    description: 'Post a message to a Slack channel',
    configFields: [
      { name: 'channel', label: 'Channel', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true }
    ]
  }
]; 