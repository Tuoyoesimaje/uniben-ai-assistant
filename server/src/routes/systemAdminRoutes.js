const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department');
const { requireSystemAdmin } = require('../middleware/roleAuth');

// User Management Routes (System Admin only for full access)
router.get('/users', requireSystemAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.post('/users', requireSystemAdmin, async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email, department, courses } = req.body;

    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({ success: false, message: 'Name and role are required' });
    }

    // Validate admin roles can only be assigned by system admin
    const adminRoles = ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'];
    if (adminRoles.includes(role) && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, message: 'Only system admin can create admin accounts' });
    }

    // Validate role-specific requirements
    if (role === 'student' && !matricNumber) {
      return res.status(400).json({ success: false, message: 'Matriculation number is required for students' });
    }
    if ((role === 'staff' || adminRoles.includes(role)) && !staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for staff members and admins' });
    }

    // Check for existing user
    if (role === 'student' && matricNumber) {
      const existing = await User.findOne({ matricNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Matric number already exists' });
      }
    }

    if ((role === 'staff' || adminRoles.includes(role)) && staffId) {
      const existing = await User.findOne({ staffId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Staff ID already exists' });
      }
    }

    const user = new User({ name, matricNumber, staffId, role, email, department, courses });
    await user.save();
    await user.populate('department', 'name');

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.put('/users/:id', requireSystemAdmin, async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email, department, courses } = req.body;

    // Prevent changing system admin role unless current user is system admin
    if (role === 'system_admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify system admin role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, matricNumber, staffId, role, email, department, courses },
      { new: true }
    ).populate('department', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', requireSystemAdmin, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting system admin accounts
    if (userToDelete.role === 'system_admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete system admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Department Management Routes (System Admin only)
router.get('/departments', requireSystemAdmin, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('departmentalAdmin', 'name staffId')
      .sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/departments', requireSystemAdmin, async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    await department.populate('departmentalAdmin', 'name staffId');
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/departments/:id', requireSystemAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('departmentalAdmin', 'name staffId');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/departments/:id', requireSystemAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
