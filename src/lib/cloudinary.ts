import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || '676914561722659',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'SkC1IcPbT4vicrNMlhbNlLX5H8w',
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  quality?: string | number;
  format?: string;
  width?: number;
  height?: number;
  crop?: string;
}

export class CloudinaryService {
  /**
   * Upload a single image to Cloudinary
   */
  static async uploadImage(
    file: Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const defaultOptions: UploadOptions = {
        folder: 'designer-portal',
        resource_type: 'image',
        quality: 'auto',
        format: 'webp',
        ...options,
      };

      const result = await cloudinary.uploader.upload(file.toString('base64'), {
        ...defaultOptions,
        // Ensure we're uploading base64 data
        ...(typeof file !== 'string' && { upload_preset: undefined }),
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(
    files: (Buffer | string)[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadImage(file, {
          ...options,
          public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images to Cloudinary:', error);
      throw new Error('Failed to upload images');
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  static async deleteMultipleImages(publicIds: string[]): Promise<boolean[]> {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
      return await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple images from Cloudinary:', error);
      throw new Error('Failed to delete images');
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
      gravity?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      format: 'webp',
      fetch_format: 'auto',
      ...options,
    });
  }

  /**
   * Generate thumbnail URL
   */
  static getThumbnailUrl(
    publicId: string,
    size: number = 200
  ): string {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 80,
    });
  }

  /**
   * Upload profile picture with specific optimizations
   */
  static async uploadProfilePicture(
    file: Buffer | string,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: 'designer-portal/profiles',
      public_id: `profile_${userId}`,
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 90,
    });
  }

  /**
   * Upload portfolio image with specific optimizations
   */
  static async uploadPortfolioImage(
    file: Buffer | string,
    designerId: string,
    projectId: string,
    imageIndex: number
  ): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: 'designer-portal/portfolios',
      public_id: `portfolio_${designerId}_${projectId}_${imageIndex}`,
      width: 1200,
      height: 800,
      crop: 'limit',
      quality: 'auto',
    });
  }

  /**
   * Upload product image for suppliers
   */
  static async uploadProductImage(
    file: Buffer | string,
    supplierId: string,
    productId: string,
    imageIndex: number
  ): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: 'designer-portal/products',
      public_id: `product_${supplierId}_${productId}_${imageIndex}`,
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto',
    });
  }

  /**
   * Get folder contents (for admin purposes)
   */
  static async getFolderContents(folder: string): Promise<any[]> {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by([['created_at', 'desc']])
        .max_results(100)
        .execute();

      return result.resources;
    } catch (error) {
      console.error('Error getting folder contents from Cloudinary:', error);
      throw new Error('Failed to get folder contents');
    }
  }
}

export default CloudinaryService;