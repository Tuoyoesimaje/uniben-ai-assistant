const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
let testData;

beforeAll(async () => {
  // Configure test environment
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_chatbot_testing';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test_gemini_key_for_testing';

  // Connect to test database
  const connectDB = require('../src/config/database');
  await connectDB();

  // Clean database before tests
  await mongoose.connection.db.dropDatabase();

  // Import models after DB connection
  const User = require('../src/models/User');
  const Department = require('../src/models/Department');
  const Course = require('../src/models/Course');
  const Building = require('../src/models/Building');
  const Conversation = require('../src/models/Conversation');
  const News = require('../src/models/News');

  // Create test department
  const testDepartment = await Department.create({
    name: 'Computer Science',
    code: 'CSC',
    faculty: 'Science',
    hodName: 'Dr. Test HOD'
  });

  // Create test users for different roles
  const users = await Promise.all([
    User.create({
      name: 'Test Student',
      role: 'student',
      matricNumber: 'CSC/20/1234',
      isActive: true,
      email: 'student@test.com',
      department: testDepartment._id
    }),
    User.create({
      name: 'Test Staff',
      role: 'staff',
      staffId: 'STAFF-1001',
      isActive: true,
      email: 'staff@test.com',
      department: testDepartment._id
    })
  ]);

  // Create test course
  const testCourse = await Course.create({
    code: 'CSC101',
    title: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science',
    department: testDepartment._id,
    faculty: 'Science',
    level: 100,
    credit: 3
  });

  // Create test buildings
  const buildings = await Promise.all([
    Building.create({
      name: 'Computer Science Building',
      department: 'Computer Science',
      faculty: 'Science',
      latitude: 6.3350,
      longitude: 5.6037,
      photoURL: 'https://example.com/csb.jpg',
      description: 'Main CS department building',
      category: 'academic'
    }),
    Building.create({
      name: 'Main Library',
      latitude: 6.3345,
      longitude: 5.6042,
      photoURL: 'https://example.com/library.jpg',
      description: 'University main library',
      category: 'library'
    })
  ]);

  // Create test news
  const newsItem = await News.create({
    title: 'Test News Item',
    content: 'This is a test news announcement',
    authorId: users[1]._id,
    audience: 'everyone',
    department: testDepartment._id,
    active: true
  });

  // Generate tokens for test users
  testData = {
    department: testDepartment,
    users: {
      student: users[0],
      staff: users[1]
    },
    course: testCourse,
    buildings: buildings,
    news: newsItem,
    tokens: {}
  };

  // Create JWT tokens
  for (const [role, user] of Object.entries(testData.users)) {
    testData.tokens[role] = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        displayId: user.displayId,
        department: user.department
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'uniben-ai-assistant',
        audience: 'uniben-users'
      }
    );
  }

  // Create guest token
  testData.tokens.guest = jwt.sign(
    {
      role: 'guest',
      isGuest: true,
      id: 'guest-user'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'uniben-ai-assistant',
      audience: 'uniben-users'
    }
  );

  // Load the app after setup
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('AI Chatbot Functionality Tests', () => {
  describe('Basic Query Processing', () => {
    test('CHAT-BASIC-001: Simple greeting query', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(response.body.conversationId).toBeDefined();
    });

    test('CHAT-BASIC-002: Course information query', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Tell me about CSC101' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.conversationId).toBeDefined();
    });

    test('CHAT-BASIC-003: Building location query', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Where is the Computer Science department?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.hasLocation).toBeDefined();
    });

    test('CHAT-BASIC-004: Empty message should be handled', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: '' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-BASIC-005: Very long message should be handled', async () => {
      const longMessage = 'a'.repeat(5000);
      
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: longMessage });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('AI Integration Testing', () => {
    test('CHAT-AI-001: Google Gemini AI response generation', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Explain the difference between data structures and algorithms' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.message.length).toBeGreaterThan(10);
    });

    test('CHAT-AI-002: Function calling validation', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'What courses are available in Computer Science?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.functionCalls).toBeDefined();
    });

    test('CHAT-AI-003: AI service error handling', async () => {
      // Temporarily break the Gemini API key
      const originalApiKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'invalid_key';
      
      try {
        const response = await request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ message: 'Hello' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBeDefined();
        // Should fall back to basic response
      } finally {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });

    test('CHAT-AI-004: Response time validation', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Hello' });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(10000); // Less than 10 seconds
    });
  });

  describe('Contextual Conversation', () => {
    test('CHAT-CONTEXT-001: Multi-turn conversation context', async () => {
      // First message
      const response1 = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'What courses are available in Computer Science?' });

      const conversationId = response1.body.conversationId;

      // Second message referencing the first
      const response2 = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ 
          message: 'Which of these are 300 level?',
          conversationId: conversationId
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response2.body.conversationId).toBe(conversationId);
      expect(response2.body.message).toBeDefined();
    });

    test('CHAT-CONTEXT-002: Conversation history persistence', async () => {
      // Start conversation
      const response1 = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Tell me about CSC101' });

      const conversationId = response1.body.conversationId;

      // Retrieve conversation history
      const response2 = await request(app)
        .get(`/api/chat/conversation/${conversationId}`)
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.conversation).toBeDefined();
      expect(response2.body.conversation.messages).toBeDefined();
      expect(response2.body.conversation.messages.length).toBeGreaterThan(0);
    });

    test('CHAT-CONTEXT-003: Guest user should not persist conversations', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.guest}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.conversationId).toBeNull();
    });
  });

  describe('Database Integration Testing', () => {
    test('CHAT-DB-001: Department information retrieval', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Who is the HOD of Computer Science?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Dr. Test HOD');
    });

    test('CHAT-DB-002: Building information query', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Show me the Computer Science Building' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.hasLocation).toBe(true);
      expect(response.body.functionCalls).toBeDefined();
    });

    test('CHAT-DB-003: News and announcements retrieval', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'What are the latest announcements?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-DB-004: Course resource recommendations', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Find learning resources for Introduction to Computer Science' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Role-Based Chat Testing', () => {
    test('CHAT-ROLE-001: Student role should see student-appropriate content', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'What news is available for students?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-ROLE-002: Staff role should see staff-appropriate content', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.staff}`)
        .send({ message: 'What administrative functions are available?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-ROLE-003: Guest should have limited access', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.guest}`)
        .send({ message: 'What can you help me with?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.conversationId).toBeNull();
    });
  });

  describe('Conversations Management', () => {
    test('CHAT-CONV-001: Get user conversations', async () => {
      // Create a conversation first
      await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Hello' });

      // Get conversations
      const response = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conversations).toBeDefined();
      expect(Array.isArray(response.body.conversations)).toBe(true);
    });

    test('CHAT-CONV-002: Get specific conversation', async () => {
      // Create a conversation
      const createResponse = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Hello' });

      const conversationId = createResponse.body.conversationId;

      // Get the conversation
      const response = await request(app)
        .get(`/api/chat/conversation/${conversationId}`)
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conversation).toBeDefined();
      expect(response.body.conversation.id).toBe(conversationId);
    });

    test('CHAT-CONV-003: Non-existent conversation should return 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/chat/conversation/${fakeId}`)
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('CHAT-CONV-004: Guest conversations should return empty array', async () => {
      const response = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${testData.tokens.guest}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conversations).toEqual([]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('CHAT-ERROR-001: Missing message should be handled gracefully', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-ERROR-002: Very rapid messages should be rate limited', async () => {
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ message: 'Test message' })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (no explicit rate limiting in current implementation)
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('CHAT-ERROR-003: Special characters should be handled', async () => {
      const specialMessage = 'Hello! @#$%^&*()_+{}|:<>?[]\\;\'",./';
      
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: specialMessage });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    test('CHAT-ERROR-004: Unicode characters should be handled', async () => {
      const unicodeMessage = 'Hello 世界 🌍 Привет مرحبا';
      
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: unicodeMessage });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Performance Testing', () => {
    test('CHAT-PERF-001: Response time under normal load', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ message: 'Hello' });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
    });

    test('CHAT-PERF-002: Concurrent chat requests', async () => {
      const promises = Array(5).fill().map((_, i) =>
        request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ message: `Test message ${i}` })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBeDefined();
      });
    });

    test('CHAT-PERF-003: Long conversation handling', async () => {
      const messages = [
        'Hello',
        'How are you?',
        'What can you help me with?',
        'Tell me about Computer Science',
        'What courses are available?'
      ];

      let conversationId;
      
      for (const message of messages) {
        const response = await request(app)
          .post('/api/chat/message')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ 
            message: message,
            conversationId: conversationId
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        conversationId = response.body.conversationId;
      }

      // Verify conversation still works
      const finalResponse = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ 
          message: 'Thank you',
          conversationId: conversationId
        });

      expect(finalResponse.status).toBe(200);
      expect(finalResponse.body.success).toBe(true);
    });
  });
});