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
  return cache.puppies && cache.lastFetch && (Date.now() - cache.lastFetch) < cache.TTL;
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

    // Create a detailed pet shop lookup map
    const petShopMap = new Map();
    petShopRecords.forEach(shop => {
      const shopImage = shop.get('Shop Photo');
      petShopMap.set(shop.id, {
        _id: shop.id,
        name: shop.get('Pet Shop Name'),
        location: shop.get('Location'),
        contact: shop.get('Contact Number'),
        email: shop.get('Email'),
        image: shopImage && shopImage.length > 0 ? shopImage[0].url : null,
      });
    });

    // Format puppies with fully populated pet shop details
    const puppies = puppyRecords.map(record => {
      let puppy = formatPuppyRecord(record);
      const petShopId = puppy.petShop; // This is the ID from formatPuppyRecord
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId); // Replace ID with full object
      } else {
        puppy.petShop = null; // Or some default object if a shop isn't found
      }
      return puppy;
    });

    // Update cache
    cache.puppies = puppies;
    cache.petShops = petShopRecords; // We can still cache this if needed elsewhere
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
  const photos = record.get('Photos') || []; // Ensure 'photos' is always an array.
  // Safely parse the price string into a number
  const priceString = String(record.get('Price') || '0');
  const priceNumber = Number(priceString.replace(/[^0-9.]+/g, ''));

  // Fetch and sanitize the contact number
  const rawContact = record.get('Contact Number (For Pet Shop)');
  const sanitizedContact = rawContact ? String(rawContact).replace(/\D/g, '') : null;

  // Construct permanent, optimized Cloudinary image URLs
  const cloudName = 'ddkyuhxmd';
  const transformations = 'f_auto,q_auto,w_400,c_limit';
  const optimizedImageUrls = photos
    .filter(photo => photo && photo.url)
    .map(photo => 
    `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(photo.url)}`
  );

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
    contactNumber: sanitizedContact,
  };
};

// GET all available puppies
router.get('/', async (req, res) => {
  try {
    if (isCacheValid()) {
      console.log('Returning cached puppies...');
      return res.json(cache.puppies);
    }
    
    const puppies = await fetchAndCacheData();
    res.json(puppies);

  } catch (error) {
    console.error('Error fetching puppies from Airtable:', error);
    res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// GET a single puppy by its ID
router.get('/:id', async (req, res) => {
  try {
    // Ensure cache is populated
    if (!isCacheValid()) {
      await fetchAndCacheData();
    }

    // Find the puppy in the cache
    const puppy = cache.puppies.find(p => p._id === req.params.id);

    if (puppy) {
      console.log(`Returning cached puppy details for: ${req.params.id}`);
      res.json(puppy);
    } else {
      // Fallback for a rare case where puppy is not in cache (e.g., just became unavailable)
      // This part is optional but good for robustness
      console.log(`Cache miss for puppy ${req.params.id}. Fetching directly.`);
      const record = await puppiesTable.find(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Puppy not found' });
      }
      const freshPuppy = await populatePetShopForPuppy(record); // You'll need to define this function or inline it
      res.json(freshPuppy);
    }
  } catch (error) {
    console.error('Error fetching puppy details:', error);
    res.status(500).json({ message: 'Error fetching puppy details' });
  }
});

// Define the populatePetShopForPuppy function used in the fallback
const populatePetShopForPuppy = async (record) => {
  let puppy = formatPuppyRecord(record);
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
      puppy.petShop = null; 
    }
  }
  return puppy;
};

export default router;