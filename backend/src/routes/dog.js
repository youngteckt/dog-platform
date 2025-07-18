import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Helper function to format a pet shop record
const formatPetShopRecord = (record) => ({
  _id: record.id,
  name: record.get('Name'),
  // The pet shop image is in an attachment field, so we get the first one's URL.
  image: record.get('Image')?.[0]?.url,
  location: record.get('Location (For Pet Shop)')?.[0],
  contact: (record.get('Contact Number (For Pet Shop)') || [''])[0],
  email: record.get('Email (For Pet Shop)')?.[0],
});

// Helper function to format a puppy record
const formatPuppyRecord = (record) => {
  // The 'CloudinaryPhotos' field stores a comma-separated string of URLs
  const photoUrlsString = record.get('CloudinaryPhotos') || '';
  // Split the string and filter out any empty strings that might result from trailing commas.
  const photoUrls = photoUrlsString ? photoUrlsString.split(',').filter(url => url) : [];
  const transformations = 'f_auto,q_auto,w_400,c_limit';

  const transformedUrls = photoUrls.map(url => {
    const urlParts = url.split('/upload/');
    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
    }
    return url; // Return original URL if transformation fails
  });

  return {
    _id: record.id,
    name: record.get('Name'),
    // The primary image is the first one in the array
    image: transformedUrls.length > 0 ? transformedUrls[0] : null,
    // The photos array contains all images for the gallery
    photos: transformedUrls,
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
          'Name', 'Breed', 'Price', 'Date of Birth', 'Available', 'CloudinaryPhotos', 
          'Gender', 'Vaccinated', 'Age of puppy', 'Background of puppy', 'Pet Shop', 'Puppy ID'
        ]
      }).all(),
      base('Pet Shops').select({
        // Explicitly request the Image field for the pet shop.
        fields: ['Name', 'Image', 'Location (For Pet Shop)', 'Contact Number (For Pet Shop)', 'Email (For Pet Shop)']
      }).all()
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
    const puppyRecord = await base('Puppies').find(req.params.id);
    if (!puppyRecord) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    let puppy = formatPuppyRecord(puppyRecord);

    // Fetch pet shop details if linked
    const petShopId = puppyRecord.get('Pet Shop')?.[0];
    if (petShopId) {
      const petShopRecord = await base('Pet Shops').find(petShopId);
      puppy.petShop = formatPetShopRecord(petShopRecord);
    }

    res.json(puppy);
  } catch (error) {
    console.error('Error fetching single dog:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

export default router;