import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Helper function to fetch all records from a table with pagination
const fetchAllRecords = async (tableName, options = {}) => {
  let allRecords = [];
  try {
    const records = await base(tableName).select(options).all();
    allRecords = records.map(record => ({ id: record.id, ...record.fields }));
  } catch (err) {
    console.error(`Error fetching from ${tableName}:`, err);
  }
  return allRecords;
};

// Fetch and process data from Airtable
const getPuppies = async () => {
  try {
    // Fetch all puppies and pet shops in parallel
    const [puppyRecords, petShopRecords] = await Promise.all([
      base('Puppies').select({ 
        filterByFormula: 'Available = TRUE()',
        fields: [
          'Name', 'Breed', 'Price', 'Date of Birth', 'Available', 'Photos', 
          'Gender', 'Vaccinated', 'Age of puppy', 'Background of puppy', 'Pet Shop', 'Puppy ID'
        ]
      }).all(),
      base('Pet Shops').select({ view: 'Grid view' }).all()
    ]);

    // Create a map of pet shops for easy lookup
    const petShopMap = new Map();
    petShopRecords.forEach(record => {
      petShopMap.set(record.id, formatPetShopRecord(record));
    });

    // Format puppies and link pet shops
    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      const petShopId = record.get('Pet Shop') ? record.get('Pet Shop')[0] : null;
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId);
      } else {
        puppy.petShop = null;
      }
      return puppy;
    });

    console.log(`Fetched and processed ${puppies.length} puppies.`);
    return puppies;
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    throw error;
  }
};

// Helper function to format an Airtable record into the JSON our frontend expects
const formatPuppyRecord = (record) => {
  // --- AGGRESSIVE DEBUGGING ---
  console.log(`[DEBUG] Processing puppy ID: ${record.id}`);
  const rawPhotos = record.get('Photos');
  console.log(`[DEBUG] Raw 'Photos' field for ${record.id}:`, JSON.stringify(rawPhotos, null, 2));
  // --- END DEBUG ---

  const photos = rawPhotos || []; // Ensure 'photos' is always an array.
  // Safely parse the price string into a number
  const priceString = String(record.get('Price') || '0');
  const priceNumber = Number(priceString.replace(/[^0-9.]+/g, ''));

  // Fetch and sanitize the contact number
  const rawContact = record.get('Contact Number (For Pet Shop)');
  const sanitizedContact = (rawContact || [''])[0];

  // Construct permanent, optimized Cloudinary image URLs
  const cloudName = 'ddkyuhxmd';
  const transformations = 'f_auto,q_auto,w_400,c_limit';
  const optimizedImageUrls = photos
    .filter(photo => photo && photo.url)
    .map(photo => 
    `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(photo.url)}`
  );

  // --- AGGRESSIVE DEBUGGING ---
  console.log(`[DEBUG] Optimized URLs for ${record.id}:`, JSON.stringify(optimizedImageUrls, null, 2));
  // --- END DEBUG ---

  return {
    _id: record.id, // Use Airtable record ID as the unique ID
    name: record.get('Name'),
    breed: record.get('Breed'),
    price: priceNumber,
    age: record.get('Age of puppy'),
    gender: record.get('Gender'),
    vaccinated: record.get('Vaccinated'),
    idCode: record.get('Puppy ID'), // Add Puppy ID field
    // The frontend expects a single image URL, so we'll take the first one for list views
    image: optimizedImageUrls.length > 0 ? optimizedImageUrls[0] : null,
    // Add the full photos array for the detail page gallery
    photos: optimizedImageUrls || [],
    // The frontend expects the description field from the old schema
    description: record.get('Background of puppy') || `A lovely ${record.get('Breed')}`,
    petShop: record.get('Pet Shop') ? record.get('Pet Shop')[0] : null,
    contactNumber: sanitizedContact
  };
};

// Helper function to format a pet shop record
const formatPetShopRecord = (record) => {
  const photo = record.get('Image');
  return {
    _id: record.id,
    name: record.get('Name'),
    location: record.get('Location'),
    contact: record.get('Contact'),
    email: record.get('Email'),
    image: photo && photo.length > 0 ? photo[0].url : null
  };
};

// Route to get all puppies
router.get('/', async (req, res) => {
  try {
    const puppies = await getPuppies();
    res.json(puppies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching puppies', error: error.message });
  }
});

// Route to get a single puppy by ID
router.get('/:id', async (req, res) => {
  try {
    const puppies = await getPuppies(); // Fetch all to find the one
    const puppy = puppies.find(p => p._id === req.params.id);
    if (puppy) {
      res.json(puppy);
    } else {
      res.status(404).json({ message: 'Puppy not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching puppy', error: error.message });
  }
});

export default router;