const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireLecturerAdmin } = require('../middleware/roleAuth');

router.use(requireLecturerAdmin);

// Get courses assigned to this lecturer
router.get('/courses', async (req, res) => {
  try {
    const user = req.user;
    const courses = await Course.find({
      departments_offering: { $elemMatch: { lecturerId: user._id } }
    })
      .populate('department', 'name')
      .populate('departments_offering.department', 'name')
      .populate('departments_offering.lecturerId', 'name staffId')
      .populate('prerequisites', 'code title')
      .sort({ code: 1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
