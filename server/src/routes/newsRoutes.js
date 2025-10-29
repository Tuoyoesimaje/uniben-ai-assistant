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

    const news = await News.getNewsForUser(userId, userRole, departmentId, courseIds);

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
        department: item.department ? {
          name: item.department.name
        } : null,
        course: item.course ? {
          code: item.course.code,
          title: item.course.title
        } : null,
        createdAt: item.createdAt,
        active: item.active
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
    const { title, content, audience, department, course } = req.body;
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
        // Only system admin and bursary admin can post to all students/staff
        if (!['system_admin', 'bursary_admin'].includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Only system admin and bursary admin can post to all students/staff'
          });
        }
        break;

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
        // Lecturer admin can post to their courses
        if (user.role === 'lecturer_admin') {
          if (!course || !user.courses?.includes(course)) {
            return res.status(403).json({
              success: false,
              message: 'You can only post to your assigned courses'
            });
          }
        } else if (!['system_admin', 'departmental_admin'].includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to post course news'
          });
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
      course: audience === 'course_specific' ? course : undefined
    });

    await news.save();
    await news.populate(['authorId', 'department', 'course']);

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
        course: news.course ? { code: news.course.code, title: news.course.title } : null,
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

    const { title, content, active } = req.body;
    news.title = title || news.title;
    news.content = content || news.content;
    news.active = active !== undefined ? active : news.active;

    await news.save();
    await news.populate(['authorId', 'department', 'course']);

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
        course: news.course ? { code: news.course.code, title: news.course.title } : null,
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
        // Can see course news and their own posts
        query = {
          $or: [
            { authorId: user._id },
            { audience: 'course_specific', course: { $in: user.courses || [] } }
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