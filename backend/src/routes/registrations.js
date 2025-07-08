// /backend/src/routes/registrations.js

import express from 'express';
import Airtable from 'airtable';

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const router = express.Router();

// Test endpoint for registrations
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Registrations API is working!',
    hasApiKey: !!process.env.AIRTABLE_API_KEY,
    hasBaseId: !!process.env.AIRTABLE_BASE_ID,
    timestamp: new Date().toISOString()
  });
});

// POST /api/registrations - Handles new pet shop registration inquiries
router.post('/', async (req, res) => {
  console.log('Registration POST request received');
  console.log('Request body:', req.body);
  console.log('Environment check:', {
    hasApiKey: !!process.env.AIRTABLE_API_KEY,
    hasBaseId: !!process.env.AIRTABLE_BASE_ID
  });

  const { shopName, phoneNumber, email, message } = req.body;

  // Basic validation
  if (!shopName || !phoneNumber || !email) {
    console.log('Validation failed - missing required fields');
    return res.status(400).json({ message: 'Pet Shop Name, Phone Number, and Email are required.' });
  }

  try {
    console.log('Attempting to create registration record:', { shopName, phoneNumber, email });
    
    // Create a new record in the "Registrations" table in Airtable
    const newRecord = await base('Registrations').create([
      {
        fields: {
          'Pet Shop Name': shopName,
          'Phone number': phoneNumber,
          'Email Address': email,
          'Message': message || '',
          'Status': 'New', // Single select field with options: New, Contacted, Approved
          'Submitted At': new Date().toISOString(),
        },
      },
    ]);

    console.log('New registration inquiry saved:', newRecord[0].id);
    res.status(201).json({ 
      message: 'Inquiry submitted successfully! Our team will contact you soon.',
      recordId: newRecord[0].id 
    });

  } catch (error) {
    console.error('Airtable API error details:', {
      message: error.message,
      status: error.statusCode,
      error: error.error,
      details: error
    });
    
    // Provide more specific error messages
    if (error.message && error.message.includes('INVALID_REQUEST_MISSING_FIELDS')) {
      return res.status(400).json({ 
        message: 'Missing required fields in Airtable. Please check the table structure.',
        error: 'Missing required fields'
      });
    }
    
    if (error.message && error.message.includes('NOT_FOUND')) {
      return res.status(500).json({ 
        message: 'Airtable base or table not found. Please check configuration.',
        error: 'Configuration error'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to submit inquiry. Please try again later.',
      error: 'Server error',
      details: error.message
    });
  }
});

export default router;