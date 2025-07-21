import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// In-memory cache for the pet shop list
const petShopListCache = {
  data: null,
  timestamp: null,
  duration: 5 * 60 * 1000, // 5 minutes
};

// Helper function to format a Pet Shop record for the simple list
const formatPetShopRecordForList = (record) => ({
  _id: record.id,
  name: record.get('Pet Shop Name') || 'N/A',
});

// Helper function to format a Pet Shop for the detailed page view
const formatPetShopRecordDetailed = (record) => {
  const shopPhoto = record.get('Shop Photo');
  return {
    _id: record.id,
    name: record.get('Pet Shop Name') || 'N/A',
    image: shopPhoto && shopPhoto.length > 0 ? shopPhoto[0].url : null,
    description: record.get('Company Description') || 'No description available.',
    location: record.get('Location (For Pet Shop)')?.[0] || 'N/A',
    contact: (record.get('Contact Number (For Pet Shop)') || ['N/A'])[0],
    email: record.get('Email (For Pet Shop)')?.[0] || 'N/A',
    puppies: [], // Puppies will be added separately
  };
};

// GET / - Returns a simple list of all pet shops for filtering.
router.get('/', async (req, res) => {
  // Check if we have valid data in the cache
  if (petShopListCache.data && (Date.now() - petShopListCache.timestamp < petShopListCache.duration)) {
    console.log('--- Serving pet shop list from cache ---');
    return res.json(petShopListCache.data);
  }

  try {
    console.log('--- Fetching pet shop list from Airtable ---');
    // Remove the 'fields' filter to prevent crashes from incorrect field names
    const petShopRecords = await base('Pet Shops').select().all();
    const petShops = petShopRecords.map(formatPetShopRecordForList);

    // Store the fresh data in the cache
    petShopListCache.data = petShops;
    petShopListCache.timestamp = Date.now();

    res.json(petShops);
  } catch (error) {
    console.error('Critical error fetching pet shop list:', error);
    res.status(500).json({ message: 'Error fetching pet shops' });
  }
});

// GET /:id - Returns a single pet shop by ID with its puppies
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const petShopRecord = await base('Pet Shops').find(id);

    if (!petShopRecord) {
      return res.status(404).json({ message: 'Pet shop not found' });
    }

    const puppyRecords = await base('Puppies').select({
      filterByFormula: `{Pet Shop ID} = '${id}'`,
    }).all();

    const puppies = puppyRecords.map(record => ({ id: record.id, name: record.get('Name') }));

    const petShop = formatPetShopRecordDetailed(petShopRecord);
    petShop.puppies = puppies;

    res.json(petShop);
  } catch (error) {
    console.error(`Error fetching pet shop details for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching pet shop details' });
  }
});

export default router;