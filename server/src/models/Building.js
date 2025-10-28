const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true,
    maxlength: [100, 'Building name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  faculty: {
    type: String,
    trim: true,
    maxlength: [100, 'Faculty name cannot exceed 100 characters']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  photoURL: {
    type: String,
    required: [true, 'Photo URL is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['academic', 'administrative', 'facility', 'hostel', 'library', 'sports', 'dining'],
      message: 'Category must be one of: academic, administrative, facility, hostel, library, sports, dining'
    },
    default: 'academic'
  },
  icon: {
    type: String,
    default: '🏢',
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
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
  openingHours: {
    type: String,
    trim: true,
    maxlength: [100, 'Opening hours cannot exceed 100 characters']
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
buildingSchema.index({ latitude: 1, longitude: 1 });
buildingSchema.index({ name: 'text', department: 'text', description: 'text' });
buildingSchema.index({ category: 1 });
buildingSchema.index({ faculty: 1 });
buildingSchema.index({ isActive: 1 });

// Virtual for location coordinates
buildingSchema.virtual('location').get(function() {
  return {
    lat: this.latitude,
    lng: this.longitude
  };
});

// Virtual for display name (building + department)
buildingSchema.virtual('displayName').get(function() {
  if (this.department && this.department !== this.name) {
    return `${this.name} (${this.department})`;
  }
  return this.name;
});

// Static method to find nearby buildings
buildingSchema.statics.findNearby = function(lat, lng, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Pre-save middleware to update updatedAt
buildingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Building', buildingSchema);