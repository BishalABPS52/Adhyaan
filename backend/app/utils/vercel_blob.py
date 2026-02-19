"""
Vercel Blob Storage Service for Adhyaan Platform

ARCHITECTURE: Frontend/Backend → Vercel Blob → Database

This service handles document uploads to Vercel Blob storage.
Documents are stored in cloud storage (NOT in the database) to ensure:
- Better performance and scalability
- Proper database normalization (DB stores metadata, cloud stores files)
- Efficient document delivery via CDN
- Unlimited storage capacity

The database stores only document URLs, not the files themselves.
"""

# Ensure httpx is installed in the environment. If not, install it using pip.
import httpx
import os
from typing import Optional, Tuple
from fastapi import HTTPException, UploadFile
from datetime import datetime
import mimetypes


class VercelBlobService:
    """Service for uploading files to Vercel Blob Storage."""
    
    def __init__(self, token: str):
        """
        Initialize Vercel Blob service.
        
        Args:
            token: BLOB_READ_WRITE_TOKEN from environment
        """
        self.token = token
        self.base_url = "https://blob.vercel-storage.com"
        
    async def upload_document(
        self,
        file: UploadFile,
        folder: str = "academic",
        allowed_types: Optional[list] = None
    ) -> Tuple[str, str, int]:
        """
        Upload a document (PDF or DOCX) to Vercel Blob.
        
        Args:
            file: The uploaded file
            folder: Folder name ('academic' or 'indie')
            allowed_types: List of allowed MIME types
            
        Returns:
            Tuple of (blob_url, file_type, file_size)
            
        Raises:
            HTTPException: If upload fails or file type not allowed
        """
        if allowed_types is None:
            allowed_types = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
            ]
        
        # Validate file type
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Validate file size (30MB limit)
        max_size = 30 * 1024 * 1024  # 30MB
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size 30MB"
            )
        
        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{folder}/{timestamp}-{file.filename}"
        
        # Determine file type
        file_type = 'pdf' if file.content_type == 'application/pdf' else 'docx'
        
        try:
            # Upload to Vercel Blob
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.put(
                    f"{self.base_url}/{unique_filename}",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "x-content-type": file.content_type,
                        "x-content-disposition": "inline",
                        "x-access": "public",
                        "x-add-random-suffix": "false"
                    },
                    content=content,
                )
                
                if response.status_code not in [200, 201]:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Vercel Blob upload failed: {response.text}"
                    )
                
                blob_data = response.json()
                blob_url = blob_data.get("url")
                
                if not blob_url:
                    raise HTTPException(
                        status_code=500,
                        detail="Vercel Blob did not return a URL"
                    )
                
                return blob_url, file_type, file_size
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Network error during upload: {str(e)}"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {str(e)}"
            )
    
    async def upload_cover_image(
        self,
        file: UploadFile,
        folder: str = "covers"
    ) -> str:
        """
        Upload a cover image to Vercel Blob.
        
        Args:
            file: The uploaded image file
            folder: Folder name (default: 'covers')
            
        Returns:
            Vercel Blob URL of the uploaded image
            
        Raises:
            HTTPException: If upload fails or file type not allowed
        """
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        
        # Validate file type
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Validate file size (15MB limit for images)
        max_size = 15 * 1024 * 1024  # 15MB
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"Image size exceeds maximum allowed size 15MB"
            )
        
        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        unique_filename = f"{folder}/{timestamp}-{file.filename}"
        
        try:
            # Upload to Vercel Blob
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.put(
                    f"{self.base_url}/{unique_filename}",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "x-content-type": file.content_type,
                        "x-access": "public",
                        "x-add-random-suffix": "false"
                    },
                    content=content,
                )
                
                if response.status_code not in [200, 201]:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Vercel Blob upload failed: {response.text}"
                    )
                
                blob_data = response.json()
                blob_url = blob_data.get("url")
                
                if not blob_url:
                    raise HTTPException(
                        status_code=500,
                        detail="Vercel Blob did not return a URL"
                    )
                
                return blob_url
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Network error during upload: {str(e)}"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {str(e)}"
            )
    
    async def delete_file(self, blob_url: str) -> bool:
        """
        Delete a file from Vercel Blob.
        
        Args:
            blob_url: The Vercel Blob URL of the file to delete
            
        Returns:
            True if deletion was successful
            
        Raises:
            HTTPException: If deletion fails
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.delete(
                    blob_url,
                    headers={
                        "Authorization": f"Bearer {self.token}",
                    }
                )
                
                # Consider 404 as success (file already deleted)
                if response.status_code not in [200, 204, 404]:
                    print(f"Warning: Blob deletion returned status {response.status_code}")
                    return False
                
                return True
                
        except Exception as e:
            print(f"Error deleting blob: {str(e)}")
            return False
