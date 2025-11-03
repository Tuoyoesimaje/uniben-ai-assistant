const express = require('express');
const router = express.Router();
const Fees = require('../models/Fees');
const { requireBursaryAdmin } = require('../middleware/roleAuth');

router.use(requireBursaryAdmin);

// Example: bursary-specific stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const feesStats = await Fees.getPaymentStats();
    res.json({ success: true, feesStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
