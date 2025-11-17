import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The storage folder path (e.g., 'courses', 'gallery', 'hero')
 * @param {string} oldImageUrl - Optional: URL of old image to delete after successful upload
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'images', oldImageUrl = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload file
    console.log(`📤 Uploading image to ${folder}/${fileName}...`);
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Image uploaded successfully:', downloadURL);

    // Delete old image if provided
    if (oldImageUrl) {
      try {
        await deleteImageByUrl(oldImageUrl);
        console.log('🗑️ Old image deleted successfully');
      } catch (error) {
        console.warn('⚠️ Could not delete old image:', error);
        // Don't throw error - new upload was successful
      }
    }

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The storage folder path
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadMultipleImages = async (files, folder = 'images') => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  console.log(`📤 Uploading ${files.length} images...`);
  const uploadPromises = files.map(file => uploadImage(file, folder));
  
  try {
    const urls = await Promise.all(uploadPromises);
    console.log(`✅ ${urls.length} images uploaded successfully`);
    return urls;
  } catch (error) {
    console.error('❌ Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage by URL
 * @param {string} imageUrl - The Firebase Storage URL of the image
 * @returns {Promise<void>}
 */
export const deleteImageByUrl = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('firebase')) {
    console.warn('⚠️ Invalid Firebase URL, skipping deletion');
    return;
  }

  try {
    // Extract the file path from the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Could not extract file path from URL');
    }

    const filePath = pathMatch[1];
    const fileRef = ref(storage, filePath);
    
    await deleteObject(fileRef);
    console.log('🗑️ Image deleted:', filePath);
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw error;
  }
};

/**
 * Validate an image file
 * @param {File} file - The file to validate
 * @returns {Object} {valid: boolean, error: string|null}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' 
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File is too large. Maximum size is 5MB. Your file is ${formatFileSize(file.size)}.` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Upload any file (documents, images, etc.) to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The storage folder path
 * @param {string} oldFileUrl - Optional: URL of old file to delete
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadFile = async (file, folder = 'files', oldFileUrl = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (max 20MB for documents)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 20MB.');
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedName}_${timestamp}_${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload file
    console.log(`📤 Uploading file to ${folder}/${fileName}...`);
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ File uploaded successfully:', downloadURL);

    // Delete old file if provided
    if (oldFileUrl) {
      try {
        await deleteImageByUrl(oldFileUrl);
        console.log('🗑️ Old file deleted successfully');
      } catch (error) {
        console.warn('⚠️ Could not delete old file:', error);
      }
    }

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};
