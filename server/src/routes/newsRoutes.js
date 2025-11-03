const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { authMiddleware } = require('../middleware/auth');
const {
  requireSystemAdmin,
  requireBursaryAdmin,
  requireDepartmentalAdmin,
  requireLecturerAdmin,
  filterDataByRole
} = require('../middleware/roleAuth');

// Apply authentication to all routes
router.use(authMiddleware);

// Get news for current user (filtered by role)
router.get('/', filterDataByRole('news'), async (req, res) => {
  try {
    const { userRole, userId, departmentId, courseIds } = req.filterOptions;

    // Pass user tags for tag-based filtering
    const userTags = req.user?.tags || [];
    const news = await News.getNewsForUser(userId, userRole, departmentId, courseIds, userTags);

    res.json({
      success: true,
      news: news.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content,
        author: item.authorId ? {
          name: item.authorId.name,
          role: item.authorId.role
        } : null,
        audience: item.audience,
        department: item.department ? { name: item.department.name } : null,
        courses: item.courses ? item.courses.map(c => ({ code: c.code, title: c.title })) : [],
        priority: item.priority,
        expiresAt: item.expiresAt,
        attachments: item.attachments,
        createdAt: item.createdAt,
        active: item.active,
        tags: item.tags || []
      }))
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

// Create news (role-based permissions)
router.post('/', async (req, res) => {
  try {
  const { title, content, audience, department, course, tags } = req.body;
    const user = req.user;

    // Validate permissions based on audience type
    switch (audience) {
      case 'everyone':
        // Only system admin and bursary admin can post to everyone
        if (!['system_admin', 'bursary_admin'].includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Only system admin and bursary admin can post university-wide news'
          });
        }
        break;

      case 'students_only':
      case 'staff_only':
        // system/bursary can post to everyone; departmental_admins can post to their department's students/staff
        if (['system_admin', 'bursary_admin'].includes(user.role)) {
          break;
        }
        if (user.role === 'departmental_admin') {
          // department must be either provided and match user's department or default to user's department
          if (department && department !== user.department?.toString()) {
            return res.status(403).json({ success: false, message: 'You can only post to your assigned department' });
          }
          break;
        }
        return res.status(403).json({ success: false, message: 'Only system, bursary or departmental admins can post to students or staff' });

      case 'department_specific':
        // Departmental admin can post to their department
        if (user.role === 'departmental_admin') {
          if (!department || department !== user.department?.toString()) {
            return res.status(403).json({
              success: false,
              message: 'You can only post to your assigned department'
            });
          }
        } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to post department news'
          });
        }
        break;

      case 'course_specific':
        // Lecturer admin can post to their assigned courses (one or many). System and departmental admins can post to courses too.
        if (user.role === 'lecturer_admin') {
          const Course = require('../models/Course');
          const courseIds = Array.isArray(course) ? course : [course];
          const assigned = await Course.find({ _id: { $in: courseIds }, 'departments_offering.lecturerId': user._id }).select('_id');
          if (!assigned || assigned.length !== courseIds.length) {
            return res.status(403).json({ success: false, message: 'You can only post to courses you are assigned to' });
          }
        } else if (!['system_admin', 'departmental_admin', 'bursary_admin'].includes(user.role)) {
          return res.status(403).json({ success: false, message: 'Insufficient permissions to post course news' });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid audience type'
        });
    }

    const news = new News({
      title,
      content,
      authorId: user._id,
      audience,
      department: audience === 'department_specific' ? department : undefined,
      courses: audience === 'course_specific' ? (Array.isArray(course) ? course : [course]) : undefined,
      tags: Array.isArray(tags) ? tags.map(t => String(t).toLowerCase().trim()) : (typeof tags === 'string' ? tags.split(',').map(t => t.toLowerCase().trim()) : []),
      priority: req.body.priority || 'medium',
      expiresAt: req.body.expiresAt,
      attachments: req.body.attachments || []
    });

  await news.save();
  await news.populate(['authorId', 'department', 'courses']);

    res.status(201).json({
      success: true,
      news: {
        id: news._id,
        title: news.title,
        content: news.content,
        author: {
          name: news.authorId.name,
          role: news.authorId.role
        },
        audience: news.audience,
  department: news.department ? { name: news.department.name } : null,
  courses: news.courses ? news.courses.map(c => ({ code: c.code, title: c.title })) : [],
  tags: news.tags || [],
        priority: news.priority,
        expiresAt: news.expiresAt,
        attachments: news.attachments,
        createdAt: news.createdAt,
        active: news.active
      }
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create news'
    });
  }
});

// Update news (only author or higher admin can update)
router.put('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const user = req.user;

    // Check permissions
    const canEdit = (
      news.authorId.toString() === user._id.toString() || // Author can edit
      user.role === 'system_admin' || // System admin can edit all
      (user.role === 'departmental_admin' && news.audience === 'department_specific' && news.department?.toString() === user.department?.toString()) || // Department admin can edit department news
      (user.role === 'bursary_admin' && ['everyone', 'students_only', 'staff_only'].includes(news.audience)) // Bursary admin can edit general news
    );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this news'
      });
    }

    const { title, content, active, priority, expiresAt } = req.body;
    news.title = title || news.title;
    news.content = content || news.content;
    news.active = active !== undefined ? active : news.active;
    news.priority = priority || news.priority;
    news.expiresAt = expiresAt || news.expiresAt;

  await news.save();
  await news.populate(['authorId', 'department', 'courses']);

    res.json({
      success: true,
      news: {
        id: news._id,
        title: news.title,
        content: news.content,
        author: {
          name: news.authorId.name,
          role: news.authorId.role
        },
        audience: news.audience,
  department: news.department ? { name: news.department.name } : null,
  courses: news.courses ? news.courses.map(c => ({ code: c.code, title: c.title })) : [],
  tags: news.tags || [],
        priority: news.priority,
        expiresAt: news.expiresAt,
        attachments: news.attachments,
        createdAt: news.createdAt,
        active: news.active
      }
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news'
    });
  }
});

// Delete news (only author or higher admin can delete)
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const user = req.user;

    // Check permissions (same as update)
    const canDelete = (
      news.authorId.toString() === user._id.toString() ||
      user.role === 'system_admin' ||
      (user.role === 'departmental_admin' && news.audience === 'department_specific' && news.department?.toString() === user.department?.toString()) ||
      (user.role === 'bursary_admin' && ['everyone', 'students_only', 'staff_only'].includes(news.audience))
    );

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this news'
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news'
    });
  }
});

// Get all news for admin management (role-based)
router.get('/admin/all', async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // Filter based on role
    switch (user.role) {
      case 'system_admin':
        // Can see all news
        break;
      case 'bursary_admin':
        // Can see general news and their own posts
        query = {
          $or: [
            { authorId: user._id },
            { audience: { $in: ['everyone', 'students_only', 'staff_only'] } }
          ]
        };
        break;
      case 'departmental_admin':
        // Can see department news and their own posts
        query = {
          $or: [
            { authorId: user._id },
            { audience: 'department_specific', department: user.department }
          ]
        };
        break;
      case 'lecturer_admin':
        // Can see course news for their assigned courses and their own posts
        const Course = require('../models/Course');
        const assignedCourses = await Course.find({ 'departments_offering.lecturerId': user._id }).select('_id');
        const courseIds = assignedCourses.map(c => c._id);

        query = {
          $or: [
            { authorId: user._id },
            { audience: 'course_specific', courses: { $in: courseIds } }
          ]
        };
        break;
      default:
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
    }

    const news = await News.find(query)
      .populate('authorId', 'name role')
      .populate('department', 'name')
      .populate('course', 'code title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      news: news.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content,
        author: {
          name: item.authorId.name,
          role: item.authorId.role
        },
        audience: item.audience,
        department: item.department ? { name: item.department.name } : null,
        course: item.course ? { code: item.course.code, title: item.course.title } : null,
        priority: item.priority,
        expiresAt: item.expiresAt,
        attachments: item.attachments,
        createdAt: item.createdAt,
        active: item.active
      }))
    });
  } catch (error) {
    console.error('Get admin news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

module.exports = router;