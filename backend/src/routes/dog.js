import { Router } from 'express';
import Airtable from 'airtable';

const router = Router();

// Configure Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const puppiesTable = base('Puppies');
const petShopsTable = base('Pet Shops');

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

// GET all available puppies
router.get('/', async (req, res) => {
  try {
    // Fetch all pet shops to create a name lookup map
    const petShops = await petShopsTable.select().all();
    const petShopMap = new Map();
    petShops.forEach(shop => {
      petShopMap.set(shop.id, shop.get('Pet Shop Name'));
    });

    // Fetch all puppies and map them, adding the pet shop name
    const puppyRecords = await puppiesTable.select({
      filterByFormula: "({Available} = TRUE())", // Only fetch puppies marked as available
    }).all();
    const puppies = puppyRecords.map(record => {
      const petShopId = record.get('Pet Shop') ? record.get('Pet Shop')[0] : null;
      const formattedRecord = formatPuppyRecord(record);
      return {
        ...formattedRecord,
        petShopName: petShopId ? petShopMap.get(petShopId) : 'N/A',
      };
    });

    res.json(puppies);
  } catch (error) {
    console.error('Error fetching puppies from Airtable:', error);
    res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// GET a single puppy by its ID
router.get('/:id', async (req, res) => {
  try {
    const record = await puppiesTable.find(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    let puppy = formatPuppyRecord(record);

    // If the puppy is linked to a pet shop, fetch that pet shop's details
    if (puppy.petShop) {
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
    }

    res.json(puppy);
  } catch (error) {
    console.error('Error fetching puppy details from Airtable:', error);
    res.status(500).json({ message: 'Error fetching puppy details' });
  }
});

export default router;