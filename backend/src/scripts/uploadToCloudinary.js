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
 * @param {string} publicId - A unique ID for the image in Cloudinary.
 * @returns {Promise<string|null>} The secure URL of the uploaded image, or null on failure.
 */
const uploadImage = async (imageUrl, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'puppies', // Organize images in a 'puppies' folder in Cloudinary
      public_id: publicId, // Use a unique ID for each photo
      overwrite: true,    // Replace the image if one with the same public_id already exists
    });
    console.log(`✅ Successfully uploaded image. URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading image from URL ${imageUrl}:`, error.message);
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
      const photos = record.get('Photos');

      // If there are no photos in the attachment field, skip.
      if (!photos || photos.length === 0) {
        console.log(`⏭️  Skipping ${puppyId} (${puppyName}): No photos found.`);
        continue;
      }

      console.log(`⏳ Processing ${puppyId} (${puppyName}): Found ${photos.length} photo(s).`);

      const uploadedUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const airtableUrl = photo.url;
        // Create a unique ID for each photo, e.g., 'recXYZ_photo_0'
        const publicId = `${puppyId}_photo_${i}`;
        const newCloudinaryUrl = await uploadImage(airtableUrl, publicId);
        if (newCloudinaryUrl) {
          uploadedUrls.push(newCloudinaryUrl);
        }
      }

      // If any uploads were successful, update the Airtable record.
      if (uploadedUrls.length > 0) {
        await base('Puppies').update(puppyId, {
          // Store all URLs in the new field as a comma-separated string
          'CloudinaryPhotos': uploadedUrls.join(','),
        });
        console.log(`💾 Successfully updated Airtable record for ${puppyId} with ${uploadedUrls.length} URLs.`);
      } else {
        console.error(`Failed to upload any photos for ${puppyId}. Record not updated.`);
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
