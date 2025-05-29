const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required']
    },
    area: {
      type: String,
      required: [true, 'Area is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  details: {
    configuration: {
      type: String,
      required: [true, 'Configuration is required']
    },
    area: {
      type: String,
      required: [true, 'Area is required']
    },
    price: {
      type: String,
      required: [true, 'Price is required']
    },
    availability: {
      type: String,
      required: [true, 'Availability status is required']
    }
  },
  amenities: {
    type: [String],
    required: [true, 'Amenities are required']
  },
  specialFeatures: {
    type: [String],
    default: []
  },
  description: {
    en: {
      type: String,
      required: [true, 'English description is required']
    },
    hi: {
      type: String,
      required: [true, 'Hindi description is required']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isExclusiveToJain: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema);