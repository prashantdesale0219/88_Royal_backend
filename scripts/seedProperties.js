const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('../models/Property');

// Sample property data
const properties = [
  {
    title: '88Royals Premium Luxury Flat',
    location: {
      city: 'Surat, Gujarat',
      area: 'Vesu',
      address: '88Royals Luxury Apartments, Vesu Main Road, Surat'
    },
    details: {
      configuration: '5 BHK Luxury Apartments',
      area: '2500-4000 sq ft',
      price: 'Starting from ₹4 Crore',
      availability: 'Ready to move in'
    },
    amenities: [
      'Temperature-controlled infinity pool',
      'Private theater and entertainment lounge',
      'Fully-equipped gym with personal trainers',
      'Dedicated yoga and meditation space',
      '24/7 concierge and security services',
      'Smart Home Automation',
      'Panoramic City View',
      'Covered Parking',
      'Power Backup',
      'Elevator'
    ],
    specialFeatures: [
      'Exclusively for Jain Community',
      'Near Jain Temple',
      'Pure Vegetarian Complex',
      'Vastu compliant design',
      'Biometric and facial recognition entry',
      'EV charging stations',
      'Energy-efficient systems'
    ],
    description: {
      en: 'Premium luxury flat located in the heart of Vesu, Surat. This exclusive property is designed for the discerning Jain community members who appreciate luxury living with traditional values.',
      hi: 'वेसु, सूरत के केंद्र में स्थित प्रीमियम लक्जरी फ्लैट। यह विशेष संपत्ति उन विवेकशील जैन समुदाय के सदस्यों के लिए डिज़ाइन की गई है जो पारंपरिक मूल्यों के साथ लक्जरी जीवन की सराहना करते हैं।'
    },
    isActive: true,
    isExclusiveToJain: true
  },
  {
    title: '88Royals Elite Penthouse',
    location: {
      city: 'Surat, Gujarat',
      area: 'Vesu',
      address: '88Royals Elite Tower, Vesu Main Road, Surat'
    },
    details: {
      configuration: 'Luxury Penthouse',
      area: '5000-6000 sq ft',
      price: '₹8 Crore onwards',
      availability: 'Limited units available'
    },
    amenities: [
      'Private rooftop garden',
      'Infinity pool with city view',
      'Smart home automation',
      'Private elevator access',
      'Home theater system',
      'Fully equipped modern kitchen',
      '24/7 security and concierge',
      'Reserved parking spaces',
      'Power backup',
      'High-speed internet connectivity'
    ],
    specialFeatures: [
      'Exclusively for Jain Community',
      'Customizable interior design',
      'Pure vegetarian complex',
      'Vastu compliant architecture',
      'Solar power integration',
      'Rainwater harvesting',
      'Soundproof walls'
    ],
    description: {
      en: 'Experience unparalleled luxury with our elite penthouses designed exclusively for the Jain community. These penthouses offer panoramic views of Surat city with world-class amenities and privacy.',
      hi: 'हमारे विशेष रूप से जैन समुदाय के लिए डिज़ाइन किए गए एलीट पेंटहाउस के साथ अद्वितीय लक्जरी का अनुभव करें। ये पेंटहाउस विश्व स्तरीय सुविधाओं और गोपनीयता के साथ सूरत शहर के पैनोरमिक दृश्य प्रदान करते हैं।'
    },
    isActive: true,
    isExclusiveToJain: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  
  try {
    // Clear existing properties
    await Property.deleteMany({});
    console.log('Existing properties cleared');
    
    // Insert new properties
    const result = await Property.insertMany(properties);
    console.log(`${result.length} properties seeded successfully`);
    
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error seeding properties:', error);
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});