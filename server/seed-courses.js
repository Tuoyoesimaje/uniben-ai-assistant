const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Department = require('./src/models/Department');

async function seedCourses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniben-assistant');
    console.log('Connected to MongoDB');

    // Find or create Computer Science department
    let csDepartment = await Department.findOne({ name: { $regex: /computer science/i } });
    if (!csDepartment) {
      csDepartment = await Department.create({
        name: 'Computer Science',
        code: 'CSC',
        faculty: 'Faculty of Physical Sciences',
        hodName: 'Dr. Computer Science HOD'
      });
      console.log('Created Computer Science department:', csDepartment._id);
    } else {
      console.log('Found existing Computer Science department:', csDepartment._id);
    }

    // Check existing courses
    const existingCourses = await Course.find({});
    console.log('Existing courses:', existingCourses.length);

    // Create 100-level Computer Science courses
    const courses = [
      {
        code: 'CSC101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science and programming',
        department: csDepartment._id,
        faculty: 'Faculty of Physical Sciences',
        level: 100,
        credit: 3
      },
      {
        code: 'CSC102',
        title: 'Programming Fundamentals',
        description: 'Introduction to programming using Python',
        department: csDepartment._id,
        faculty: 'Faculty of Physical Sciences',
        level: 100,
        credit: 3
      },
      {
        code: 'MATH101',
        title: 'Calculus I',
        description: 'Differential calculus for science students',
        department: csDepartment._id,
        faculty: 'Faculty of Physical Sciences',
        level: 100,
        credit: 4
      },
      {
        code: 'PHY101',
        title: 'General Physics I',
        description: 'Mechanics, waves and thermodynamics',
        department: csDepartment._id,
        faculty: 'Faculty of Physical Sciences',
        level: 100,
        credit: 4
      }
    ];

    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ code: courseData.code });
      if (!existingCourse) {
        const course = new Course(courseData);
        const savedCourse = await course.save();
        console.log('✅ Course created:', savedCourse.code, '-', savedCourse.title);
      } else {
        console.log('Course already exists:', courseData.code);
      }
    }

    console.log('\n🎉 Course seeding completed!');
    console.log('Sample 100-level Computer Science courses are now available.');

  } catch (error) {
    console.error('❌ Error seeding courses:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

seedCourses();