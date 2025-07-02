// /backend/src/routes/registrations.js

import express from 'express';
import Airtable from 'airtable';

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const router = express.Router();

// POST /api/registrations - Handles new pet shop registration inquiries
router.post('/', async (req, res) => {
  const { shopName, contactName, email, message } = req.body;

  // Basic validation
  if (!shopName || !contactName || !email) {
    return res.status(400).json({ message: 'Pet Shop Name, Contact Person, and Email are required.' });
  }

  try {
    // Create a new record in the "Registrations" table in Airtable
    const newRecord = await base('Registrations').create([
      {
        fields: {
          'Pet Shop Name': shopName,
          'Contact Person': contactName,
          'Email Address': email,
          'Message': message || '', // Handle optional message
          'Status': 'New', // Set default status
        },
      },
    ]);

    console.log('New registration inquiry saved:', newRecord[0].id);
    // Send a success response back to the client
    res.status(201).json({ 
      message: 'Inquiry submitted successfully!', 
      recordId: newRecord[0].id 
    });

  } catch (error) {
    console.error('Airtable API error:', error);
    res.status(500).json({ message: 'Failed to submit inquiry.', error: error.message });
  }
});

export default router;