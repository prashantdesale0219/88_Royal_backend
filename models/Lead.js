const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  location: {
    type: String,
    required: [true, 'Current location is required']
  },
  budget: {
    type: String,
    required: [true, 'Budget is required']
  },
  timeline: {
    type: String,
    required: [true, 'Timeline to buy is required']
  },
  isJain: {
    type: Boolean,
    default: true,
    required: [true, 'Jain community verification is required']
  },
  interestedIn: {
    type: String,
    enum: ['3BHK', '4BHK', 'Both'],
    default: 'Both'
  },
  preferredFloor: {
    type: String,
    default: ''
  },
  vastuPreference: {
    type: Boolean,
    default: true
  },
  chat_history: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', LeadSchema);