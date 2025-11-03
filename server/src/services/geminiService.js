const { GoogleGenerativeAI } = require('@google/generative-ai');
const { queryDatabaseTool } = require('./databaseTool');
const { recommendResourcesTool } = require('./resourceTool');
const News = require('../models/News');
const Fees = require('../models/Fees');

// Only initialize Gemini AI if API key is available
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

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
      },
      {
        name: 'getNews',
        description: 'Get news and announcements filtered by user role and permissions',
        parameters: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to filter news for'
            },
            userRole: {
              type: 'string',
              enum: ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff', 'student', 'guest'],
              description: 'User role for filtering permissions'
            },
            departmentId: {
              type: 'string',
              description: 'Department ID for department-specific filtering'
            },
            courseIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of course IDs for course-specific filtering'
            }
          },
          required: ['userId', 'userRole']
        }
      },
      {
        name: 'getFinancialInfo',
        description: 'Get financial information for a specific student (only accessible by the student themselves or bursary admin)',
        parameters: {
          type: 'object',
          properties: {
            studentId: {
              type: 'string',
              description: 'Student ID to get financial information for'
            },
            requestingUserId: {
              type: 'string',
              description: 'ID of the user making the request (for permission checking)'
            },
            requestingUserRole: {
              type: 'string',
              description: 'Role of the user making the request (for permission checking)'
            }
          },
          required: ['studentId', 'requestingUserId', 'requestingUserRole']
        }
      }
    ]
  }
];

// Fallback function for when AI service fails
function getFallbackResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Basic keyword-based responses
  if (message.includes('library') || message.includes('book')) {
    return {
      text: "📚 The main University Library is located in the Academic Block. You can navigate there using our campus map. Would you like me to show you the building location?",
      functionCalls: [{
        name: 'queryDatabase',
        args: { queryType: 'building', searchTerm: 'library' }
      }],
      conversationHistory: []
    };
  }
  
  if (message.includes('building') || message.includes('location') || message.includes('where')) {
    return {
      text: "🏢 I can help you find buildings on campus! Which building are you looking for? Please tell me the name or department, and I'll locate it for you.",
      functionCalls: [],
      conversationHistory: []
    };
  }
  
  if (message.includes('course') || message.includes('class')) {
    return {
      text: "📖 I can help you with course information! You can ask me about course codes, descriptions, or requirements. For the best learning experience, try asking about specific courses you'd like to know more about.",
      functionCalls: [],
      conversationHistory: []
    };
  }
  
  if (message.includes('help') || message.includes('hello') || message.includes('hi')) {
    return {
      text: "👋 Hello! I'm the UNIBEN AI Assistant. I can help you with:\n\n🏢 Finding buildings and campus locations\n📖 Course information and resources\n📰 University news and announcements\n🧪 Creating and taking quizzes\n\nWhat would you like to know?",
      functionCalls: [],
      conversationHistory: []
    };
  }
  
  // Default fallback
  return {
    text: "I'm here to help! You can ask me about:\n\n• Buildings and campus locations\n• Course information\n• University news and announcements\n• Quiz creation and navigation\n\nWhat would you like to explore today?",
    functionCalls: [],
    conversationHistory: []
  };
}

// Main AI chat function
async function callGeminiAPI(userMessage, conversationHistory = []) {
  // Check if API key is available
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools
    });

    // System instruction for friendly personality with role-based access
    const systemInstruction = `You are a friendly, helpful AI assistant for the University of Benin (UNIBEN).
Your personality: Warm, encouraging, slightly playful but professional - like talking to a helpful friend.
Your role: Help students, staff, and visitors find information, navigate campus, and learn better.

IMPORTANT: You must respect user permissions and only show information they are allowed to see based on their role.

Guidelines:
- Be conversational and friendly (use "Hey!", "Great question!", etc.)
- Use emojis occasionally (but not excessively)
- When users ask about news/announcements, use the getNews function to get role-filtered content
- When students ask about their fees/payments, use the getFinancialInfo function (only they can see their own data)
- When users ask about locations, always use the queryDatabase function to get building info
- When users need help with courses, recommend resources using the recommendResources function
- Be encouraging and supportive, especially for learning-related questions
- Keep responses concise but helpful
- If you're not sure, be honest but still helpful
- NEVER mention permissions or restrictions - just naturally provide what the user can access

Role-based behavior:
- Students: Can see general news, department news, course news, their own financial data
- Staff: Can see general news, department news, staff announcements
- Admins: Can see role-appropriate news and manage their areas
- Guests: Can only see general campus information

When responding about building locations:
- Use queryDatabase to get the building details
- Always mention you can help them navigate there
- Format your response to show the building photo and a "Navigate Here" button

When showing news:
- Present news items in a friendly, organized way
- Group by relevance (university-wide first, then department/course specific)
- Don't mention that content is filtered - just show what's relevant

When showing financial information:
- Be clear and helpful about fees, payments, and balances
- Explain payment status in simple terms
- Show payment history if available`;

    // Format conversation history for Gemini API
    // Filter out any 'system' messages stored in conversation history because
    // the GoogleGenerativeAI SDK requires the first content to be a user message.
    const filteredHistory = (conversationHistory || []).filter(m => m.role !== 'system');
    const formattedHistory = filteredHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // NOTE: Do not prepend a system message at the start of history —
    // the GoogleGenerativeAI SDK requires the first content to be a user message.
    // We'll pass systemInstruction via the model configuration where supported
    // or rely on short instructions sent as part of the user message when needed.
    const chat = model.startChat({ history: formattedHistory });

    let result = await chat.sendMessage(userMessage);
    console.debug('Raw sendMessage result:', result);
    let response = result.response;
    let functionCalls = [];

    // Helper to normalize function calls (SDK may expose as functions)
    const getFunctionCallsArray = (resp) => {
      try {
        if (!resp) return [];
        if (typeof resp.functionCalls === 'function') return resp.functionCalls() || [];
        if (Array.isArray(resp.functionCalls)) return resp.functionCalls;
        if (typeof resp.functionCall === 'function') {
          const single = resp.functionCall();
          return single ? [single] : [];
        }
        return [];
      } catch (err) {
        console.debug('Could not normalize functionCalls:', err);
        return [];
      }
    };

    try {
      // Try to log response text if available
      if (response && typeof response.text === 'function') {
        console.debug('Initial response text preview:', response.text?.().slice(0, 200));
      } else if (response && response.text) {
        console.debug('Initial response.text value:', String(response.text).slice(0, 200));
      }
    } catch (logErr) {
      console.debug('Could not read response text:', logErr);
    }

    // Handle function calling (normalize SDK shape first)
    let pendingFunctionCalls = getFunctionCallsArray(response);
    while (pendingFunctionCalls && pendingFunctionCalls.length > 0) {
      const call = pendingFunctionCalls[0];
      // Store call entry - we will add the tool response once executed
      functionCalls.push({ name: call.name, args: call.args });
      console.debug('Processing function call from model:', call.name, 'args:', call.args);

      let functionResponse;
  try {
        if (call.name === 'queryDatabase') {
          functionResponse = await queryDatabaseTool(call.args);
        } else if (call.name === 'recommendResources') {
          functionResponse = await recommendResourcesTool(call.args);
        } else if (call.name === 'getNews') {
          functionResponse = await getNewsTool(call.args);
        } else if (call.name === 'getFinancialInfo') {
          functionResponse = await getFinancialInfoTool(call.args);
        } else {
          functionResponse = { type: 'error', message: 'Unknown function call: ' + call.name };
        }
      } catch (toolErr) {
        console.error('Tool execution error for', call.name, toolErr);
        functionResponse = { type: 'error', message: 'Tool execution failed' };
      }

  // Send function response back to model.
      // The SDK expects an iterable (array) of new content items. Wrap the function
      // response in an array. The 'response' MUST be a structured object (protobuf Struct)
      // so we should pass a plain JS object rather than a JSON string. If the tool
      // returned a primitive or string, wrap it in an object under `value`.
      let functionResponseObj;
      if (functionResponse && typeof functionResponse === 'object') {
        functionResponseObj = functionResponse;
      } else if (typeof functionResponse === 'string') {
        // Try to parse JSON strings back into objects if possible
        try {
          functionResponseObj = JSON.parse(functionResponse);
        } catch (e) {
          functionResponseObj = { value: functionResponse };
        }
      } else {
        functionResponseObj = { value: String(functionResponse) };
      }

      const payloadArray = [
        {
          functionResponse: {
            name: call.name,
            response: functionResponseObj
          }
        }
      ];

      console.debug('Sending function response back to model for', call.name, { payloadArray });
      result = await chat.sendMessage(payloadArray);

      // Attach the executed tool response to the functionCalls entry so we can
      // build a fallback summary if the model does not return text.
      try {
        functionCalls[functionCalls.length - 1].response = functionResponseObj;
      } catch (attachErr) {
        console.debug('Failed to attach function response to log entry:', attachErr);
      }
      console.debug('Result after function response:', result);
      response = result.response;

      // Recompute pending calls (in case model chains multiple function calls)
      pendingFunctionCalls = getFunctionCallsArray(response);
    }

    // Safely extract text
    let text = '';
    try {
      text = response && typeof response.text === 'function' ? response.text() : (response?.text || '');
    } catch (ex) {
      console.error('Failed to extract response.text():', ex);
      text = '';
    }

    console.debug('Final AI response text preview:', String(text).slice(0, 500));

    // If the model never produced text but did function calls, synthesize a concise
    // assistant response from the first function call's tool output so the UI
    // never displays an empty bubble.
    if ((!text || !String(text).trim()) && functionCalls && functionCalls.length > 0) {
      try {
        const first = functionCalls[0];
        const resp = first.response || {};

        // Simple heuristics per tool
        if (first.name === 'queryDatabase' && resp.type === 'department' && Array.isArray(resp.results)) {
          if (resp.results.length === 0) {
            text = `I couldn't find a match for that department.`;
          } else {
            const d = resp.results[0];
            text = `Yes — ${d.name} is in the ${d.faculty || 'the university'}.`;
            if (d.hodName) text += ` Head of Department: ${d.hodName}.`;
            if (d.location) text += ` Location: ${d.location}.`;
          }
        } else if (first.name === 'recommendResources' && resp.type === 'resources' && Array.isArray(resp.items)) {
          const items = resp.items.slice(0, 3).map(i => `• ${i.title || i.name}${i.url ? ` — ${i.url}` : ''}`).join('\n');
          text = `Here are some recommended resources:\n${items}`;
        } else if (first.name === 'getNews' && resp.type === 'news' && Array.isArray(resp.news)) {
          const titles = resp.news.slice(0, 3).map(n => `• ${n.title}`).join('\n');
          text = `Here are the top news items I found:\n${titles}`;
        } else if (first.response && typeof first.response === 'string') {
          text = first.response;
        } else {
          // Generic fallback summarizer
          text = 'I found some information that may help — would you like to see more details?';
        }
      } catch (summErr) {
        console.debug('Fallback summarizer failed:', summErr);
        text = 'Sorry, I could not generate a response right now.';
      }
    }

    return {
      text,
      functionCalls,
      conversationHistory: await chat.getHistory()
    };
    console.debug('Final AI response text preview:', String(text).slice(0, 500));

    return {
      text,
      functionCalls,
      conversationHistory: await chat.getHistory()
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Provide more specific error messages
    console.error('Gemini API caught error details:', { message: error.message, stack: error.stack });
    if (error.message && error.message.includes('API key not valid')) {
      console.error('The Gemini API key is invalid or not set properly');
      throw new Error('AI service is temporarily unavailable. Please contact administrator to configure the API key.');
    }
    
    if (error.message && error.message.includes('quota')) {
      throw new Error('AI service is busy. Please try again in a moment.');
    }
    
    throw new Error('Failed to process chat message. Please try again.');
  }
}

// Main chat function with fallback
async function chat(userMessage, conversationHistory = []) {
  try {
    return await callGeminiAPI(userMessage, conversationHistory);
  } catch (error) {
    console.error('AI service failed, using fallback:', error.message);
    return getFallbackResponse(userMessage);
  }
}

// Tool functions for AI function calling
async function getNewsTool({ userId, userRole, departmentId, courseIds }) {
  try {
    const news = await News.getNewsForUser(userId, userRole, departmentId, courseIds || []);

    return {
      type: 'news',
      count: news.length,
      news: news.map(item => ({
        title: item.title,
        content: item.content,
        author: item.authorId ? item.authorId.name : 'Unknown',
        audience: item.audience,
        department: item.department ? item.department.name : null,
        course: item.course ? item.course.title : null,
        createdAt: item.createdAt,
        active: item.active
      }))
    };
  } catch (error) {
    console.error('getNewsTool error:', error);
    return {
      type: 'error',
      message: 'Failed to fetch news'
    };
  }
}

async function getFinancialInfoTool({ studentId, requestingUserId, requestingUserRole }) {
  try {
    // Permission check
    const allowedRoles = ['system_admin', 'bursary_admin'];
    const isOwner = requestingUserId === studentId;
    const hasPermission = allowedRoles.includes(requestingUserRole) || (requestingUserRole === 'student' && isOwner);

    if (!hasPermission) {
      return {
        type: 'error',
        message: 'Access denied to financial information'
      };
    }

    const fees = await Fees.findOne({ studentId })
      .populate('studentId', 'name matricNumber')
      .populate('paymentHistory.recordedBy', 'name role');

    if (!fees) {
      return {
        type: 'error',
        message: 'Financial record not found'
      };
    }

    return {
      type: 'financial_info',
      student: {
        name: fees.studentId.name,
        matricNumber: fees.studentId.matricNumber
      },
      fees: {
        totalFees: fees.totalFees,
        amountPaid: fees.amountPaid,
        balance: fees.balance,
        paymentStatus: fees.paymentStatus,
        semester: fees.semester,
        session: fees.session,
        lastUpdated: fees.lastUpdated,
        paymentHistory: fees.paymentHistory.map(payment => ({
          date: payment.date,
          amount: payment.amount,
          description: payment.description,
          paymentMethod: payment.paymentMethod,
          recordedBy: payment.recordedBy ? payment.recordedBy.name : 'System'
        }))
      }
    };
  } catch (error) {
    console.error('getFinancialInfoTool error:', error);
    return {
      type: 'error',
      message: 'Failed to fetch financial information'
    };
  }
}

module.exports = { 
  chat,
  getFallbackResponse
};