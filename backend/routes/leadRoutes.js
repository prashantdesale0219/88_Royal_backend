const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// POST /api/leads - Save a new lead
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      location, 
      budget, 
      timeline, 
      isJain, 
      interestedIn, 
      preferredFloor, 
      vastuPreference, 
      chat_history,
      preferredLanguage 
    } = req.body;
    
    // Validate required fields
    if (!name || !phone || !location || !budget || !timeline) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, phone, location, budget, timeline'
      });
    }

    // Create new lead
    const lead = new Lead({
      name,
      phone,
      location,
      budget,
      timeline,
      isJain: isJain !== undefined ? isJain : true,
      interestedIn: interestedIn || 'Both',
      preferredFloor: preferredFloor || '',
      vastuPreference: vastuPreference !== undefined ? vastuPreference : true,
      chat_history: chat_history || [],
      preferredLanguage: req.body.preferredLanguage || 'en'
    });

    // Save to database
    await lead.save();

    return res.status(201).json({
      success: true,
      message: 'Lead saved successfully',
      data: lead
    });

  } catch (error) {
    console.error('Lead API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving lead',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/leads - Get all leads (admin access)
router.get('/', async (req, res) => {
  try {
    // In a production environment, this should be protected with authentication
    const leads = await Lead.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });

  } catch (error) {
    console.error('Lead API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving leads',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/leads/:id/chat - Update chat history for a lead
router.put('/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { chat_history } = req.body;
    
    if (!chat_history) {
      return res.status(400).json({
        success: false,
        message: 'Chat history is required'
      });
    }

    // Find lead and update chat history
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Update chat history
    lead.chat_history = chat_history;
    await lead.save();
    
    return res.status(200).json({
      success: true,
      message: 'Chat history updated successfully',
      data: lead
    });

  } catch (error) {
    console.error('Lead API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;