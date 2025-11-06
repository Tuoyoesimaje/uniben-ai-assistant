/**
 * Test Data Management and Setup Procedures
 * Automated test data seeding and cleanup for UNIBEN AI Assistant
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Course = require('../src/models/Course');
const Building = require('../src/models/Building');
const News = require('../src/models/News');
const Quiz = require('../src/models/Quiz');
const FeesCatalog = require('../src/models/FeesCatalog');
const Conversation = require('../src/models/Conversation');

class TestDataManager {
  constructor() {
    this.testData = {
      departments: [],
      users: [],
      courses: [],
      buildings: [],
      news: [],
      quizzes: [],
      feesCatalogs: [],
      conversations: []
    };
  }

  /**
   * Initialize test database connection
   */
  async initializeTestDatabase() {
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_setup_procedures';
    
    const connectDB = require('../src/config/database');
    await connectDB();
  }

  /**
   * Clean test database
   */
  async cleanDatabase() {
    const collections = mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('Test database cleaned successfully');
  }

  /**
   * Seed departments
   */
  async seedDepartments() {
    const departments = [
      {
        name: 'Computer Science',
        code: 'CSC',
        faculty: 'Science',
        hodName: 'Dr. Test CS HOD',
        description: 'Department of Computer Science',
        location: 'Building A, Floor 3',
        phone: '+234-803-123-4567',
        email: 'cs@uniben.edu.ng',
        website: 'https://cs.uniben.edu.ng',
        establishedYear: 1990,
        staffCount: 25,
        studentCount: 500
      },
      {
        name: 'Mathematics',
        code: 'MTH',
        faculty: 'Science',
        hodName: 'Dr. Test Math HOD',
        description: 'Department of Mathematics',
        location: 'Building B, Floor 2',
        phone: '+234-803-234-5678',
        email: 'math@uniben.edu.ng',
        website: 'https://math.uniben.edu.ng',
        establishedYear: 1985,
        staffCount: 20,
        studentCount: 350
      },
      {
        name: 'Physics',
        code: 'PHY',
        faculty: 'Science',
        hodName: 'Dr. Test Physics HOD',
        description: 'Department of Physics',
        location: 'Building C, Floor 1',
        phone: '+234-803-345-6789',
        email: 'physics@uniben.edu.ng',
        website: 'https://physics.uniben.edu.ng',
        establishedYear: 1980,
        staffCount: 18,
        studentCount: 280
      },
      {
        name: 'Chemistry',
        code: 'CHM',
        faculty: 'Science',
        hodName: 'Dr. Test Chemistry HOD',
        description: 'Department of Chemistry',
        location: 'Building D, Floor 2',
        phone: '+234-803-456-7890',
        email: 'chemistry@uniben.edu.ng',
        website: 'https://chemistry.uniben.edu.ng',
        establishedYear: 1975,
        staffCount: 22,
        studentCount: 320
      },
      {
        name: 'Biology',
        code: 'BIO',
        faculty: 'Science',
        hodName: 'Dr. Test Biology HOD',
        description: 'Department of Biology',
        location: 'Building E, Floor 1',
        phone: '+234-803-567-8901',
        email: 'biology@uniben.edu.ng',
        website: 'https://biology.uniben.edu.ng',
        establishedYear: 1970,
        staffCount: 24,
        studentCount: 400
      }
    ];

    this.testData.departments = await Department.insertMany(departments);
    console.log(`Seeded ${this.testData.departments.length} departments`);
    return this.testData.departments;
  }

  /**
   * Seed users with various roles
   */
  async seedUsers() {
    const users = [];

    // System administrators
    users.push(
      {
        name: 'System Administrator',
        role: 'system_admin',
        staffId: 'SYSADMIN-001',
        isActive: true,
        email: 'sysadmin@uniben.edu.ng',
        phone: '+234-803-111-2222',
        address: 'Administrative Block, UNIBEN',
        createdAt: new Date('2023-01-01')
      },
      {
        name: 'Deputy System Admin',
        role: 'system_admin',
        staffId: 'SYSADMIN-002',
        isActive: true,
        email: 'deputy.sysadmin@uniben.edu.ng',
        phone: '+234-803-111-3333',
        address: 'Administrative Block, UNIBEN',
        createdAt: new Date('2023-01-15')
      }
    );

    // Department administrators
    for (let i = 0; i < this.testData.departments.length; i++) {
      const dept = this.testData.departments[i];
      users.push({
        name: `Head of ${dept.name}`,
        role: 'departmental_admin',
        staffId: `DEPT-20${i + 1}`,
        isActive: true,
        email: `head.${dept.code.toLowerCase()}@uniben.edu.ng`,
        department: dept._id,
        phone: `+234-803-${200 + i}-${4000 + i}`,
        address: `${dept.location}, UNIBEN`,
        createdAt: new Date('2023-02-01')
      });
    }

    // Lecturer administrators
    for (let i = 0; i < 30; i++) {
      const dept = this.testData.departments[i % this.testData.departments.length];
      users.push({
        name: `Lecturer ${i + 1}`,
        role: 'lecturer_admin',
        staffId: `LECT-${String(i + 1).padStart(3, '0')}`,
        isActive: true,
        email: `lecturer${i + 1}@uniben.edu.ng`,
        department: dept._id,
        phone: `+234-803-300-${1000 + i}`,
        address: `${dept.location}, UNIBEN`,
        specialization: ['Artificial Intelligence', 'Database Systems', 'Web Development', 'Mobile Computing', 'Software Engineering'][i % 5],
        qualifications: 'PhD Computer Science',
        experience: 5 + (i % 15),
        createdAt: new Date('2023-03-01')
      });
    }

    // Bursary administrators
    users.push(
      {
        name: 'Chief Bursar',
        role: 'bursary_admin',
        staffId: 'BURSARY-001',
        isActive: true,
        email: 'bursar@uniben.edu.ng',
        phone: '+234-803-444-5555',
        address: 'Bursary Department, UNIBEN',
        createdAt: new Date('2023-01-10')
      },
      {
        name: 'Assistant Bursar',
        role: 'bursary_admin',
        staffId: 'BURSARY-002',
        isActive: true,
        email: 'assistant.bursar@uniben.edu.ng',
        phone: '+234-803-444-6666',
        address: 'Bursary Department, UNIBEN',
        createdAt: new Date('2023-02-15')
      }
    );

    // Regular staff
    for (let i = 0; i < 25; i++) {
      const dept = this.testData.departments[i % this.testData.departments.length];
      users.push({
        name: `Staff Member ${i + 1}`,
        role: 'staff',
        staffId: `STAFF-${String(i + 1).padStart(3, '0')}`,
        isActive: true,
        email: `staff${i + 1}@uniben.edu.ng`,
        department: dept._id,
        phone: `+234-803-500-${2000 + i}`,
        address: `${dept.location}, UNIBEN`,
        position: ['Administrative Assistant', 'Secretary', 'Technician', 'Clerk'][i % 4],
        createdAt: new Date('2023-04-01')
      });
    }

    // Students
    for (let i = 0; i < 100; i++) {
      const dept = this.testData.departments[i % this.testData.departments.length];
      const level = 100 + ((i % 4) * 100);
      const admissionYear = 20 + (i % 5); // 20-24 for years 2020-2024
      const studentNumber = String(Math.floor(i / 10) + 1).padStart(2, '0') + String(i % 10).padStart(2, '0');
      users.push({
        name: `Student ${i + 1}`,
        role: 'student',
        matricNumber: `${dept.code}/${admissionYear}/${studentNumber}`,
        isActive: true,
        email: `student${i + 1}@uniben.edu.ng`,
        department: dept._id,
        phone: `+234-803-600-${3000 + i}`,
        address: `Hostel ${((i % 8) + 1)}, UNIBEN`,
        level: level,
        semester: (i % 2) + 1,
        cgpa: 2.0 + (Math.random() * 2.0),
        creditsCompleted: (level - 100) * 6,
        dateOfBirth: new Date(2000 + (i % 5), i % 12, (i % 28) + 1),
        stateOfOrigin: ['Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Anambra'][i % 6],
        createdAt: new Date('2023-08-15')
      });
    }

    this.testData.users = await User.insertMany(users);
    console.log(`Seeded ${this.testData.users.length} users`);
    return this.testData.users;
  }

  /**
   * Seed courses
   */
  async seedCourses() {
    const courses = [];
    
    for (const dept of this.testData.departments) {
      const lecturer = this.testData.users.find(u => 
        u.role === 'lecturer_admin' && u.department.toString() === dept._id.toString()
      );
      
      if (lecturer) {
        // Create courses for each level (100, 200, 300, 400)
        for (let level = 100; level <= 400; level += 100) {
          for (let i = 0; i < 3; i++) {
            const courseCode = `${dept.code}${level + i}`;
            const courseTitles = {
              'CSC': ['Introduction to Programming', 'Data Structures', 'Software Engineering', 'Artificial Intelligence'],
              'MTH': ['Calculus I', 'Linear Algebra', 'Statistics', 'Discrete Mathematics'],
              'PHY': ['Mechanics', 'Electromagnetism', 'Quantum Physics', 'Thermodynamics'],
              'CHM': ['General Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Analytical Chemistry'],
              'BIO': ['Cell Biology', 'Genetics', 'Ecology', 'Microbiology']
            };
            
            courses.push({
              code: courseCode,
              title: courseTitles[dept.code][i],
              description: `${courseTitles[dept.code][i]} - A comprehensive course in ${dept.name}`,
              department: dept._id,
              faculty: dept.faculty,
              level: level,
              credit: 3 + (i % 3),
              semester: (i % 2) + 1,
              prerequisites: level > 100 ? [`${dept.code}${level - 100}`] : [],
              corequisites: [],
              syllabus: `Comprehensive syllabus for ${courseTitles[dept.code][i]}`,
              learningOutcomes: [
                `Understand fundamental concepts of ${courseTitles[dept.code][i]}`,
                `Apply theoretical knowledge to practical problems`,
                `Develop critical thinking skills in the subject area`
              ],
              assessmentMethods: ['Written Exams', 'Practical Tests', 'Assignments', 'Projects'],
              isActive: true,
              assignedTo: lecturer._id,
              departments_offering: [{
                department: dept._id,
                level: level,
                lecturerId: lecturer._id,
                semester: (i % 2) + 1,
                isActive: true,
                assignedBy: lecturer._id,
                offeredAt: new Date('2023-08-15')
              }],
              createdAt: new Date('2023-07-01')
            });
          }
        }
      }
    }

    this.testData.courses = await Course.insertMany(courses);
    console.log(`Seeded ${this.testData.courses.length} courses`);
    return this.testData.courses;
  }

  /**
   * Seed buildings
   */
  async seedBuildings() {
    const buildings = [
      {
        name: 'Computer Science Building',
        department: 'Computer Science',
        faculty: 'Science',
        latitude: 6.3350,
        longitude: 5.6037,
        photoURL: 'https://example.com/csb.jpg',
        description: 'Modern facility for Computer Science department with state-of-the-art laboratories',
        category: 'academic',
        icon: '💻',
        address: 'Computer Science Department, UNIBEN',
        phone: '+234-803-123-4567',
        email: 'cs@uniben.edu.ng',
        website: 'https://cs.uniben.edu.ng',
        openingHours: '8:00 AM - 6:00 PM',
        facilities: ['Computer Labs', 'Library', 'Lecture Halls', 'Staff Offices'],
        capacity: 500,
        floorCount: 4,
        constructionYear: 2010,
        lastRenovated: 2020,
        isActive: true,
        tags: ['computer science', 'programming', 'technology', 'labs']
      },
      {
        name: 'Mathematics Building',
        department: 'Mathematics',
        faculty: 'Science',
        latitude: 6.3345,
        longitude: 5.6040,
        photoURL: 'https://example.com/math.jpg',
        description: 'Mathematics department building with tutorial rooms and research facilities',
        category: 'academic',
        icon: '📐',
        address: 'Mathematics Department, UNIBEN',
        phone: '+234-803-234-5678',
        email: 'math@uniben.edu.ng',
        openingHours: '8:00 AM - 5:00 PM',
        facilities: ['Tutorial Rooms', 'Seminar Hall', 'Research Library'],
        capacity: 300,
        floorCount: 3,
        constructionYear: 2005,
        isActive: true,
        tags: ['mathematics', 'statistics', 'research']
      },
      {
        name: 'Main Library',
        latitude: 6.3345,
        longitude: 5.6042,
        photoURL: 'https://example.com/library.jpg',
        description: 'Central university library with extensive collection and digital resources',
        category: 'library',
        icon: '📚',
        address: 'Central Campus, UNIBEN',
        phone: '+234-803-987-6543',
        email: 'library@uniben.edu.ng',
        website: 'https://library.uniben.edu.ng',
        openingHours: '24/7',
        facilities: ['Reading Rooms', 'Digital Lab', 'Conference Rooms', 'Study Spaces'],
        capacity: 1000,
        floorCount: 5,
        constructionYear: 1995,
        lastRenovated: 2019,
        isActive: true,
        tags: ['books', 'research', 'study', 'digital resources']
      },
      {
        name: 'Administrative Block',
        faculty: 'Administration',
        latitude: 6.3340,
        longitude: 5.6035,
        photoURL: 'https://example.com/admin.jpg',
        description: 'Main administrative building housing various university offices',
        category: 'administrative',
        icon: '🏛️',
        address: 'Administrative District, UNIBEN',
        phone: '+234-803-456-7890',
        email: 'admin@uniben.edu.ng',
        openingHours: '8:00 AM - 5:00 PM',
        facilities: ['Offices', 'Conference Rooms', 'Registry', 'Bursary'],
        capacity: 200,
        floorCount: 3,
        constructionYear: 1985,
        isActive: true,
        tags: ['administration', 'registration', 'records', 'offices']
      },
      {
        name: 'Science Complex',
        faculty: 'Science',
        latitude: 6.3335,
        longitude: 5.6030,
        photoURL: 'https://example.com/science.jpg',
        description: 'Multi-purpose science facility housing Physics, Chemistry, and Biology departments',
        category: 'academic',
        icon: '🧪',
        address: 'Science District, UNIBEN',
        phone: '+234-803-567-8901',
        openingHours: '8:00 AM - 6:00 PM',
        facilities: ['Laboratories', 'Lecture Halls', 'Research Centers', 'Equipment Rooms'],
        capacity: 800,
        floorCount: 6,
        constructionYear: 2008,
        lastRenovated: 2018,
        isActive: true,
        tags: ['science', 'laboratories', 'research', 'physics', 'chemistry', 'biology']
      }
    ];

    this.testData.buildings = await Building.insertMany(buildings);
    console.log(`Seeded ${this.testData.buildings.length} buildings`);
    return this.testData.buildings;
  }

  /**
   * Seed news and announcements
   */
  async seedNews() {
    const newsItems = [];
    const authors = this.testData.users.filter(u => 
      ['system_admin', 'departmental_admin'].includes(u.role)
    );

    const newsTemplates = [
      {
        title: 'Semester Registration Begins',
        content: 'Registration for the new semester begins next week. All students are advised to complete their registration on time.',
        audience: 'general',
        category: 'academic'
      },
      {
        title: 'New Laboratory Equipment Arrived',
        content: 'State-of-the-art laboratory equipment has been installed in the Computer Science building.',
        audience: 'department',
        category: 'infrastructure'
      },
      {
        title: 'Guest Lecture Series Announced',
        content: 'Renowned experts will be delivering guest lectures throughout the semester.',
        audience: 'course',
        category: 'academic'
      },
      {
        title: 'Campus Maintenance Notice',
        content: 'Scheduled maintenance will be conducted on campus facilities during the weekend.',
        audience: 'general',
        category: 'maintenance'
      },
      {
        title: 'Student Union Elections',
        content: 'Nominations for student union positions are now open. Interested students should submit their nominations.',
        audience: 'general',
        category: 'student affairs'
      }
    ];

    for (let i = 0; i < 20; i++) {
      const template = newsTemplates[i % newsTemplates.length];
      const author = authors[i % authors.length];
      const department = this.testData.departments[i % this.testData.departments.length];
      const course = this.testData.courses[i % this.testData.courses.length];

      newsItems.push({
        title: `${template.title} ${i + 1}`,
        content: `${template.content} This is news item number ${i + 1} for testing purposes.`,
        authorId: author._id,
        audience: template.audience,
        category: template.category,
        department: template.audience === 'department' ? department._id : null,
        course: template.audience === 'course' ? course._id : null,
        priority: ['low', 'medium', 'high'][i % 3],
        isBreaking: i % 10 === 0,
        tags: [template.category, 'test', 'news'],
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 50),
        active: true,
        scheduledPublishDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)), // Spread over days
        createdAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)) // Spread over hours
      });
    }

    this.testData.news = await News.insertMany(newsItems);
    console.log(`Seeded ${this.testData.news.length} news items`);
    return this.testData.news;
  }

  /**
   * Seed quizzes
   */
  async seedQuizzes() {
    const quizzes = [];
    const lecturers = this.testData.users.filter(u => u.role === 'lecturer_admin');

    const questionTemplates = [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Binary search has O(log n) time complexity as it divides the search space in half with each iteration.',
        difficulty: 'medium',
        topic: 'Algorithms'
      },
      {
        question: 'Which data structure uses FIFO principle?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctAnswer: 1,
        explanation: 'Queue follows First In First Out (FIFO) principle where the first element added is the first to be removed.',
        difficulty: 'easy',
        topic: 'Data Structures'
      },
      {
        question: 'What is the primary purpose of normalization in databases?',
        options: ['Increase storage space', 'Reduce data redundancy', 'Improve query speed', 'Enhance security'],
        correctAnswer: 1,
        explanation: 'Normalization primarily aims to reduce data redundancy and dependency by organizing data efficiently.',
        difficulty: 'medium',
        topic: 'Database Systems'
      }
    ];

    for (let i = 0; i < 15; i++) {
      const course = this.testData.courses[i % this.testData.courses.length];
      const lecturer = lecturers[i % lecturers.length];

      const questions = [];
      for (let j = 0; j < 5; j++) {
        const template = questionTemplates[j % questionTemplates.length];
        questions.push({
          question: `${template.question} (Question ${j + 1})`,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          topic: template.topic,
          marks: 2,
          order: j + 1
        });
      }

      quizzes.push({
        title: `Quiz ${i + 1} - ${course.title}`,
        description: `Comprehensive quiz covering key topics in ${course.title}`,
        course: course._id,
        createdBy: lecturer._id,
        questions: questions,
        totalMarks: questions.length * 2,
        timeLimit: 60, // minutes
        attemptsAllowed: 3,
        isRandomized: i % 2 === 0,
        showResults: true,
        showCorrectAnswers: false,
        availableFrom: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        availableUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
        isActive: true,
        instructions: 'Answer all questions to the best of your ability. Manage your time effectively.',
        tags: ['quiz', course.code.toLowerCase(), 'test'],
        createdAt: new Date(Date.now() - (i * 6 * 60 * 60 * 1000))
      });
    }

    this.testData.quizzes = await Quiz.insertMany(quizzes);
    console.log(`Seeded ${this.testData.quizzes.length} quizzes`);
    return this.testData.quizzes;
  }

  /**
   * Seed fees catalog
   */
  async seedFeesCatalog() {
    const feesCatalogs = [];

    const levels = ['100', '200', '300', '400', '500'];
    const sessions = ['2023/2024', '2024/2025'];
    
    for (const level of levels) {
      for (const session of sessions) {
        const baseTuition = parseInt(level) * 50000; // Level 100 = 50,000, etc.
        
        const items = [
          {
            category: 'Tuition',
            description: `Tuition fee for ${level} level students`,
            amount: baseTuition,
            currency: 'NGN',
            mandatory: true,
            dueDate: new Date(`${session.split('/')[0]}-09-30`),
            paymentPlan: ['full', 'installment']
          },
          {
            category: 'Development Levy',
            description: 'University development levy',
            amount: 15000,
            currency: 'NGN',
            mandatory: true,
            dueDate: new Date(`${session.split('/')[0]}-09-30`)
          },
          {
            category: 'Laboratory Fee',
            description: 'Laboratory and practical session fees',
            amount: level >= '300' ? 10000 : 5000,
            currency: 'NGN',
            mandatory: level >= '200',
            dueDate: new Date(`${session.split('/')[0]}-10-15`)
          },
          {
            category: 'Library Fee',
            description: 'Library services and digital resources',
            amount: 5000,
            currency: 'NGN',
            mandatory: true,
            dueDate: new Date(`${session.split('/')[0]}-09-30`)
          },
          {
            category: 'Medical Fee',
            description: 'University medical services',
            amount: 3000,
            currency: 'NGN',
            mandatory: true,
            dueDate: new Date(`${session.split('/')[0]}-09-30`)
          },
          {
            category: 'Sports Fee',
            description: 'Sports and recreational facilities',
            amount: 2000,
            currency: 'NGN',
            mandatory: true,
            dueDate: new Date(`${session.split('/')[0]}-10-01`)
          },
          {
            category: 'Matriculation Fee',
            description: 'One-time matriculation fee for new students',
            amount: level === '100' ? 10000 : 0,
            currency: 'NGN',
            mandatory: level === '100',
            dueDate: new Date(`${session.split('/')[0]}-09-15`),
            oneTime: true
          },
          {
            category: 'Project Fee',
            description: 'Final year project and research fees',
            amount: level >= '400' ? 20000 : 0,
            currency: 'NGN',
            mandatory: level >= '400',
            dueDate: new Date(`${session.split('/')[1]}-02-28`)
          }
        ];

        feesCatalogs.push({
          level: level,
          session: session,
          currency: 'NGN',
          effectiveFrom: new Date(`${session.split('/')[0]}-08-01`),
          effectiveUntil: new Date(`${session.split('/')[1]}-07-31`),
          isNew: session === '2024/2025',
          isActive: true,
          items: items,
          notes: `Fees structure for ${level} level students in ${session} academic session. All fees are subject to review.`,
          totalAmount: items.filter(item => item.mandatory).reduce((sum, item) => sum + item.amount, 0),
          installmentPlans: {
            fullPayment: {
              discount: 5,
              dueDate: new Date(`${session.split('/')[0]}-09-30`)
            },
            twoInstallments: {
              firstInstallment: 60,
              secondInstallment: 40,
              firstDueDate: new Date(`${session.split('/')[0]}-09-30`),
              secondDueDate: new Date(`${session.split('/')[1]}-01-31`)
            }
          },
          createdAt: new Date('2023-06-01'),
          lastUpdated: new Date('2023-08-15')
        });
      }
    }

    this.testData.feesCatalogs = await FeesCatalog.insertMany(feesCatalogs);
    console.log(`Seeded ${this.testData.feesCatalogs.length} fees catalogs`);
    return this.testData.feesCatalogs;
  }

  /**
   * Seed sample conversations
   */
  async seedConversations() {
    const conversations = [];
    const students = this.testData.users.filter(u => u.role === 'student');
    
    for (let i = 0; i < 20; i++) {
      const student = students[i % students.length];
      const messageCount = 5 + Math.floor(Math.random() * 10);
      const messages = [];
      
      // Generate conversation messages
      for (let j = 0; j < messageCount; j++) {
        if (j % 2 === 0) {
          // User message
          messages.push({
            role: 'user',
            content: j === 0 ? 'Hello, I need help with my courses' : `Follow up question ${j}`,
            timestamp: new Date(Date.now() - ((messageCount - j) * 60000))
          });
        } else {
          // AI response
          messages.push({
            role: 'assistant',
            content: j === 1 ? 'I can help you with course information. Which department are you in?' : 'Here is the information you requested.',
            timestamp: new Date(Date.now() - ((messageCount - j) * 60000) + 30000)
          });
        }
      }

      conversations.push({
        userId: student._id,
        title: `Chat ${i + 1}`,
        messages: messages,
        messageCount: messages.length,
        lastActivity: messages[messages.length - 1].timestamp,
        isActive: true,
        tags: ['test', 'course help', 'student inquiry'],
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000))
      });
    }

    this.testData.conversations = await Conversation.insertMany(conversations);
    console.log(`Seeded ${this.testData.conversations.length} conversations`);
    return this.testData.conversations;
  }

  /**
   * Run complete test data seeding
   */
  async seedAll() {
    console.log('Starting test data seeding...');
    
    await this.cleanDatabase();
    
    await this.seedDepartments();
    await this.seedUsers();
    await this.seedCourses();
    await this.seedBuildings();
    await this.seedNews();
    await this.seedQuizzes();
    await this.seedFeesCatalog();
    await this.seedConversations();
    
    console.log('Test data seeding completed successfully!');
    
    // Generate summary
    const summary = {
      departments: this.testData.departments.length,
      users: this.testData.users.length,
      courses: this.testData.courses.length,
      buildings: this.testData.buildings.length,
      news: this.testData.news.length,
      quizzes: this.testData.quizzes.length,
      feesCatalogs: this.testData.feesCatalogs.length,
      conversations: this.testData.conversations.length
    };
    
    console.log('Test data summary:', summary);
    return summary;
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('Cleaning up test data...');
    
    await this.cleanDatabase();
    
    // Reset test data object
    this.testData = {
      departments: [],
      users: [],
      courses: [],
      buildings: [],
      news: [],
      quizzes: [],
      feesCatalogs: [],
      conversations: []
    };
    
    console.log('Test data cleanup completed!');
  }

  /**
   * Get test statistics
   */
  getTestDataStatistics() {
    const stats = {
      totalRecords: Object.values(this.testData).reduce((sum, arr) => sum + arr.length, 0),
      byType: {
        departments: this.testData.departments.length,
        users: this.testData.users.length,
        courses: this.testData.courses.length,
        buildings: this.testData.buildings.length,
        news: this.testData.news.length,
        quizzes: this.testData.quizzes.length,
        feesCatalogs: this.testData.feesCatalogs.length,
        conversations: this.testData.conversations.length
      },
      byUserRole: this.testData.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      byBuildingCategory: this.testData.buildings.reduce((acc, building) => {
        acc[building.category] = (acc[building.category] || 0) + 1;
        return acc;
      }, {}),
      totalCapacity: this.testData.buildings.reduce((sum, building) => sum + (building.capacity || 0), 0),
      totalCourses: this.testData.courses.length,
      activeQuizzes: this.testData.quizzes.filter(q => q.isActive).length
    };
    
    return stats;
  }
}

module.exports = TestDataManager;