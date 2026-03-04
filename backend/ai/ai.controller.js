// ai.controller.js
const mongoose = require('mongoose');
const Conversation = require('./ai.model');
const { DeepAI } = require('openai');
const FileUpload = require('../fileupload/fileupload.model');
const Chart = require('../charts/charts.model');
require('dotenv').config();

// Initialize DeepAI (or other AI API)
let openai;
try {
  openai = process.env.OPENAI_API_KEY ? new DeepAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
} catch (error) {
  console.error('DeepAI initialization error:', error);
  openai = null;
}

// Helper function to handle errors uniformly
const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({
    success: false,
    message: `Error in ${context}`,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};

// Append new messages to existing conversation in DB
async function saveConversationToDB(userId, messagesArray) {
  try {
    await Conversation.findOneAndUpdate(
      { userId },
      {
        $push: { messages: { $each: messagesArray } },
        lastUpdated: Date.now()
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('Error saving conversation:', err);
  }
}

// Retrieve last 50 messages of user's conversation
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.findOne({ userId }).lean();

    // Take the latest 50 messages
    const messages = conversation?.messages.slice(-50) || [];
    res.json({ success: true, messages });
  } catch (err) {
    handleError(res, err, 'getConversation');
  }
};

// Save entire conversation (replace existing)
exports.saveConversation = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user.id;

    // Validate incoming messages array
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Invalid messages format' });
    }

    // Overwrite conversation with new full messages array
    await Conversation.findOneAndUpdate(
      { userId },
      { messages, lastUpdated: Date.now() },
      { upsert: true }
    );

    res.json({ success: true, message: 'Conversation updated' });
  } catch (err) {
    handleError(res, err, 'saveConversation');
  }
};

// Delete conversation for user (used for clearing chat)
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    await Conversation.deleteOne({ userId });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    handleError(res, err, 'deleteConversation');
  }
};

// Main dispatcher for AI tools
exports.executeTool = async (req, res) => {
  try {
    const { tool, params } = req.body;
    if (!tool) {
      return res.status(400).json({ success: false, message: 'Tool name is required' });
    }
    
    switch (tool) {
      case 'processQuery':
        req.body.message = params?.message;
        return exports.processQuery(req, res);
      case 'generateChartSuggestions':
        req.body.dataDescription = params?.dataDescription;
        return exports.generateChartSuggestions(req, res);
      case 'analyzeDataQuality':
        req.body.dataSample = params?.dataSample;
        return exports.analyzeDataQuality(req, res);
      case 'saveConversation':
        return exports.saveConversation(req, res);
      case 'getConversation':
        return exports.getConversation(req, res);
      case 'deleteConversation':
        return exports.deleteConversation(req, res);
      default:
        return res.status(400).json({ success: false, message: 'Invalid tool' });
    }
  } catch (error) {
    handleError(res, error, 'executeTool');
  }
};

// Process user query with context
exports.processQuery = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid message' });
    }

    if (!openai) {
      const fallbackResponse = 'AI service is currently unavailable. Please try again later.';
      await saveConversationToDB(userId, [
        { role: 'user', content: message },
        { role: 'assistant', content: fallbackResponse }
      ]);
      return res.json({ success: true, response: fallbackResponse });
    }

    // Fetch user context data
    const [files, charts] = await Promise.all([
      FileUpload.find({ userId }).lean(),
      Chart.find({ createdBy: userId }).lean()
    ]);

    const systemPrompt = `You are a BI (Business Intelligence) assistant. The user has:
- ${files.length} data files
- ${charts.length} charts/dashboards

Provide concise, professional advice about:
1. Data visualization best practices
2. Dashboard design
3. Data analysis techniques
4. BI tool recommendations`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;

    await saveConversationToDB(userId, [
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ]);
    res.json({ success: true, response: aiResponse });
  } catch (err) {
    handleError(res, err, 'processQuery');
  }
};

// Generate chart suggestions
exports.generateChartSuggestions = async (req, res) => {
  try {
    const { dataDescription } = req.body;
    if (!dataDescription || typeof dataDescription !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid data description' });
    }
    if (!openai) {
      return res.json({ success: true, suggestions: 'AI service unavailable. Common chart types: Bar, Line, Pie, Scatter, Heatmap.' });
    }
    const prompt = `Suggest 3-5 chart types for: "${dataDescription}". Format as markdown with bold chart names and brief explanations.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 300
    });
    res.json({ success: true, suggestions: response.choices[0].message.content });
  } catch (err) {
    handleError(res, err, 'generateChartSuggestions');
  }
};

// Data quality analysis
exports.analyzeDataQuality = async (req, res) => {
  try {
    const { dataSample } = req.body;
    if (!dataSample || typeof dataSample !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid data sample' });
    }
    if (!openai) {
      return res.json({ success: true, analysis: 'AI service unavailable. Check for: missing values, inconsistent formats, outliers.' });
    }
    const prompt = `Analyze this data sample for quality issues:\n${dataSample}\nIdentify problems and suggest fixes in markdown format.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });
    res.json({ success: true, analysis: response.choices[0].message.content });
  } catch (err) {
    handleError(res, err, 'analyzeDataQuality');
  }
};