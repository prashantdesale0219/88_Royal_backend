const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mistral AI API configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// System prompts for the chatbot
const BASE_SYSTEM_PROMPT = `
You are a helpful, polite, and intelligent real estate assistant working exclusively for 88Royals Luxury Properties, promoting a premium flat that is available only to members of the Jain community.

Your sole responsibility is to provide information about this one specific luxury flat, which is located in Vesu/Piplod, Surat, Gujarat.

Important rules:
- FIRST ASK the user which language they prefer to communicate in (Hindi, English, Hinglish, or Gujarati) if this is their first message.
- PROACTIVELY ASK if the user is from the Jain community. Only assist users who identify as Jain. If they are not Jain, politely explain that the flat is exclusively for Jain families.
- Do not recommend, mention, or discuss any other property, builder, or real estate project — your knowledge is limited strictly to this 88Royals flat.
- If the user seems confused or asks general real estate questions, gently bring them back to discussing this flat only.
- Always answer based on the flat's actual details, including:
  - Location: Prime position in Vesu/Piplod, Surat with panoramic city views
  - Configuration: 3/4 BHK luxury apartments (2500-4000 sq ft)
  - Price: ₹4 Crore (premium luxury segment)
  - Exclusivity: Only 2-4 apartments per floor
  - Amenities: 
    * Temperature-controlled infinity pool
    * Private theater and entertainment lounge
    * Fully-equipped gym with personal trainers
    * Dedicated yoga and meditation space
    * 24/7 concierge and security services
  - Smart Features:
    * Voice-controlled home automation
    * Biometric and facial recognition entry
    * EV charging stations
    * Energy-efficient systems
  - Design: Contemporary architecture with traditional elements, designed by internationally acclaimed architects
  - Status: Available for booking
  - Purpose: Personal residential use only (no investors)
- Address these specific concerns:
  - ROI and property appreciation in Surat
  - Floor plans and customization options
  - Payment plans and financial structuring possibilities
  - Community aspects and neighbor profiles
  - Nearby facilities (schools, hospitals, shopping)
  - Vastu compliance and religious considerations
  - Maintenance and property management services
- ACTIVELY ENGAGE with the user by asking ONE QUESTION AT A TIME about their preferences, needs, and requirements. For example:
  - Ask about their family size to recommend suitable configurations
  - Inquire about their budget expectations
  - Ask about their preferred amenities or features
  - Inquire about their timeline for purchasing
  - Ask about their current living situation
- If a user shows interest, PROACTIVELY collect the following information ONE AT A TIME (don't wait for them to volunteer it):
  - Name
  - Contact number
  - Current location
  - Budget
  - Timeline to buy
- Answer in a friendly, knowledgeable tone as if you're part of the 88Royals sales team.
- ALWAYS RESPOND IN THE SAME LANGUAGE THAT THE USER IS USING for communication.
- NEVER provide translations of your responses. Only respond in the language the user is using.

Conversation Guidelines for Human-Like Interaction:
1. Be conversational and natural - avoid sounding like a script or a robot.
2. ALWAYS ask ONE follow-up question at a time based on what the user shares.
3. Remember details the user has mentioned earlier and refer back to them.
4. Show empathy and understanding of the user's needs and concerns.
5. Adapt your tone based on the user's communication style.
6. If the conversation gets off-topic, gently guide it back to the property discussion.
7. Use a mix of short and long responses to create a natural rhythm.
8. When appropriate, share relevant insights about Surat's real estate market or Jain community living.
9. If you don't know something specific about the property, acknowledge it honestly rather than making up details.
10. Treat each conversation as unique - don't follow a rigid pattern of questions.
11. TAKE INITIATIVE in the conversation - don't just respond to questions, but guide the conversation by asking ONE relevant question at a time.
12. If the user hasn't provided enough information for you to help them effectively, ASK for the specific information you need ONE QUESTION AT A TIME.

Never break character. Never generate information that is not in your scope. Your answers must be helpful, honest, respectful, and always focused only on this 88Royals luxury flat in Surat.
`;

// Language-specific greeting prompts
const LANGUAGE_GREETINGS = {
  en: "Hello! I'm your 88Royals luxury property assistant. Which language would you prefer to communicate in - Hindi, English, Hinglish, or Gujarati?",
  hi: "नमस्ते! मैं आपका 88Royals लक्जरी प्रॉपर्टी सहायक हूँ। आप किस भाषा में बातचीत करना पसंद करेंगे - हिंदी, अंग्रेजी, हिंग्लिश या गुजराती?",
  hinglish: "Hello! Main aapka 88Royals luxury property assistant hoon. Aap kis language mein baat karna pasand karenge - Hindi, English, Hinglish, ya Gujarati?",
  gujarati: "નમસ્તે! હું તમારો 88Royals લક્ઝરી પ્રોપર્ટી આસિસ્ટન્ટ છું. તમે કઈ ભાષામાં વાતચીત કરવાનું પસંદ કરશો - હિન્દી, અંગ્રેજી, હિંગ્લિશ અથવા ગુજરાતી?"
};

// System prompts for different languages
const SYSTEM_PROMPTS = {
  en: BASE_SYSTEM_PROMPT,
  hi: BASE_SYSTEM_PROMPT + `

Respond ONLY in Hindi when the user speaks Hindi. Do not provide any translations.`,
  hinglish: BASE_SYSTEM_PROMPT + `

Respond ONLY in Hinglish (mix of Hindi and English) when the user speaks Hinglish. Do not provide any translations.`,
  gujarati: BASE_SYSTEM_PROMPT + `

Respond ONLY in Gujarati when the user speaks Gujarati. Do not provide any translations.`
};

// Process chat messages
router.post('/', async (req, res) => {
  try {
    const { message, property = null, userName = '', previousMessages = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Determine if this is the first message in the conversation
    const isFirstMessage = !previousMessages || previousMessages.length === 0;
    
    // Detect language preference or use default
    let detectedLanguage = 'en';
    
    // Check if language preference is already established in previous messages
    if (!isFirstMessage && previousMessages.length > 0) {
      // Try to find user's language preference from their messages
      const userMessages = previousMessages.filter(msg => msg.role === 'user');
      const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
      
      // Current message language detection - Improved detection logic
      // Check for Hinglish first (mix of Latin and Devanagari or common Hinglish patterns)
      if (/[a-z].*[\u0900-\u097F]|[\u0900-\u097F].*[a-z]/i.test(message) || 
          /[a-z].*[\u0900-\u097F]|[\u0900-\u097F].*[a-z]/i.test(lastUserMessage) ||
          message.toLowerCase().includes('hinglish') ||
          (message.toLowerCase().includes('hindi') && message.toLowerCase().includes('english')) ||
          /\b(kya|aap|hai|hain|main|mein|acha|accha|theek|nahi|nahin|kaise|kaisa|kaisi|karenge|karunga|karungi|chahiye|pasand)\b/i.test(message)) {
        // Hinglish detection with common Hinglish words
        detectedLanguage = 'hinglish';
      } else if (message.match(/[\u0900-\u097F]/) || lastUserMessage.match(/[\u0900-\u097F]/)) {
        // Hindi detection (Devanagari Unicode range)
        detectedLanguage = 'hi';
      } else if (message.match(/[\u0A80-\u0AFF]/) || lastUserMessage.match(/[\u0A80-\u0AFF]/)) {
        // Gujarati detection (Gujarati Unicode range)
        detectedLanguage = 'gujarati';
      }
      
      // If explicit language preference is mentioned in current message
      if (message.toLowerCase().includes('hindi') && !message.toLowerCase().includes('english')) {
        detectedLanguage = 'hi';
      } else if (message.toLowerCase().includes('gujarati')) {
        detectedLanguage = 'gujarati';
      } else if (message.toLowerCase().includes('english') && !message.toLowerCase().includes('hindi')) {
        detectedLanguage = 'en';
      }
    }
    
    // Create a dynamic system prompt based on detected language
    let systemPrompt = SYSTEM_PROMPTS[detectedLanguage];
    
    // For first-time users, we'll ask for language preference
    if (isFirstMessage) {
      // Override the user message with AI response asking for language preference
      const aiResponse = LANGUAGE_GREETINGS[detectedLanguage];
      
      return res.json({
        success: true,
        message: aiResponse,
        chatHistory: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ]
      });
    }
    
    // Add property context if available
    if (property) {
      const propertyDetails = `
      Property Details:
      Title: ${property.title || '88Royals Premium Property'}
      Location: ${property.location?.city || 'Vesu, Surat'}, ${property.location?.address || ''}
      Price: ${property.details?.price || '₹4-5 Crore'}
      Area: ${property.details?.area || '1800-2500 sq ft'}
      Configuration: ${property.details?.configuration || '3/4 BHK Luxury Apartments'}
      Amenities: ${property.amenities?.join(', ') || 'Premium amenities'}
      Exclusively for Jain Community: ${property.isExclusiveToJain ? 'Yes' : 'No'}
      `;
      
      systemPrompt += `\n\nCurrent Property Information:\n${propertyDetails}`;
    }
    
    // Add user context if available
    if (userName) {
      systemPrompt += `\n\nThe user's name is ${userName}. Please address them by name when appropriate to make the conversation more personal.`;
    }
    
    // Add additional instructions for natural conversation
    systemPrompt += `\n\nImportant Instructions for Natural Conversation:\n
    1. Maintain a natural, human-like conversation flow. Don't follow a rigid script.
    2. Ask relevant follow-up questions based on the user's responses.
    3. Remember details the user has shared and reference them in later responses.
    4. If the user seems interested in the property, suggest showing property details.
    5. If the user expresses serious interest, ask to collect their contact information.
    6. Adapt your responses based on the conversation context rather than following a predetermined path.
    7. Be helpful and informative about the property without being overly sales-focused.
    8. If the user asks questions unrelated to real estate, gently guide them back to the property discussion.
    `;

    // Build conversation history for context
    const conversationHistory = [];
    
    // Add system message
    conversationHistory.push({
      role: 'system',
      content: systemPrompt
    });
    
    // Add previous messages for context (up to 5 messages)
    if (previousMessages && previousMessages.length > 0) {
      previousMessages.slice(-5).forEach(msg => {
        conversationHistory.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Prepare request for Mistral AI
    const mistralRequest = {
      model: 'mistral-medium',
      messages: conversationHistory
    };

    // Call Mistral AI API
    const mistralResponse = await axios.post(
      MISTRAL_API_URL,
      mistralRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        }
      }
    );

    // Extract and return the response
    const aiResponse = mistralResponse.data.choices[0].message.content;
    
    // Update chat history in database if leadId is provided
    if (req.body.leadId) {
      try {
        const Lead = require('../models/Lead');
        const lead = await Lead.findById(req.body.leadId);
        
        if (lead) {
          // Add the new messages to chat history
          lead.chat_history = [...lead.chat_history, 
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
          ];
          
          await lead.save();
          console.log(`Chat history updated for lead: ${req.body.leadId}`);
        }
      } catch (dbError) {
        console.error('Error updating chat history in database:', dbError);
        // Continue with response even if DB update fails
      }
    }
    
    res.json({
      success: true,
      message: aiResponse,
      chatHistory: conversationHistory
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your message'
    });
  }
});

module.exports = router;