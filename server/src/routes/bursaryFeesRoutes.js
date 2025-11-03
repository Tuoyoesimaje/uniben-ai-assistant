const express = require('express');
const router = express.Router();
const FeesCatalog = require('../models/FeesCatalog');
const { authMiddleware } = require('../middleware/auth');
const { requireBursaryAdmin } = require('../middleware/roleAuth');

// Public: list catalogs (filter by level/session/active)
router.get('/', async (req, res) => {
  try {
    const { level, session, active } = req.query;
    const filter = {};
    if (level) filter.level = level;
    if (session) filter.session = session;
    if (typeof active !== 'undefined') filter.isActive = active === 'true';

    const catalogs = await FeesCatalog.find(filter).sort({ effectiveFrom: -1 });
    res.json({ success: true, catalogs });
  } catch (error) {
    console.error('Get fees catalogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fees catalogs' });
  }
});

// Public: find best match for level+session
router.get('/find', async (req, res) => {
  try {
    const { level, session } = req.query;
    const catalog = await FeesCatalog.findFor({ level, session });
    if (!catalog) return res.status(404).json({ success: false, message: 'No active fees catalog found' });
    res.json({ success: true, catalog });
  } catch (error) {
    console.error('Find fees catalog error:', error);
    res.status(500).json({ success: false, message: 'Failed to locate fees catalog' });
  }
});

// Public: list new catalogs (for AI to surface 'new' items)
router.get('/new', async (req, res) => {
  try {
    const newCatalogs = await FeesCatalog.find({ isNew: true, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, catalogs: newCatalogs });
  } catch (error) {
    console.error('Get new catalogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch new catalogs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const catalog = await FeesCatalog.findById(req.params.id);
    if (!catalog) return res.status(404).json({ success: false, message: 'Fees catalog not found' });
    res.json({ success: true, catalog });
  } catch (error) {
    console.error('Get fees catalog by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fees catalog' });
  }
});

// Protected admin routes
router.use(authMiddleware);

router.post('/', requireBursaryAdmin, async (req, res) => {
  try {
    const { level, session, currency = 'NGN', effectiveFrom, items = [], notes, isActive = true } = req.body;

    if (!level || !session || !effectiveFrom) {
      return res.status(400).json({ success: false, message: 'level, session and effectiveFrom are required' });
    }

    const catalog = new FeesCatalog({
      level,
      session,
      currency,
      effectiveFrom: new Date(effectiveFrom),
      items,
      notes,
      isActive,
      isNew: true,
      createdBy: req.user && req.user._id
    });

    await catalog.save();
    res.status(201).json({ success: true, catalog });
  } catch (error) {
    console.error('Create fees catalog error:', error);
    res.status(500).json({ success: false, message: 'Failed to create fees catalog' });
  }
});

router.put('/:id', requireBursaryAdmin, async (req, res) => {
  try {
    const update = req.body;
    if (update.effectiveFrom) update.effectiveFrom = new Date(update.effectiveFrom);

    const catalog = await FeesCatalog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!catalog) return res.status(404).json({ success: false, message: 'Fees catalog not found' });
    res.json({ success: true, catalog });
  } catch (error) {
    console.error('Update fees catalog error:', error);
    res.status(500).json({ success: false, message: 'Failed to update fees catalog' });
  }
});

router.delete('/:id', requireBursaryAdmin, async (req, res) => {
  try {
    const catalog = await FeesCatalog.findByIdAndDelete(req.params.id);
    if (!catalog) return res.status(404).json({ success: false, message: 'Fees catalog not found' });
    res.json({ success: true, message: 'Fees catalog deleted' });
  } catch (error) {
    console.error('Delete fees catalog error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fees catalog' });
  }
});

// Acknowledge (mark as seen) single catalog
router.patch('/:id/acknowledge', requireBursaryAdmin, async (req, res) => {
  try {
    const catalog = await FeesCatalog.findByIdAndUpdate(req.params.id, { isNew: false }, { new: true });
    if (!catalog) return res.status(404).json({ success: false, message: 'Fees catalog not found' });
    res.json({ success: true, catalog });
  } catch (error) {
    console.error('Acknowledge catalog error:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge catalog' });
  }
});

// Acknowledge multiple catalogs by IDs
router.patch('/acknowledge', requireBursaryAdmin, async (req, res) => {
  try {
    const { ids = [] } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'ids array is required' });
    const result = await FeesCatalog.updateMany({ _id: { $in: ids } }, { $set: { isNew: false } });
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Acknowledge multiple error:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge catalogs' });
  }
});

module.exports = router;
