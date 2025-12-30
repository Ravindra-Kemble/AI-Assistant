// server.js - Backend Server for Groq Chatbot
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store conversation history per session (in production, use a proper database)
const sessions = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Groq Chatbot Server is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }

    // Get or create session history
    if (!sessions.has(sessionId)) {
  sessions.set(sessionId, [
    {
      role: 'system',
      content: `
You are an intelligent AI agent acting as a senior expert in your domain.

Your responsibilities:
- Clearly understand the user's intent before responding
- Ask clarifying questions only if the request is ambiguous
- Provide accurate, structured, and actionable answers
- Explain step-by-step when concepts are complex
- Use real-world examples when helpful
- Suggest best practices, edge cases, and improvements
- Be concise but thorough

Constraints:
- Do NOT hallucinate information
- If uncertain, explicitly say so and suggest verification steps
- Prefer practical solutions over theory
- Optimize responses for clarity and usefulness

Response formatting rules:
- Start every response with a short, relevant emoji icon
- Use clear headings and bullet points
- Use code blocks for any code
- Emphasize important points clearly
- Maintain a professional, helpful tone

Now assist the user with their request.
      `.trim()
    }
  ]);
}

const history = sessions.get(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: history,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Add assistant response to history
    history.push({ role: 'assistant', content: assistantMessage });

    // Keep only last 20 messages to prevent memory issues
    if (history.length > 20) {
      sessions.set(sessionId, history.slice(-20));
    }

    res.json({
      message: assistantMessage,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Clear session endpoint
app.post('/api/clear', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Groq Chatbot Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔑 Using Groq API Key: ${process.env.GROQ_API_KEY ? '✓ Configured' : '✗ Missing'}`);
});
