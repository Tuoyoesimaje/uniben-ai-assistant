const express = require('express');
const router = express.Router();
const Fees = require('../models/Fees');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const {
  requireBursaryAdmin,
  requireOwnFinancialData,
  filterDataByRole
} = require('../middleware/roleAuth');

// Apply authentication to all routes
router.use(authMiddleware);

// Get financial info for a student (filtered by permissions)
router.get('/student/:studentId', requireOwnFinancialData, async (req, res) => {
  try {
    const { studentId } = req.params;

    const fees = await Fees.findOne({ studentId })
      .populate('studentId', 'name matricNumber department')
      .populate('paymentHistory.recordedBy', 'name role');

    if (!fees) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found for this student'
      });
    }

    res.json({
      success: true,
      fees: {
        id: fees._id,
        student: {
          id: fees.studentId._id,
          name: fees.studentId.name,
          matricNumber: fees.studentId.matricNumber,
          department: fees.studentId.department
        },
        totalFees: fees.totalFees,
        amountPaid: fees.amountPaid,
        balance: fees.balance,
        paymentStatus: fees.paymentStatus,
        paymentHistory: fees.paymentHistory.map(payment => ({
          date: payment.date,
          amount: payment.amount,
          description: payment.description,
          paymentMethod: payment.paymentMethod,
          recordedBy: payment.recordedBy ? {
            name: payment.recordedBy.name,
            role: payment.recordedBy.role
          } : null
        })),
        semester: fees.semester,
        session: fees.session,
        lastUpdated: fees.lastUpdated
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial information'
    });
  }
});

// Create or update fees record (bursary admin only)
router.post('/', requireBursaryAdmin, async (req, res) => {
  try {
    const { studentId, totalFees, semester, session, amountPaid = 0 } = req.body;

    // Validate student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    // Check if record already exists
    let fees = await Fees.findOne({ studentId });

    if (fees) {
      // Update existing record
      fees.totalFees = totalFees;
      fees.amountPaid = amountPaid;
      fees.semester = semester;
      fees.session = session;
    } else {
      // Create new record
      fees = new Fees({
        studentId,
        totalFees,
        amountPaid,
        semester,
        session
      });
    }

    await fees.save();
    await fees.populate('studentId', 'name matricNumber department');

    res.status(201).json({
      success: true,
      fees: {
        id: fees._id,
        student: {
          id: fees.studentId._id,
          name: fees.studentId.name,
          matricNumber: fees.studentId.matricNumber,
          department: fees.studentId.department
        },
        totalFees: fees.totalFees,
        amountPaid: fees.amountPaid,
        balance: fees.balance,
        paymentStatus: fees.paymentStatus,
        semester: fees.semester,
        session: fees.session,
        lastUpdated: fees.lastUpdated
      }
    });
  } catch (error) {
    console.error('Create/update fees error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save fees record'
    });
  }
});

// Record a payment (bursary admin only)
router.post('/:feesId/payment', requireBursaryAdmin, async (req, res) => {
  try {
    const { feesId } = req.params;
    const { amount, description, paymentMethod } = req.body;

    const fees = await Fees.findById(feesId);
    if (!fees) {
      return res.status(404).json({
        success: false,
        message: 'Fees record not found'
      });
    }

    // Validate payment amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0'
      });
    }

    if (fees.amountPaid + amount > fees.totalFees) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance'
      });
    }

    // Add payment to history
    fees.paymentHistory.push({
      amount,
      description: description || `Payment of ₦${amount.toLocaleString()}`,
      paymentMethod: paymentMethod || 'online',
      recordedBy: req.user._id
    });

    fees.amountPaid += amount;
    await fees.save();
    await fees.populate('paymentHistory.recordedBy', 'name role');

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      fees: {
        id: fees._id,
        totalFees: fees.totalFees,
        amountPaid: fees.amountPaid,
        balance: fees.balance,
        paymentStatus: fees.paymentStatus,
        lastUpdated: fees.lastUpdated,
        latestPayment: fees.paymentHistory[fees.paymentHistory.length - 1]
      }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
});

// Get payment statistics (bursary admin only)
router.get('/stats/summary', requireBursaryAdmin, async (req, res) => {
  try {
    const { session, semester } = req.query;

    const stats = await Fees.getPaymentStats(session, semester);

    res.json({
      success: true,
      stats: stats.length > 0 ? stats[0] : {
        totalStudents: 0,
        totalFees: 0,
        totalPaid: 0,
        totalBalance: 0,
        fullyPaid: 0,
        partialPaid: 0,
        unpaid: 0
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
});

// Get defaulters list (bursary admin only)
router.get('/defaulters', requireBursaryAdmin, async (req, res) => {
  try {
    const { threshold = 0 } = req.query;

    const defaulters = await Fees.findDefaulters(parseFloat(threshold));

    res.json({
      success: true,
      defaulters: defaulters.map(fees => ({
        student: {
          id: fees.studentId._id,
          name: fees.studentId.name,
          matricNumber: fees.studentId.matricNumber,
          department: fees.studentId.department
        },
        totalFees: fees.totalFees,
        amountPaid: fees.amountPaid,
        balance: fees.balance,
        semester: fees.semester,
        session: fees.session,
        lastUpdated: fees.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Get defaulters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch defaulters list'
    });
  }
});

// Bulk update fees (bursary admin only)
router.post('/bulk', requireBursaryAdmin, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { studentId, totalFees, semester, session }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { studentId, totalFees, semester, session } = update;

        let fees = await Fees.findOne({ studentId });

        if (fees) {
          fees.totalFees = totalFees;
          fees.semester = semester;
          fees.session = session;
        } else {
          fees = new Fees({
            studentId,
            totalFees,
            semester,
            session
          });
        }

        await fees.save();
        results.push({
          studentId,
          success: true,
          totalFees: fees.totalFees,
          balance: fees.balance
        });
      } catch (error) {
        errors.push({
          studentId: update.studentId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} updates with ${errors.length} errors`,
      results,
      errors
    });
  } catch (error) {
    console.error('Bulk update fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk updates'
    });
  }
});

module.exports = router;