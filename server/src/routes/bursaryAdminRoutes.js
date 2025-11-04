const express = require('express');
const router = express.Router();
const { requireBursaryAdmin } = require('../middleware/roleAuth');

// All bursary admin routes require bursary admin role
router.use(requireBursaryAdmin);

// NOTE: Legacy per-student fees have been removed. This endpoint returns a deprecation notice.
router.get('/stats', (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Per-student financial statistics have been removed. Use /api/bursary/fees for catalog information. For migrated admin reports, see the admin guide.'
  });
});

module.exports = router;
