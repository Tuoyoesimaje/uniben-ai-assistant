const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireDepartmentalAdmin } = require('../middleware/roleAuth');

// All routes here require departmental admin
router.use(requireDepartmentalAdmin);

// Get courses offered by this department (including borrowed)
router.get('/courses', async (req, res) => {
  try {
    const user = req.user;
    const courses = await Course.find({
      $or: [
        { department: user.department },
        { 'departments_offering.department': user.department }
      ]
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

// Add or update department offering on an existing base course
router.put('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { departments_offering, ...otherUpdates } = req.body;

    if (departments_offering) {
      // Default department to user's department if omitted
      const normalizedOfferings = (departments_offering || []).map(off => ({ ...off, department: off.department || user.department }));

      // Ensure offerings are for this department
      const invalidOfferings = normalizedOfferings.filter(offering =>
        (offering.department?.toString ? offering.department.toString() : String(offering.department)) !== (user.department?.toString ? user.department.toString() : String(user.department))
      );

      if (invalidOfferings.length > 0) {
        return res.status(403).json({ success: false, message: 'You can only manage offerings for your department' });
      }

      const updatedOfferings = [...(course.departments_offering || [])];

      normalizedOfferings.forEach(newOffering => {
        const newDept = newOffering.department?.toString ? newOffering.department.toString() : String(newOffering.department);
        if (newDept === (user.department?.toString ? user.department.toString() : String(user.department))) {
          if (!newOffering.assignedBy) newOffering.assignedBy = req.user._id;
          if (!newOffering.offeredAt) newOffering.offeredAt = new Date();
          if (newOffering.isActive === undefined) newOffering.isActive = true;
        }

        const existingIndex = updatedOfferings.findIndex(offering =>
          (offering.department?.toString ? offering.department.toString() : String(offering.department)) === newDept && offering.level === newOffering.level
        );

        if (existingIndex >= 0) {
          updatedOfferings[existingIndex] = { ...updatedOfferings[existingIndex].toObject?.() || updatedOfferings[existingIndex], ...newOffering };
          if (!updatedOfferings[existingIndex].assignedBy) updatedOfferings[existingIndex].assignedBy = req.user._id;
          if (!updatedOfferings[existingIndex].offeredAt) updatedOfferings[existingIndex].offeredAt = new Date();
        } else {
          updatedOfferings.push(newOffering);
        }
      });

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { departments_offering: updatedOfferings, ...otherUpdates },
        { new: true }
      ).populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);

      return res.json({ success: true, course: updatedCourse });
    }

    // If no departments_offering, perform regular update (not department-specific)
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

// Delete a course (departmental admin can only delete courses owned by their department)
router.delete('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only allow deletion if the base course belongs to this department
    if (course.department.toString() !== (user.department?.toString ? user.department.toString() : String(user.department))) {
      return res.status(403).json({ success: false, message: 'You can only delete courses in your department' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

