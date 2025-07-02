import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const petShopsTable = base('Pet Shops');

// Helper function to format a Pet Shop record
const formatPetShopRecord = (record) => {
  const shopPhoto = record.get('Shop Photo');
  return {
    _id: record.id,
    name: record.get('Pet Shop Name'),
    location: record.get('Location'),
    contact: record.get('Contact Number'),
    email: record.get('Email'),
    description: record.get('Company description'),
    shopPhotoUrl: shopPhoto && shopPhoto.length > 0 ? shopPhoto[0].url : null,
  };
};

// GET all pet shops
router.get('/', async (req, res) => {
  try {
    const records = await petShopsTable.select().all();
    const petShops = records.map(formatPetShopRecord);
    res.json(petShops);
  } catch (error) {
    console.error('Error fetching pet shops from Airtable:', error);
    res.status(500).json({ message: 'Error fetching pet shops' });
  }
});

// GET a single pet shop by ID with its puppies
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const petShopRecord = await petShopsTable.find(id);

    if (!petShopRecord) {
      return res.status(404).json({ message: 'Pet shop not found' });
    }

    // Fetch puppies using the 'Available Puppies' linked records field
    const puppyIds = petShopRecord.get('Available Puppies') || [];
    let puppies = [];

    if (puppyIds.length > 0) {
      const filterFormula = `OR(${puppyIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`;
      const puppyRecords = await base('Puppies').select({ filterByFormula: filterFormula }).all();
      
      puppies = puppyRecords.map(record => {
        const photos = record.get('Photos');
        // Sanitize the price string to remove currency symbols and commas before converting to a number
        const rawPrice = record.get('Price') || '';
        const price = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0;
        return {
          _id: record.id,
          name: record.get('Name') || 'Unnamed',
          breed: record.get('Breed'),
          price: price,
          image: photos && photos.length > 0 ? photos[0].url : null,
        };
      });
    }

    const petShop = formatPetShopRecord(petShopRecord);
    petShop.puppies = puppies;

    res.json(petShop);
  } catch (error) {
    console.error(`Error fetching details for pet shop ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching pet shop details' });
  }
});

export default router;