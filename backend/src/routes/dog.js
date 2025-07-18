import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Defensive helper function to format a pet shop record
const formatPetShopRecord = (record) => {
  try {
    return {
      _id: record.id,
      name: record.get('Name') || 'N/A',
      image: record.get('Image')?.[0]?.url || null,
      location: record.get('Location (For Pet Shop)')?.[0] || 'N/A',
      contact: (record.get('Contact Number (For Pet Shop)') || ['N/A'])[0],
      email: record.get('Email (For Pet Shop)')?.[0] || 'N/A',
    };
  } catch (e) {
    console.error(`Failed to format pet shop record ${record.id}:`, e.message);
    return null; // Return null if formatting fails
  }
};

// Defensive helper function to format a puppy record
const formatPuppyRecord = (record) => {
  try {
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
      petShop: null, // Linked later
    };
  } catch (e) {
    console.error(`Failed to format puppy record ${record.id}:`, e.message);
    return null; // Return null if formatting fails
  }
};

// Main endpoint with detailed logging
router.get('/', async (req, res) => {
  console.log('---[/api/dogs] Endpoint hit---');
  try {
    console.log('Step 1: Fetching data from Airtable...');
    const [puppyRecords, petShopRecords] = await Promise.all([
      base('Puppies').select({ filterByFormula: "Available = TRUE()" }).all(),
      base('Pet Shops').select().all(),
    ]);
    console.log(`Step 2: Fetched ${puppyRecords.length} puppies and ${petShopRecords.length} pet shops.`);

    console.log('Step 3: Formatting pet shops...');
    const petShopMap = new Map();
    petShopRecords.forEach(record => {
      const shop = formatPetShopRecord(record);
      if (shop) petShopMap.set(shop._id, shop);
    });
    console.log(`Step 4: Successfully formatted ${petShopMap.size} pet shops.`);

    console.log('Step 5: Formatting puppies and linking shops...');
    const puppies = puppyRecords.map(record => {
      const puppy = formatPuppyRecord(record);
      if (!puppy) return null;

      const petShopId = record.get('Pet Shop')?.[0];
      if (petShopId && petShopMap.has(petShopId)) {
        puppy.petShop = petShopMap.get(petShopId);
      }
      return puppy;
    }).filter(Boolean); // Filter out any nulls from failed formatting
    console.log(`Step 6: Successfully formatted ${puppies.length} puppies.`);

    console.log('---Request successful. Sending data.---');
    res.json(puppies);

  } catch (error) {
    console.error('---!!! CRITICAL ERROR in /api/dogs !!!---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// Detail page endpoint (simplified for brevity)
router.get('/:id', async (req, res) => {
  try {
    const puppyRecord = await base('Puppies').find(req.params.id);
    if (!puppyRecord) return res.status(404).json({ message: 'Puppy not found' });

    let puppy = formatPuppyRecord(puppyRecord);
    if (!puppy) return res.status(500).json({ message: 'Failed to format puppy data' });

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