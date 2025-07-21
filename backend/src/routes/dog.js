import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// In-memory cache for puppies
const puppyCache = {
  data: null,
  timestamp: null,
  duration: 5 * 60 * 1000, // 5 minutes
};

// Final, robust helper function to format a pet shop record
const formatPetShopRecord = (record) => {
  return {
    _id: record.id,
    name: record.get('Name') || 'N/A',
    image: record.get('Image')?.[0]?.url || null,
    location: record.get('Location (For Pet Shop)')?.[0] || 'N/A',
    contact: (record.get('Contact Number (For Pet Shop)') || ['N/A'])[0],
    email: record.get('Email (For Pet Shop)')?.[0] || 'N/A',
  };
};

// Final, robust helper function to format a puppy record, now with all fields
const formatPuppyRecord = (record) => {
  const photoUrlsString = record.get('CloudinaryPhotos') || '';
  const photoUrls = photoUrlsString ? photoUrlsString.split(',').filter(url => url.trim() !== '') : [];
  const transformations = 'f_auto,q_auto,w_400,c_limit';

  const transformedUrls = photoUrls.map(url => {
    const urlParts = url.split('/upload/');
    return urlParts.length === 2
      ? `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`
      : url;
  });

  return {
    _id: record.id,
    name: record.get('Name') || 'Unnamed Puppy',
    image: transformedUrls[0] || null,
    photos: transformedUrls,
    breed: record.get('Breed') || 'Unknown Breed',
    price: Number(String(record.get('Price') || '0').replace(/[^0-9.]+/g, '')),
    dob: record.get('Date of Birth') || null,
    gender: record.get('Gender') || 'N/A',
    vaccinated: record.get('Vaccinated') || false,
    background: record.get('Background of puppy') || 'No background available.',
    petShop: null, // Linked later
  };
};

// Main endpoint to get all puppies, now with caching
router.get('/', async (req, res) => {
  // Check if we have valid data in the cache
  if (puppyCache.data && (Date.now() - puppyCache.timestamp < puppyCache.duration)) {
    console.log('--- Serving puppies from cache ---');
    return res.json(puppyCache.data);
  }

  try {
    console.log('--- Fetching puppies from Airtable ---');
    // Fetch all pet shops first to create a map
    const petShopRecords = await base('Pet Shops').select().all();
    const petShopMap = new Map(petShopRecords.map(rec => [rec.id, formatPetShopRecord(rec)]));

    // Fetch all puppies
    const puppyRecords = await base('Puppies').select({ filterByFormula: "Available = TRUE()" }).all();

    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      const petShopId = record.get('Pet Shop')?.[0];
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId);
      }
      return puppy;
    });

    // Store the fresh data in the cache
    puppyCache.data = puppies;
    puppyCache.timestamp = Date.now();

    res.json(puppies);
  } catch (error) {
    console.error('Critical error in /api/dogs:', error);
    res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// Final detail page endpoint
router.get('/:id', async (req, res) => {
  try {
    const puppyRecord = await base('Puppies').find(req.params.id);
    if (!puppyRecord) return res.status(404).json({ message: 'Puppy not found' });

    let puppy = formatPuppyRecord(puppyRecord);

    const petShopId = puppyRecord.get('Pet Shop')?.[0];
    if (petShopId) {
      const petShopRecord = await base('Pet Shops').find(petShopId);
      if (petShopRecord) {
        puppy.petShop = formatPetShopRecord(petShopRecord);
      }
    }
    res.json(puppy);
  } catch (error) {
    console.error(`Critical error fetching dog ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

export default router;