const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  matricNumber: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{3}\/\d{2}\/\d{4,5}$/, 'Please enter a valid matriculation number (e.g., CSC/18/1234)']
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    match: [/^STAFF-\d{4,6}$/, 'Please enter a valid staff ID (e.g., STAFF-1234)']
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'staff'],
      message: 'Role must be either student or staff'
    },
    required: [true, 'Role is required']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
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
userSchema.index({ matricNumber: 1 });
userSchema.index({ staffId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for display ID (matricNumber or staffId)
userSchema.virtual('displayId').get(function() {
  return this.matricNumber || this.staffId;
});

// Pre-save middleware to ensure only one of matricNumber or staffId is set
userSchema.pre('save', function(next) {
  if (this.role === 'student' && !this.matricNumber) {
    return next(new Error('Matriculation number is required for students'));
  }
  if (this.role === 'staff' && !this.staffId) {
    return next(new Error('Staff ID is required for staff members'));
  }
  if (this.role === 'student' && this.staffId) {
    this.staffId = undefined;
  }
  if (this.role === 'staff' && this.matricNumber) {
    this.matricNumber = undefined;
  }
  next();
});

// Static method to find user by display ID (works for both students and staff)
userSchema.statics.findByDisplayId = function(displayId) {
  return this.findOne({
    $or: [
      { matricNumber: displayId },
      { staffId: displayId }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);