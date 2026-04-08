import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import AppError from '../utils/AppError';
import { HttpStatus } from '../constants';
import logger from '../utils/logger';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary
 * @param localFilePath Path to the local file (usually uploaded via multer to temp/ memory)
 * @param folder Name of the folder in Cloudinary
 * @returns Cloudinary response including secure_url and public_id
 */
export const uploadOnCloudinary = async (
  localFilePath: string,
  folder: string = 'docbook/departments'
) => {
  try {
    if (!localFilePath) return null;

    // upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folder,
    });

    // File has been uploaded successfully
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    logger.error('Error uploading to Cloudinary:', error);
    throw new AppError('Failed to upload image.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Deletes a file from Cloudinary using its public_id
 * @param publicId The public_id of the file to delete
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    logger.error('Error deleting from Cloudinary:', error);
    throw new AppError('Failed to delete image.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
