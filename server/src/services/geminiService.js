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
      model: 'gemini-1.5-flash',
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
      } else if (call.name === 'getNews') {
        functionResponse = await getNewsTool(call.args);
      } else if (call.name === 'getFinancialInfo') {
        functionResponse = await getFinancialInfoTool(call.args);
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
    
    // Provide more specific error messages
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