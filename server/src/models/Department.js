const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true,
    maxlength: [100, 'Faculty name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  hodName: {
    type: String,
    required: [true, 'Head of Department name is required'],
    trim: true,
    maxlength: [100, 'HOD name cannot exceed 100 characters']
  },
  hodContact: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  hodEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL starting with http:// or https://']
  },
  establishedYear: {
    type: Number,
    min: [1950, 'Established year cannot be before 1950'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  studentCount: {
    type: Number,
    min: [0, 'Student count cannot be negative']
  },
  staffCount: {
    type: Number,
    min: [0, 'Staff count cannot be negative']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  departmentalAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
departmentSchema.index({ name: 'text', faculty: 'text', description: 'text' });
departmentSchema.index({ faculty: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ building: 1 });

// Virtual for full name (department - faculty)
departmentSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.faculty}`;
});

// Virtual for contact info
departmentSchema.virtual('contactInfo').get(function() {
  return {
    hod: this.hodName,
    phone: this.phone || this.hodContact,
    email: this.email || this.hodEmail,
    location: this.location
  };
});

// Static method to find by faculty
departmentSchema.statics.findByFaculty = function(faculty) {
  return this.find({
    faculty: { $regex: faculty, $options: 'i' },
    isActive: true
  });
};

// Pre-save middleware to update updatedAt
departmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Department', departmentSchema);