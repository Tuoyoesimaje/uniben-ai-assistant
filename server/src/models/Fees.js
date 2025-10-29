const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    unique: true
  },
  totalFees: {
    type: Number,
    required: [true, 'Total fees amount is required'],
    min: [0, 'Total fees cannot be negative']
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  balance: {
    type: Number,
    default: function() {
      return this.totalFees - this.amountPaid;
    },
    min: [0, 'Balance cannot be negative']
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'online', 'check', 'other'],
      default: 'online'
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['first', 'second'],
      message: 'Semester must be either first or second'
    }
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    match: [/^\d{4}\/\d{4}$/, 'Session must be in format YYYY/YYYY (e.g., 2023/2024)']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
feesSchema.index({ studentId: 1 }, { unique: true });
feesSchema.index({ semester: 1 });
feesSchema.index({ session: 1 });
feesSchema.index({ balance: 1 });
feesSchema.index({ lastUpdated: -1 });

// Virtual for payment status
feesSchema.virtual('paymentStatus').get(function() {
  const percentage = (this.amountPaid / this.totalFees) * 100;

  if (percentage === 0) return 'unpaid';
  if (percentage < 100) return 'partial';
  return 'paid';
});

// Virtual for student info
feesSchema.virtual('studentInfo', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Static method to find defaulters
feesSchema.statics.findDefaulters = function(threshold = 0) {
  return this.find({
    balance: { $gt: threshold }
  })
  .populate('studentId', 'name matricNumber department')
  .sort({ balance: -1 });
};

// Static method to get payment statistics
feesSchema.statics.getPaymentStats = function(session = null, semester = null) {
  const matchConditions = {};
  if (session) matchConditions.session = session;
  if (semester) matchConditions.semester = semester;

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        totalFees: { $sum: '$totalFees' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        fullyPaid: {
          $sum: {
            $cond: [{ $eq: ['$balance', 0] }, 1, 0]
          }
        },
        partialPaid: {
          $sum: {
            $cond: [
              { $and: [{ $gt: ['$amountPaid', 0] }, { $gt: ['$balance', 0] }] },
              1, 0
            ]
          }
        },
        unpaid: {
          $sum: {
            $cond: [{ $eq: ['$amountPaid', 0] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to update balance and timestamps
feesSchema.pre('save', function(next) {
  this.balance = this.totalFees - this.amountPaid;
  this.lastUpdated = new Date();
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to validate balance
feesSchema.pre('save', function(next) {
  if (this.amountPaid > this.totalFees) {
    return next(new Error('Amount paid cannot exceed total fees'));
  }
  next();
});

module.exports = mongoose.model('Fees', feesSchema);