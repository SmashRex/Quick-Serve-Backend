import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer to Cloudinary and returns its public URL.
 * Same signature as the old localFileStorage.saveFile() — (buffer, filename) → url —
 * so swapping this in required no changes to riderTasks.service.js beyond the import.
 */
export async function saveFile(buffer, originalFilename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'quickserve/proof-photos', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}