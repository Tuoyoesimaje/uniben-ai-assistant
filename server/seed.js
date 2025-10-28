const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seedUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniben-assistant');
    console.log('Connected to MongoDB');

    // Check existing users
    const existingUsers = await User.find({});
    console.log('Existing users:', existingUsers.length);

    // Create staff user
    const staffUser = new User({
      name: 'Dr. Admin User',
      staffId: 'STAFF-1234',
      role: 'staff',
      email: 'admin@uniben.edu.ng'
    });
    const savedStaff = await staffUser.save();
    console.log('✅ Staff user created:', savedStaff.displayId, 'ID:', savedStaff._id);

    // Create student user
    const studentUser = new User({
      name: 'John Student',
      matricNumber: 'CSC/22/1234',
      role: 'student',
      email: 'john.student@uniben.edu.ng'
    });
    const savedStudent = await studentUser.save();
    console.log('✅ Student user created:', savedStudent.displayId, 'ID:', savedStudent._id);

    console.log('\n🎉 Users created successfully!');
    console.log('Staff ID: STAFF-1234');
    console.log('Student ID: CSC/22/1234');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

seedUsers();