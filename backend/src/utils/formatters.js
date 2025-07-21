// This file centralizes all Airtable data formatting functions to avoid circular dependencies.

// Formats a Pet Shop record for a simple list (e.g., for dropdowns)
export const formatPetShopRecordForList = (record) => ({
  _id: record.id,
  name: record.get('Pet Shop Name') || 'N/A',
  // Return a simple image URL without transformation for the list view
  shopPhotoUrl: record.get('Shop Photo')?.[0]?.url || null,
  // DEFINITIVE FIX: Use the correct 'Location' field name and access it as a simple string.
  location: record.get('Location') || 'N/A',
});

// New, safe formatter specifically for pet shop data linked to puppies on the homepage.
export const formatPetShopForPuppyList = (record) => {
  const shopPhotoField = record.get('Shop Photo');
  // Provides a simple, untransformed URL, which is all the puppy card needs.
  const shopPhotoUrl = shopPhotoField && shopPhotoField.length > 0 ? shopPhotoField[0].url : null;

  return {
    _id: record.id,
    name: record.get('Pet Shop Name') || 'N/A',
    shopPhotoUrl: shopPhotoUrl,
  };
};

// Formats a Pet Shop record for a detailed view, including Cloudinary transformations
export const formatPetShopRecordDetailed = (record) => {
  const shopPhotoField = record.get('Shop Photo');

  // Use the direct URL from Airtable. The transformation logic was incorrect.
  const directShopPhotoUrl = shopPhotoField?.[0]?.url || null;

  return {
    _id: record.id,
    name: record.get('Pet Shop Name') || 'N/A',
    // DEFINITIVE UNIFIED FIX: Provide the photo under BOTH field names to satisfy all pages.
    image: directShopPhotoUrl, // For Puppy Detail Page
    shopPhotoUrl: directShopPhotoUrl, // For Homepage, Pet Shop Directory, and Pet Shop Detail Page
    description: record.get('Company description') || 'No description available.',
    location: record.get('Location') || 'N/A',
    // Use the correct field names as confirmed by the user.
    contact: record.get('Contact Number') || 'N/A',
    email: record.get('Email') || 'N/A',
  };
};

// Formats a Puppy record, including Cloudinary transformations for all photos
export const formatPuppyRecord = (record) => {
  // DEFINITIVE FIX 1: Use the correct 'Photos' field, which is an attachment type.
  const photoAttachments = record.get('Photos') || [];

  // DEFINITIVE FIX 3: Create an array of objects like { url: '...' } for the gallery.
  const galleryPhotos = photoAttachments.map(attachment => ({ url: attachment.url }));

  return {
    _id: record.id,
    name: record.get('Name') || 'Unnamed Puppy',
    // Provide a simple image URL string for homepage compatibility.
    image: photoAttachments.length > 0 ? photoAttachments[0].url : null,
    // Provide the array of objects for the detail page gallery.
    photos: galleryPhotos,
    breed: record.get('Breed') || 'Unknown Breed',
    // Add the 'Age of puppy' field.
    age: record.get('Age of puppy') || null,
    price: Number(String(record.get('Price') || '0').replace(/[^0-9.]+/g, '')),
    dob: record.get('Date of Birth') || null,
    gender: record.get('Gender') || 'N/A',
    vaccinated: record.get('Vaccinated') || false,
    // DEFINITIVE FIX 2: Provide the 'description' field for the background text.
    description: record.get('Background of puppy') || 'No background available.',
    petShopId: (record.get('Pet Shop') && record.get('Pet Shop')[0]) || null,
    petShop: null, // This will be linked in the route handler
  };
};
