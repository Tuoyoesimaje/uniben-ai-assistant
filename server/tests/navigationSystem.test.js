const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
let testData;

beforeAll(async () => {
  // Configure test environment
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_navigation_testing';
  process.env.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'test_mapbox_token_for_testing';

  // Connect to test database
  const connectDB = require('../src/config/database');
  await connectDB();

  // Clean database before tests
  await mongoose.connection.db.dropDatabase();

  // Import models after DB connection
  const User = require('../src/models/User');
  const Building = require('../src/models/Building');

  // Create test users
  const users = await Promise.all([
    User.create({
      name: 'Test Student',
      role: 'student',
      matricNumber: 'CSC/20/5678',
      isActive: true,
      email: 'student@nav.test.com'
    }),
    User.create({
      name: 'Test Staff',
      role: 'staff',
      staffId: 'STAFF-5001',
      isActive: true,
      email: 'staff@nav.test.com'
    })
  ]);

  // Create test buildings with various categories
  const buildings = await Promise.all([
    // Academic buildings
    Building.create({
      name: 'Computer Science Building',
      department: 'Computer Science',
      faculty: 'Science',
      latitude: 6.3350,
      longitude: 5.6037,
      photoURL: 'https://example.com/csb.jpg',
      description: 'Main CS department building with modern facilities',
      category: 'academic',
      icon: '💻',
      address: 'Computer Science Department, UNIBEN',
      phone: '+234-803-123-4567',
      email: 'cs@uniben.edu.ng',
      openingHours: '8:00 AM - 6:00 PM',
      isActive: true,
      tags: ['computer science', 'programming', 'technology']
    }),
    Building.create({
      name: 'Mathematics Building',
      department: 'Mathematics',
      faculty: 'Science',
      latitude: 6.3345,
      longitude: 5.6040,
      photoURL: 'https://example.com/math.jpg',
      description: 'Mathematics department building',
      category: 'academic',
      icon: '📐',
      address: 'Mathematics Department, UNIBEN',
      isActive: true,
      tags: ['mathematics', 'statistics', 'applied math']
    }),
    // Library
    Building.create({
      name: 'Main Library',
      latitude: 6.3345,
      longitude: 5.6042,
      photoURL: 'https://example.com/library.jpg',
      description: 'University main library with extensive collection',
      category: 'library',
      icon: '📚',
      address: 'Central Campus, UNIBEN',
      phone: '+234-803-987-6543',
      email: 'library@uniben.edu.ng',
      openingHours: '24/7',
      isActive: true,
      tags: ['books', 'research', 'study']
    }),
    // Administrative building
    Building.create({
      name: 'Administrative Block',
      faculty: 'Administration',
      latitude: 6.3340,
      longitude: 5.6035,
      photoURL: 'https://example.com/admin.jpg',
      description: 'Main administrative building',
      category: 'administrative',
      icon: '🏛️',
      address: 'Administrative District, UNIBEN',
      phone: '+234-803-456-7890',
      openingHours: '8:00 AM - 5:00 PM',
      isActive: true,
      tags: ['administration', 'registration', 'records']
    }),
    // Inactive building for testing
    Building.create({
      name: 'Old Science Building',
      department: 'Chemistry',
      faculty: 'Science',
      latitude: 6.3335,
      longitude: 5.6030,
      photoURL: 'https://example.com/oldsci.jpg',
      description: 'Deprecated chemistry building',
      category: 'academic',
      icon: '🧪',
      isActive: false,
      tags: ['chemistry', 'old', 'deprecated']
    }),
    // Building with special coordinates (edge cases)
    Building.create({
      name: 'Boundary Building',
      latitude: 90.0,  // Maximum latitude
      longitude: 180.0, // Maximum longitude
      photoURL: 'https://example.com/boundary.jpg',
      description: 'Building at extreme coordinates',
      category: 'facility',
      isActive: true
    }),
    Building.create({
      name: 'Equator Building',
      latitude: 0.0,   // Equator
      longitude: 0.0,  // Prime meridian
      photoURL: 'https://example.com/equator.jpg',
      description: 'Building at 0,0 coordinates',
      category: 'facility',
      isActive: true
    })
  ]);

  // Generate tokens for test users
  testData = {
    users: {
      student: users[0],
      staff: users[1]
    },
    buildings: buildings,
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

  // Load the app after setup
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Navigation System Tests', () => {
  describe('Building Information Retrieval', () => {
    test('NAV-BLDG-001: All buildings retrieval should succeed', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.buildings).toBeDefined();
      expect(Array.isArray(response.body.buildings)).toBe(true);
      expect(response.body.buildings.length).toBeGreaterThan(0);
      
      // Verify building structure
      const building = response.body.buildings[0];
      expect(building.name).toBeDefined();
      expect(building.latitude).toBeDefined();
      expect(building.longitude).toBeDefined();
      expect(building.photoURL).toBeDefined();
    });

    test('NAV-BLDG-002: Specific building retrieval should succeed', async () => {
      const csBuilding = testData.buildings.find(b => b.name === 'Computer Science Building');
      
      const response = await request(app)
        .get(`/api/navigation/buildings/${csBuilding._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.building).toBeDefined();
      expect(response.body.building.name).toBe('Computer Science Building');
      expect(response.body.building.latitude).toBe(6.3350);
      expect(response.body.building.longitude).toBe(5.6037);
      expect(response.body.building.category).toBe('academic');
    });

    test('NAV-BLDG-003: Non-existent building should return 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/navigation/buildings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Building not found');
    });

    test('NAV-BLDG-004: Building data completeness validation', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const building = response.body.buildings.find(b => b.name === 'Computer Science Building');
      
      expect(building).toBeDefined();
      expect(building.name).toBe('Computer Science Building');
      expect(building.department).toBe('Computer Science');
      expect(building.faculty).toBe('Science');
      expect(building.latitude).toBe(6.3350);
      expect(building.longitude).toBe(5.6037);
      expect(building.photoURL).toBe('https://example.com/csb.jpg');
      expect(building.description).toBe('Main CS department building with modern facilities');
      expect(building.category).toBe('academic');
      expect(building.icon).toBe('💻');
      expect(building.address).toBe('Computer Science Department, UNIBEN');
      expect(building.phone).toBe('+234-803-123-4567');
      expect(building.email).toBe('cs@uniben.edu.ng');
      expect(building.openingHours).toBe('8:00 AM - 6:00 PM');
      expect(building.isActive).toBe(true);
      expect(Array.isArray(building.tags)).toBe(true);
    });

    test('NAV-BLDG-005: Inactive buildings should be excluded', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const inactiveBuilding = response.body.buildings.find(b => b.name === 'Old Science Building');
      
      expect(inactiveBuilding).toBeUndefined();
    });

    test('NAV-BLDG-006: Building coordinates validation', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const buildings = response.body.buildings;
      
      buildings.forEach(building => {
        expect(building.latitude).toBeGreaterThanOrEqual(-90);
        expect(building.latitude).toBeLessThanOrEqual(90);
        expect(building.longitude).toBeGreaterThanOrEqual(-180);
        expect(building.longitude).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('Route Calculation Testing', () => {
    test('NAV-ROUTE-001: Simple point-to-point routing should succeed', async () => {
      const start = { lat: 6.3350, lng: 5.6037 }; // Computer Science Building
      const end = { lat: 6.3345, lng: 5.6042 };   // Main Library

      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start, end })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.route).toBeDefined();
      expect(response.body.route.geometry).toBeDefined();
      expect(response.body.route.distance).toBeDefined();
      expect(response.body.route.duration).toBeDefined();
      expect(response.body.route.steps).toBeDefined();
      expect(Array.isArray(response.body.route.steps)).toBe(true);
    });

    test('NAV-ROUTE-002: Route calculation with valid coordinates', async () => {
      const start = { lat: 0.0, lng: 0.0 };     // Equator Building
      const end = { lat: 6.3345, lng: 5.6042 }; // Main Library

      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start, end })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.route.distance).toBeGreaterThan(0);
      expect(response.body.route.duration).toBeGreaterThan(0);
      expect(response.body.route.steps.length).toBeGreaterThan(0);
    });

    test('NAV-ROUTE-003: Route with identical start and end points', async () => {
      const coordinates = { lat: 6.3350, lng: 5.6037 };
      
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start: coordinates, end: coordinates })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.route.distance).toBe(0);
      expect(response.body.route.duration).toBe(0);
    });

    test('NAV-ROUTE-004: Missing start coordinates should fail', async () => {
      const end = { lat: 6.3345, lng: 5.6042 };
      
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ end })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('NAV-ROUTE-005: Missing end coordinates should fail', async () => {
      const start = { lat: 6.3350, lng: 5.6037 };
      
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('NAV-ROUTE-006: Invalid coordinates should be handled', async () => {
      const start = { lat: 999, lng: 5.6037 }; // Invalid latitude
      const end = { lat: 6.3345, lng: 5.6042 };
      
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start, end })
        .expect(500); // Should handle gracefully with server error

      expect(response.body.success).toBe(false);
    });
  });

  describe('GPS Coordinate Validation', () => {
    test('NAV-GPS-001: Valid latitude ranges should be accepted', async () => {
      const validLatitudes = [-90, -45, 0, 45, 90];
      const validLongitude = 0;

      for (const lat of validLatitudes) {
        const start = { lat, lng: validLongitude };
        const end = { lat: lat + 1, lng: validLongitude + 1 };

        const response = await request(app)
          .post('/api/navigation/route')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ start, end })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    test('NAV-GPS-002: Valid longitude ranges should be accepted', async () => {
      const validLongitudes = [-180, -90, 0, 90, 180];
      const validLatitude = 0;

      for (const lng of validLongitudes) {
        const start = { lat: validLatitude, lng };
        const end = { lat: validLatitude + 1, lng: lng + 1 };

        const response = await request(app)
          .post('/api/navigation/route')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ start, end })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    test('NAV-GPS-003: Building coordinates in database should be valid', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const buildings = response.body.buildings;
      
      buildings.forEach(building => {
        expect(building.latitude).toBeGreaterThanOrEqual(-90);
        expect(building.latitude).toBeLessThanOrEqual(90);
        expect(building.longitude).toBeGreaterThanOrEqual(-180);
        expect(building.longitude).toBeLessThanOrEqual(180);
        
        // Check for reasonable precision (should have decimal places)
        expect(building.latitude.toString().includes('.')).toBe(true);
        expect(building.longitude.toString().includes('.')).toBe(true);
      });
    });
  });

  describe('Map Integration Testing', () => {
    test('NAV-MAP-001: Multiple buildings should be retrievable', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      expect(response.body.buildings.length).toBeGreaterThan(1);
      
      // Check for different building types
      const categories = response.body.buildings.map(b => b.category);
      expect(categories).toContain('academic');
      expect(categories).toContain('library');
      expect(categories).toContain('administrative');
    });

    test('NAV-MAP-002: Building search by department should work', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const csBuildings = response.body.buildings.filter(b => 
        b.department === 'Computer Science' || 
        b.name.includes('Computer Science')
      );
      
      expect(csBuildings.length).toBeGreaterThan(0);
      expect(csBuildings[0].category).toBe('academic');
    });

    test('NAV-MAP-003: Building filtering by category should work', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const academicBuildings = response.body.buildings.filter(b => b.category === 'academic');
      const libraryBuildings = response.body.buildings.filter(b => b.category === 'library');
      const adminBuildings = response.body.buildings.filter(b => b.category === 'administrative');
      
      expect(academicBuildings.length).toBeGreaterThan(0);
      expect(libraryBuildings.length).toBeGreaterThan(0);
      expect(adminBuildings.length).toBeGreaterThan(0);
    });

    test('NAV-MAP-004: Building information should be complete', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const mainLibrary = response.body.buildings.find(b => b.name === 'Main Library');
      
      expect(mainLibrary).toBeDefined();
      expect(mainLibrary.name).toBe('Main Library');
      expect(mainLibrary.latitude).toBe(6.3345);
      expect(mainLibrary.longitude).toBe(5.6042);
      expect(mainLibrary.photoURL).toBe('https://example.com/library.jpg');
      expect(mainLibrary.description).toBe('University main library with extensive collection');
      expect(mainLibrary.category).toBe('library');
      expect(mainLibrary.openingHours).toBe('24/7');
      expect(mainLibrary.phone).toBe('+234-803-987-6543');
    });
  });

  describe('Navigation Performance Testing', () => {
    test('NAV-PERF-001: Building retrieval performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Less than 1 second
      expect(response.body.buildings.length).toBeGreaterThan(0);
    });

    test('NAV-PERF-002: Route calculation performance', async () => {
      const start = { lat: 6.3350, lng: 5.6037 };
      const end = { lat: 6.3345, lng: 5.6042 };
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start, end })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
      expect(response.body.route).toBeDefined();
    });

    test('NAV-PERF-003: Concurrent building requests', async () => {
      const promises = Array(5).fill().map(() =>
        request(app).get('/api/navigation/buildings')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.buildings).toBeDefined();
        expect(response.body.buildings.length).toBeGreaterThan(0);
      });
    });

    test('NAV-PERF-004: Concurrent route calculations', async () => {
      const routePromises = Array(3).fill().map((_, i) => {
        const start = { lat: 6.3350 + i * 0.001, lng: 5.6037 + i * 0.001 };
        const end = { lat: 6.3345 + i * 0.001, lng: 5.6042 + i * 0.001 };
        
        return request(app)
          .post('/api/navigation/route')
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .send({ start, end });
      });

      const responses = await Promise.all(routePromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.route).toBeDefined();
      });
    });
  });

  describe('Navigation Error Handling', () => {
    test('NAV-ERROR-001: Invalid building ID should return 404', async () => {
      const fakeId = 'invalid-building-id';
      
      const response = await request(app)
        .get(`/api/navigation/buildings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('NAV-ERROR-002: Missing authentication for route calculation', async () => {
      const start = { lat: 6.3350, lng: 5.6037 };
      const end = { lat: 6.3345, lng: 5.6042 };
      
      const response = await request(app)
        .post('/api/navigation/route')
        .send({ start, end })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('NAV-ERROR-003: Empty coordinates should be handled', async () => {
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start: {}, end: {} })
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('NAV-ERROR-004: Null coordinates should be handled', async () => {
      const response = await request(app)
        .post('/api/navigation/route')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .send({ start: null, end: null })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Building Data Integrity', () => {
    test('NAV-DATA-001: All required building fields should be present', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const buildings = response.body.buildings;
      
      buildings.forEach(building => {
        expect(building.name).toBeDefined();
        expect(building.latitude).toBeDefined();
        expect(building.longitude).toBeDefined();
        expect(building.photoURL).toBeDefined();
        expect(building.category).toBeDefined();
        expect(building.isActive).toBe(true); // All retrieved buildings should be active
      });
    });

    test('NAV-DATA-002: Building categories should be valid', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const validCategories = ['academic', 'administrative', 'facility', 'hostel', 'library', 'sports', 'dining'];
      const buildings = response.body.buildings;
      
      buildings.forEach(building => {
        expect(validCategories).toContain(building.category);
      });
    });

    test('NAV-DATA-003: Building tags should be searchable', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const csBuilding = response.body.buildings.find(b => b.name === 'Computer Science Building');
      
      expect(csBuilding).toBeDefined();
      expect(csBuilding.tags).toContain('computer science');
      expect(csBuilding.tags).toContain('programming');
      expect(csBuilding.tags).toContain('technology');
    });

    test('NAV-DATA-004: Contact information should be properly formatted', async () => {
      const response = await request(app)
        .get('/api/navigation/buildings')
        .expect(200);

      const csBuilding = response.body.buildings.find(b => b.name === 'Computer Science Building');
      
      expect(csBuilding.phone).toMatch(/^\+?[\d\s\-\(\)]+$/);
      expect(csBuilding.email).toMatch(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
    });
  });
});