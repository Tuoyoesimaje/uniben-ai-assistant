// Legacy Fees model removed/stubbed.
// This module intentionally exports a stub object that throws helpful errors if used.
// The per-student Fees model has been decommissioned; use /api/bursary/fees and the FeesCatalog model instead.

const deprecationMessage = 'The per-student Fees model has been removed. Use the FeesCatalog ( /api/bursary/fees ) for catalog information. Per-student financial records are no longer available.';

const stub = {
  deprecated: true,
  _deprecatedMessage: deprecationMessage,
  getPaymentStats: async () => { throw new Error(deprecationMessage); },
  findDefaulters: async () => { throw new Error(deprecationMessage); }
};

module.exports = stub;