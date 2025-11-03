const mongoose = require('mongoose');

const FeeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const FeesCatalogSchema = new mongoose.Schema({
  // Primary keys: level + session (e.g. '100', '2025/2026')
  level: { type: String, required: true, index: true },
  session: { type: String, required: true, index: true },
  currency: { type: String, default: 'NGN' },
  effectiveFrom: { type: Date, required: true },
  items: { type: [FeeItemSchema], default: [] },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
  // Mark new catalogs so the AI can surface them as "new"
  isNew: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Find the best matching catalog for a given level+session.
FeesCatalogSchema.statics.findFor = async function ({ level, session }) {
  if (!level && !session) return null;

  // exact match first
  if (level && session) {
    const exact = await this.findOne({ level, session, isActive: true }).sort({ effectiveFrom: -1 }).lean();
    if (exact) return exact;
  }

  // level-only fallback
  if (level) {
    const levelOnly = await this.findOne({ level, isActive: true }).sort({ effectiveFrom: -1 }).lean();
    if (levelOnly) return levelOnly;
  }

  // session-only fallback
  if (session) {
    const sessionOnly = await this.findOne({ session, isActive: true }).sort({ effectiveFrom: -1 }).lean();
    if (sessionOnly) return sessionOnly;
  }

  // last resort: the most recent active catalog
  return await this.findOne({ isActive: true }).sort({ effectiveFrom: -1 }).lean();
};

module.exports = mongoose.model('FeesCatalog', FeesCatalogSchema);
