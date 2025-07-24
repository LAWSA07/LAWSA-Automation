const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

// Validate LLM API keys
app.post('/api/validate/llm', async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    if (provider === 'groq') {
      const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      return groqRes.ok ? res.sendStatus(200) : res.status(401).send('Invalid Groq API key');
    }
    if (provider === 'openai') {
      const openaiRes = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      return openaiRes.ok ? res.sendStatus(200) : res.status(401).send('Invalid OpenAI API key');
    }
    if (provider === 'anthropic') {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': apiKey }
      });
      return anthropicRes.ok ? res.sendStatus(200) : res.status(401).send('Invalid Anthropic API key');
    }
    // Add more providers as needed
    return res.status(400).send('Unknown provider');
  } catch (e) {
    return res.status(500).send('Error connecting to provider');
  }
});

// Validate Memory (MongoDB) connection
app.post('/api/validate/memory', async (req, res) => {
  const { type, config } = req.body;
  if (type === 'mongodb') {
    const uri = config.connection_string;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      return res.sendStatus(200);
    } catch (err) {
      return res.status(401).send('Invalid MongoDB connection');
    }
  }
  // Add more memory backends as needed
  return res.status(400).send('Unknown memory type');
});

// Validate Tool (Tavily) API key
app.post('/api/validate/tool', async (req, res) => {
  const { type, config } = req.body;
  if (type === 'tavily') {
    try {
      const tavilyRes = await fetch('https://api.tavily.com/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.api_key}` },
        body: JSON.stringify({ query: 'test', search_depth: 'basic' })
      });
      return tavilyRes.ok ? res.sendStatus(200) : res.status(401).send('Invalid Tavily API key');
    } catch (e) {
      return res.status(500).send('Error connecting to Tavily');
    }
  }
  // Add more tools as needed
  return res.status(400).send('Unknown tool type');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Validation API running on port ${PORT}`)); 