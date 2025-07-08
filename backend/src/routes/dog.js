import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const puppiesTable = base('Puppies');
const petShopsTable = base('Pet Shops');

// Simple in-memory cache
const cache = {
  puppies: null,
  petShops: null,
  lastFetch: null,
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Helper function to check if cache is valid
const isCacheValid = () => {
  return cache.lastFetch && (Date.now() - cache.lastFetch) < cache.TTL;
};

// Helper function to fetch and cache data
const fetchAndCacheData = async () => {
  try {
    console.log('Fetching fresh data from Airtable...');
    
    // Fetch both puppies and pet shops in parallel
    const [puppyRecords, petShopRecords] = await Promise.all([
      puppiesTable.select({
        filterByFormula: "({Available} = TRUE())",
      }).all(),
      petShopsTable.select().all()
    ]);

    // Create pet shop lookup map
    const petShopMap = new Map();
    petShopRecords.forEach(shop => {
      petShopMap.set(shop.id, shop.get('Pet Shop Name'));
    });

    // Format puppies with pet shop names
    const puppies = puppyRecords.map(record => {
      const petShopId = record.get('Pet Shop') ? record.get('Pet Shop')[0] : null;
      const formattedRecord = formatPuppyRecord(record);
      return {
        ...formattedRecord,
        petShopName: petShopId ? petShopMap.get(petShopId) : 'N/A',
      };
    });

    // Update cache
    cache.puppies = puppies;
    cache.petShops = petShopRecords;
    cache.lastFetch = Date.now();

    console.log(`Cached ${puppies.length} puppies and ${petShopRecords.length} pet shops`);
    return puppies;
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    throw error;
  }
};

// Helper function to format an Airtable record into the JSON our frontend expects
const formatPuppyRecord = (record) => {
  const photos = record.get('Photos');
  // Safely parse the price string into a number
  const priceString = String(record.get('Price') || '0');
  const priceNumber = Number(priceString.replace(/[^0-9.]+/g, ''));

  // Fetch and sanitize the contact number
  const rawContact = record.get('Contact Number (For Pet Shop)');
  const sanitizedContact = rawContact ? String(rawContact).replace(/\D/g, '') : null;

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
    image: photos && photos.length > 0 ? photos[0].url : null,
    // Add the full photos array for the detail page gallery
    photos: photos || [],
    // The frontend expects the description field from the old schema
    description: record.get('Background of puppy') || `A lovely ${record.get('Breed')}`,
    petShop: record.get('Pet Shop') ? record.get('Pet Shop')[0] : null,
    contactNumber: sanitizedContact,
  };
};

// Helper function to format a puppy record and populate its pet shop details
const populatePetShopForPuppy = async (record) => {
  let puppy = formatPuppyRecord(record);

  // If the puppy is linked to a pet shop, fetch that pet shop's details
  if (puppy.petShop) {
    try {
      const petShopRecord = await petShopsTable.find(puppy.petShop);
      const shopImage = petShopRecord.get('Shop Photo');
      puppy.petShop = {
        _id: petShopRecord.id,
        name: petShopRecord.get('Pet Shop Name'),
        location: petShopRecord.get('Location'),
        contact: petShopRecord.get('Contact Number'),
        email: petShopRecord.get('Email'),
        image: shopImage && shopImage.length > 0 ? shopImage[0].url : null,
      };
    } catch (error) {
      console.error(`Failed to populate pet shop for puppy ${puppy._id}:`, error);
      // If fetching the pet shop fails, we can nullify it or leave the ID
      puppy.petShop = null; 
    }
  }
  return puppy;
};

// GET all available puppies
router.get('/', async (req, res) => {
  try {
    if (isCacheValid()) {
      console.log('Returning cached puppies...');
      res.json(cache.puppies);
    } else {
      const puppies = await fetchAndCacheData();
      res.json(puppies);
    }
  } catch (error) {
    console.error('Error fetching puppies from Airtable:', error);
    res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// GET a single puppy by its ID
router.get('/:id', async (req, res) => {
  try {
    // We should not use the cache for a single puppy detail view 
    // to ensure we always get the fully populated, latest data.
    const record = await puppiesTable.find(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    const puppy = await populatePetShopForPuppy(record);

    res.json(puppy);
  } catch (error) {
    console.error('Error fetching puppy details from Airtable:', error);
    res.status(500).json({ message: 'Error fetching puppy details' });
  }
});

export default router;