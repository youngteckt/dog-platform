import { Router } from 'express';
import Airtable from 'airtable';
// Import the new, centralized formatters
import { formatPuppyRecord, formatPetShopRecordDetailed, formatPetShopRecordForList } from '../utils/formatters.js';

const router = Router();
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// In-memory cache for the pet shop list
const petShopListCache = {
  data: null,
  timestamp: null,
  duration: 5 * 60 * 1000, // 5 minutes
};

// All formatting functions have been moved to utils/formatters.js to avoid circular dependencies.

// GET / - Returns a simple list of all pet shops for filtering.
router.get('/', async (req, res) => {
  // Check if we have valid data in the cache
  if (petShopListCache.data && (Date.now() - petShopListCache.timestamp < petShopListCache.duration)) {
    console.log('--- Serving pet shop list from cache ---');
    return res.json(petShopListCache.data);
  }

  try {
    console.log('--- Fetching pet shop list from Airtable ---');
    // Fetch all records from the 'Pet Shops' table, filtering out any with no name.
    const records = await base('Pet Shops').select({
      filterByFormula: "NOT({Name} = '')"
    }).all();

    // Format the records for the list view using the simple formatter
    const petShops = records.map(formatPetShopRecordForList);

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

    // DEFINITIVE FIX: Use the correct logic based on the user's schema.
    // First, get the array of linked puppy record IDs from the 'Available Puppies' field.
    const availablePuppyIds = petShopRecord.get('Available Puppies') || [];
    let puppyRecords = [];

    // If there are linked puppies, create a formula to fetch them by their record IDs.
    if (availablePuppyIds.length > 0) {
      const formula = 'OR(' + availablePuppyIds.map(id => `RECORD_ID() = '${id}'`).join(',') + ')';
      puppyRecords = await base('Puppies').select({
        filterByFormula: formula,
      }).all();
    }

    // Use the full puppy formatter to include images
    const puppies = puppyRecords.map(formatPuppyRecord);

    const petShop = formatPetShopRecordDetailed(petShopRecord);
    petShop.puppies = puppies;

    res.json(petShop);
  } catch (error) {
    console.error(`Error fetching pet shop details for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching pet shop details' });
  }
});

export default router;