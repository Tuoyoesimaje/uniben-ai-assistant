const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireLecturerAdmin } = require('../middleware/roleAuth');

router.use(requireLecturerAdmin);

// Get courses assigned to this lecturer
router.get('/courses', async (req, res) => {
  try {
    const user = req.user;
    const courseService = require('../services/courseService');
    const courses = await courseService.findCoursesForLecturer(user._id);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Lecturer can update syllabus, announcements, resources for their assigned offering
router.put('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check that the lecturer is assigned to at least one offering in this course
    const userOffering = course.departments_offering?.find(offering =>
      offering.lecturerId?.toString() === user._id.toString()
    );

    if (!userOffering) {
      return res.status(403).json({ success: false, message: 'You can only edit courses you are assigned to teach' });
    }

    // Allow lecturer to update syllabus, announcements, resources, and other allowed fields
    const { syllabus, announcements, resources, ...otherUpdates } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, {
      syllabus, announcements, resources, ...otherUpdates
    }, { new: true })
      .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Lecturer update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
