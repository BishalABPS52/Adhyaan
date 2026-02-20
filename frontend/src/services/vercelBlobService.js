/**
 * Vercel Blob Upload Service for Adhyaan Platform
 * 
 * ARCHITECTURE: Frontend → Backend → Vercel Blob → Database
 * 
 * This service handles document uploads to Vercel Blob storage through the backend API.
 * Documents are stored in cloud storage (NOT in the database) to ensure:
 * - Better performance and scalability
 * - Proper database normalization (DB stores metadata, cloud stores files)
 * - Efficient document delivery via CDN
 * - Unlimited storage capacity
 * 
 * The database stores only document URLs, not the files themselves.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.up.railway.app/api/v1";

/**
 * Upload a document (PDF or DOCX) via backend to Vercel Blob
 * 
 * WORKFLOW:
 * 1. Frontend sends file to backend API
 * 2. Backend uploads to Vercel Blob
 * 3. Backend returns blob URL
 * 4. Frontend uses URL to save book metadata
 * 
 * WHY THIS APPROACH?
 * - Files stored in cloud, NOT in database (proper normalization)
 * - Database stores only URLs for better performance
 * - CDN delivery ensures fast access worldwide
 * - Scalable - cloud handles unlimited files
 * - Secure - token never exposed to frontend
 * 
 * @param {File} file - The document file to upload (PDF or DOCX)
 * @param {string} folder - Folder name ('academic' or 'indie')
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<Object>} - Object containing blob_url and metadata
 */
export const uploadDocumentToVercelBlob = async (file, folder = 'academic', onProgress) => {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
  }

  // Validate file size (30MB limit)
  const maxSize = 30 * 1024 * 1024; // 30MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 30MB limit.');
  }

  // Validate folder
  if (!['academic', 'indie'].includes(folder)) {
    throw new Error('Folder must be "academic" or "indie".');
  }

  try {
    // Get auth token - use correct key 'adhyaan_token'
    const token = localStorage.getItem('adhyaan_token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Upload via backend API with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('✅ Document uploaded to Vercel Blob:', response.blob_url);
          resolve({
            blob_url: response.blob_url,
            file_type: response.file_type,
            file_size: response.file_size,
            success: response.success
          });
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', `${API_BASE_URL}/author/upload/document`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

/**
 * Upload a cover image via backend to Vercel Blob
 * 
 * @param {File} file - The image file to upload (JPEG, PNG, or WEBP)
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<Object>} - Object containing blob_url
 */
export const uploadCoverImageToVercelBlob = async (file, onProgress) => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.');
  }

  // Validate file size (15MB limit)
  const maxSize = 15 * 1024 * 1024; // 15MB
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 15MB limit.');
  }

  try {
    // Get auth token - use correct key 'adhyaan_token'
    const token = localStorage.getItem('adhyaan_token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload via backend API with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('✅ Cover image uploaded to Vercel Blob:', response.blob_url);
          resolve({
            blob_url: response.blob_url,
            success: response.success
          });
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', `${API_BASE_URL}/author/upload/cover`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

/**
 * Get file type from filename
 * @param {string} filename - The filename
 * @returns {string} - File type ('pdf', 'docx', 'doc', etc.)
 */
export const getFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  return extension;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
