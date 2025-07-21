// This file centralizes all Airtable data formatting functions to avoid circular dependencies.

// Formats a Pet Shop record for a simple list (e.g., for dropdowns)
export const formatPetShopRecordForList = (record) => ({
  _id: record.id,
  name: record.get('Pet Shop Name') || 'N/A',
  // Return a simple image URL without transformation for the list view
  image: record.get('Shop Photo')?.[0]?.url || null,
});

// Formats a Pet Shop record for a detailed view, including Cloudinary transformations
export const formatPetShopRecordDetailed = (record) => {
  const shopPhotoField = record.get('Shop Photo');
  const shopPhotoUrl = shopPhotoField && shopPhotoField.length > 0 ? shopPhotoField[0].url : null;
  const transformations = 'f_auto,q_auto,w_400,c_limit';

  let transformedUrl = null;
  if (shopPhotoUrl) {
    const urlParts = shopPhotoUrl.split('/upload/');
    transformedUrl = urlParts.length === 2
      ? `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`
      : shopPhotoUrl;
  }

  return {
    _id: record.id,
    name: record.get('Pet Shop Name') || 'N/A',
    image: transformedUrl,
    description: record.get('Company description') || 'No description available.',
    location: record.get('Location (For Pet Shop)')?.[0] || 'N/A',
    contact: (record.get('Contact Number (For Pet Shop)') || ['N/A'])[0],
    email: record.get('Email (For Pet Shop)')?.[0] || 'N/A',
    puppies: [], // Puppies will be added separately
  };
};

// Formats a Puppy record, including Cloudinary transformations for all photos
export const formatPuppyRecord = (record) => {
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
    price: Number(String(record.get('Price') || '0').replace(/[^0-9.]+/g, '')),
    dob: record.get('Date of Birth') || null,
    gender: record.get('Gender') || 'N/A',
    vaccinated: record.get('Vaccinated') || false,
    background: record.get('Background of puppy') || 'No background available.',
    petShopId: (record.get('Pet Shop') || [])[0] || null,
    petShop: null, // This will be linked in the route handler
  };
};
