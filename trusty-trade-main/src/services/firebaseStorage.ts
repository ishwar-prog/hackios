import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export type UploadType = 'products' | 'verifications' | 'disputes';

class FirebaseStorageService {
  // Validate file type and size
  private validateFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }
  }

  // Generate storage path
  private getStoragePath(type: UploadType, id: string, fileName: string): string {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    switch (type) {
      case 'products':
        return `products/${id}/${timestamp}_${cleanFileName}`;
      case 'verifications':
        return `verifications/${id}/${timestamp}_${cleanFileName}`;
      case 'disputes':
        return `disputes/${id}/${timestamp}_${cleanFileName}`;
      default:
        throw new Error('Invalid upload type');
    }
  }

  // Upload single file
  async uploadFile(file: File, type: UploadType, id: string): Promise<string> {
    try {
      this.validateFile(file);
      
      const storagePath = this.getStoragePath(type, id, file.name);
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(files: File[], type: UploadType, id: string): Promise<string[]> {
    try {
      if (files.length === 0) {
        throw new Error('At least one image is required');
      }

      const uploadPromises = files.map(file => this.uploadFile(file, type, id));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  // Delete file by URL
  async deleteFile(downloadURL: string): Promise<void> {
    try {
      const storageRef = ref(storage, downloadURL);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Delete all files in a folder
  async deleteFolder(type: UploadType, id: string): Promise<void> {
    try {
      const folderRef = ref(storage, `${type}/${id}`);
      const listResult = await listAll(folderRef);
      
      const deletePromises = listResult.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  // Get all files in a folder
  async getFolderFiles(type: UploadType, id: string): Promise<string[]> {
    try {
      const folderRef = ref(storage, `${type}/${id}`);
      const listResult = await listAll(folderRef);
      
      const urlPromises = listResult.items.map(itemRef => getDownloadURL(itemRef));
      return await Promise.all(urlPromises);
    } catch (error) {
      console.error('Error getting folder files:', error);
      throw error;
    }
  }

  // Compress image before upload (optional optimization)
  private async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Upload with compression
  async uploadCompressedFile(file: File, type: UploadType, id: string): Promise<string> {
    try {
      const compressedFile = await this.compressImage(file);
      return await this.uploadFile(compressedFile, type, id);
    } catch (error) {
      console.error('Error uploading compressed file:', error);
      throw error;
    }
  }

  // Upload multiple files with compression
  async uploadCompressedFiles(files: File[], type: UploadType, id: string): Promise<string[]> {
    try {
      if (files.length === 0) {
        throw new Error('At least one image is required');
      }

      const uploadPromises = files.map(file => this.uploadCompressedFile(file, type, id));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading compressed files:', error);
      throw error;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();