import Airtable from 'airtable';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file, using an absolute path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// --- Configuration ---
const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Verify that all necessary environment variables are set
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Error: Missing one or more required environment variables.');
  console.error('Please ensure AIRTABLE_API_KEY, AIRTABLE_BASE_ID, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your .env file.');
  process.exit(1);
}

// Configure Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an image to Cloudinary from a given URL.
 * @param {string} imageUrl - The URL of the image to upload.
 * @param {string} puppyId - The Airtable record ID of the puppy, used as the public_id in Cloudinary.
 * @returns {Promise<string|null>} The secure URL of the uploaded image, or null on failure.
 */
const uploadImage = async (imageUrl, puppyId) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'puppies', // Organize images in a 'puppies' folder in Cloudinary
      public_id: puppyId, // Use the puppy's record ID for a unique, stable public_id
      overwrite: true,    // Replace the image if one with the same public_id already exists
    });
    console.log(`✅ Successfully uploaded image for ${puppyId}. URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image for ${puppyId} from URL ${imageUrl}:`, error.message);
    return null;
  }
};

/**
 * Main function to process all puppy records from Airtable.
 */
const processPuppies = async () => {
  console.log('🚀 Starting script: Fetching puppies from Airtable...');
  try {
    const records = await base('Puppies').select().all();
    console.log(`Found ${records.length} records to process.`);

    for (const record of records) {
      const puppyId = record.id;
      const puppyName = record.get('Name') || 'Unnamed Puppy';
      const cloudinaryUrl = record.get('CloudinaryURL');
      const photos = record.get('Photos');

      // If a permanent URL already exists, skip this record.
      if (cloudinaryUrl) {
        console.log(`⏭️  Skipping ${puppyId} (${puppyName}): CloudinaryURL already exists.`);
        continue;
      }

      // If there are no photos in the attachment field, skip.
      if (!photos || photos.length === 0) {
        console.log(`⏭️  Skipping ${puppyId} (${puppyName}): No photos found.`);
        continue;
      }

      // Get the URL of the first photo in the attachment field.
      const airtableUrl = photos[0].url;
      console.log(`⏳ Processing ${puppyId} (${puppyName}): Uploading from ${airtableUrl}`);

      // Upload the image to Cloudinary.
      const newCloudinaryUrl = await uploadImage(airtableUrl, puppyId);

      // If the upload was successful, update the Airtable record.
      if (newCloudinaryUrl) {
        await base('Puppies').update(puppyId, {
          'CloudinaryURL': newCloudinaryUrl,
        });
        console.log(`💾 Successfully updated Airtable record for ${puppyId}.`);
      } else {
        console.error(`Failed to get Cloudinary URL for ${puppyId}. Record not updated.`);
      }
      console.log('---'); // Separator for clarity
    }
    console.log('🎉 Script finished successfully!');
  } catch (error) {
    console.error('🔥 A critical error occurred during the script execution:', error);
    process.exit(1);
  }
};

// Run the script
processPuppies();
