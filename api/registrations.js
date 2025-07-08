const Airtable = require('airtable');

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request (test endpoint)
  if (req.method === 'GET') {
    return res.json({ 
      message: 'Registrations API is working!',
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      timestamp: new Date().toISOString()
    });
  }

  // Handle POST request (registration submission)
  if (req.method === 'POST') {
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
            'Phone Number': phoneNumber,
            'Email Address': email,
            'Message': message || '',
            'Status': 'New',
            'Submitted At': new Date().toISOString(),
          },
        },
      ]);

      console.log('New registration inquiry saved:', newRecord[0].id);
      return res.status(201).json({ 
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
      
      return res.status(500).json({ 
        message: 'Failed to submit inquiry. Please try again later.',
        error: 'Server error',
        details: error.message
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  res.status(405).json({ message: 'Method not allowed' });
};
