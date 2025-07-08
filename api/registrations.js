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
    try {
      // Test Airtable connection by trying to read from the table
      const records = await base('Registrations').select({
        maxRecords: 1
      }).firstPage();
      
      return res.json({ 
        message: 'Registrations API is working!',
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        canReadTable: true,
        recordCount: records.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.json({ 
        message: 'Registrations API is working but Airtable connection failed!',
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        canReadTable: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle POST request (registration submission)
  if (req.method === 'POST') {
    console.log('Registration POST request received');
    console.log('Request body:', req.body);
    console.log('Environment check:', {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      apiKeyLength: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.length : 0,
      baseIdLength: process.env.AIRTABLE_BASE_ID ? process.env.AIRTABLE_BASE_ID.length : 0
    });

    const { shopName, phoneNumber, email, message } = req.body;

    // Basic validation
    if (!shopName || !phoneNumber || !email) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'Pet Shop Name, Phone Number, and Email are required.' });
    }

    // Check if environment variables are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('Missing environment variables:', {
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID
      });
      return res.status(500).json({ 
        message: 'Server configuration error. Please contact support.',
        error: 'Missing environment variables'
      });
    }

    try {
      // Verify Airtable connection and table structure before creating a record
      const tableSchema = await base('Registrations').schema;
      console.log('Airtable table schema:', tableSchema);

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
