const { GoogleGenerativeAI } = require('@google/generative-ai');
const { queryDatabaseTool } = require('./databaseTool');
const { recommendResourcesTool } = require('./resourceTool');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define function calling tools
const tools = [
  {
    functionDeclarations: [
      {
        name: 'queryDatabase',
        description: 'Search the UNIBEN database for information about departments, courses, buildings, HODs, or staff contacts',
        parameters: {
          type: 'object',
          properties: {
            queryType: {
              type: 'string',
              enum: ['department', 'course', 'building', 'hod'],
              description: 'Type of information to search for'
            },
            searchTerm: {
              type: 'string',
              description: 'What to search for (e.g., "Computer Science", "Data Structures", "Library")'
            }
          },
          required: ['queryType', 'searchTerm']
        }
      },
      {
        name: 'recommendResources',
        description: 'Find learning resources like YouTube videos, articles, and tutorials for a specific course or topic',
        parameters: {
          type: 'object',
          properties: {
            courseName: {
              type: 'string',
              description: 'Course name or topic to find resources for'
            },
            resourceType: {
              type: 'string',
              enum: ['video', 'article', 'both'],
              description: 'Type of resources to recommend',
              default: 'both'
            }
          },
          required: ['courseName']
        }
      }
    ]
  }
];

// Main chat function
async function chat(userMessage, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools
    });

    // System instruction for friendly personality
    const systemInstruction = `You are a friendly, helpful AI assistant for the University of Benin (UNIBEN).
Your personality: Warm, encouraging, slightly playful but professional - like talking to a helpful friend.
Your role: Help students find information, navigate campus, and learn better.

Guidelines:
- Be conversational and friendly (use "Hey!", "Great question!", etc.)
- Use emojis occasionally (but not excessively)
- When students ask about locations, always use the queryDatabase function to get building info
- When students need help with courses, recommend resources using the recommendResources function
- Be encouraging and supportive, especially for learning-related questions
- Keep responses concise but helpful
- If you're not sure, be honest but still helpful

When responding about building locations:
- Use queryDatabase to get the building details
- Always mention you can help them navigate there
- Format your response to show the building photo and a "Navigate Here" button`;

    // Format conversation history for Gemini API
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    let functionCalls = [];

    // Handle function calling
    while (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      functionCalls.push(call);

      let functionResponse;

      if (call.name === 'queryDatabase') {
        functionResponse = await queryDatabaseTool(call.args);
      } else if (call.name === 'recommendResources') {
        functionResponse = await recommendResourcesTool(call.args);
      }

      // Send function response back to model
      result = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: functionResponse
        }
      }]);

      response = result.response;
    }

    return {
      text: response.text(),
      functionCalls,
      conversationHistory: await chat.getHistory()
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process chat message');
  }
}

module.exports = { chat };