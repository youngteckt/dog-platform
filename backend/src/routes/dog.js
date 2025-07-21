import { Router } from 'express';
import Airtable from 'airtable';
import { formatPuppyRecord, formatPetShopRecordForList, formatPetShopRecordDetailed, formatPetShopForPuppyList } from '../utils/formatters.js';

const router = Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// In-memory cache for puppies
const puppyCache = {
  data: null,
  timestamp: null,
  duration: 5 * 60 * 1000, // 5 minutes
};

// All formatting functions have been moved to utils/formatters.js to avoid circular dependencies.

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
    const puppyRecords = await base('Puppies').select({ filterByFormula: "Available = TRUE()" }).all();
    const petShopRecords = await base('Pet Shops').select().all();

    // REVERT to the detailed formatter. This is the only way to fix all pages.
    const petShops = petShopRecords.map(formatPetShopRecordDetailed);
    const petShopMap = new Map(petShops.map(shop => [shop._id, shop]));

    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      if (puppy.petShopId && petShopMap.has(puppy.petShopId)) {
        puppy.petShop = petShopMap.get(puppy.petShopId);
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

// GET /:id - Returns a single puppy by ID, including pet shop details.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const puppyRecord = await base('Puppies').find(id);

    if (!puppyRecord) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    // Format the puppy record to get all details, including Cloudinary photos
    const puppy = formatPuppyRecord(puppyRecord);

    // Fetch and attach pet shop details if a pet shop is linked
    if (puppy.petShopId) {
      try {
        const petShopRecord = await base('Pet Shops').find(puppy.petShopId);
        puppy.petShop = formatPetShopRecordForList(petShopRecord);
      } catch (shopError) {
        console.error(`Failed to fetch pet shop details for puppy ${id}:`, shopError);
        // If the pet shop isn't found, we can proceed without it
        puppy.petShop = null;
      }
    }

    res.json(puppy);
  } catch (error) {
    console.error(`Error fetching puppy details for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching puppy details' });
  }
});

export default router;