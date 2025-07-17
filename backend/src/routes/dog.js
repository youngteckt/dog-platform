import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Helper function to format a pet shop record
const formatPetShopRecord = (record) => ({
  _id: record.id,
  name: record.get('Name'),
  location: record.get('Location (For Pet Shop)')?.[0],
  contact: (record.get('Contact Number (For Pet Shop)') || [''])[0],
  email: record.get('Email (For Pet Shop)')?.[0],
});

// Helper function to format a puppy record
const formatPuppyRecord = (record) => {
  const photos = record.get('Photos') || [];
  const cloudName = 'ddkyuhxmd';
  const transformations = 'f_auto,q_auto,w_400,c_limit';
  const optimizedImageUrls = photos
    .filter(photo => photo && photo.url)
    .map(photo => 
      `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(photo.url)}`
    );

  return {
    _id: record.id,
    name: record.get('Name'),
    image: optimizedImageUrls.length > 0 ? optimizedImageUrls[0] : null,
    photos: optimizedImageUrls,
    breed: record.get('Breed'),
    price: Number(String(record.get('Price') || '0').replace(/[^0-9.]+/g, '')),
    dob: record.get('Date of Birth'),
    gender: record.get('Gender'),
    vaccinated: record.get('Vaccinated'),
    puppyId: record.get('Puppy ID'),
    background: record.get('Background of puppy'),
    petShop: null, // Default to null, will be linked below
  };
};

// Main endpoint to get all available puppies
router.get('/', async (req, res) => {
  console.log('[/dogs] endpoint hit. Fetching data from Airtable...');
  try {
    // 1. Fetch all puppies and pet shops in parallel
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
    console.log(`Fetched ${puppyRecords.length} puppy records and ${petShopRecords.length} pet shop records.`);

    // 2. Create a map of pet shops for easy lookup
    const petShopMap = new Map();
    petShopRecords.forEach(record => {
      petShopMap.set(record.id, formatPetShopRecord(record));
    });

    // 3. Format puppies and link their pet shops
    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      const petShopId = record.get('Pet Shop')?.[0];
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId);
      }
      return puppy;
    });

    console.log(`Successfully processed and sending ${puppies.length} puppies to the client.`);
    res.json(puppies);

  } catch (error) {
    console.error('[/dogs] Critical error fetching or processing data:', error);
    res.status(500).json({ message: 'Error fetching puppies', error: error.message });
  }
});

// Route to get a single puppy by ID
router.get('/:id', async (req, res) => {
  try {
    // 1. Fetch all puppies and pet shops in parallel
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

    // 2. Create a map of pet shops for easy lookup
    const petShopMap = new Map();
    petShopRecords.forEach(record => {
      petShopMap.set(record.id, formatPetShopRecord(record));
    });

    // 3. Format puppies and link their pet shops
    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      const petShopId = record.get('Pet Shop')?.[0];
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId);
      }
      return puppy;
    });

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