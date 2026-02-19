import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from pathlib import Path
from app.core.config import settings


class FileUploadHandler:
    """Handle file uploads with validation."""
    
    @staticmethod
    async def save_file(
        file: UploadFile,
        subdirectory: str = "books",
        allowed_types: Optional[List[str]] = None,
        max_size: int = settings.MAX_FILE_SIZE
    ) -> str:
        """
        Save an uploaded file with validation.
        
        Args:
            file: The uploaded file
            subdirectory: Subdirectory within uploads (books, documents, covers, syllabus)
            allowed_types: List of allowed file extensions (if None, uses default)
            max_size: Maximum file size in bytes
            
        Returns:
            Relative file path
        """
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Default allowed types and max size based on subdirectory
        if allowed_types is None:
            if subdirectory in ["books", "syllabus"]:
                allowed_types = [".pdf", ".docx", ".doc"]
                max_size = settings.MAX_DOCUMENT_SIZE
            elif subdirectory == "covers":
                allowed_types = [".jpg", ".jpeg", ".png"]
                max_size = settings.MAX_COVER_SIZE
            elif subdirectory == "documents":
                allowed_types = [".pdf", ".jpg", ".jpeg", ".png", ".docx"]
                max_size = settings.MAX_DOCUMENT_SIZE
            else:
                allowed_types = settings.ALLOWED_EXTENSIONS.split(',')
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Check file size
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        upload_dir = os.path.join(settings.UPLOAD_DIR, subdirectory)
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Ensure directory exists
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return relative path for database storage
        return f"{subdirectory}/{unique_filename}"
    
    @staticmethod
    async def save_multiple_files(
        files: List[UploadFile],
        upload_dir: str,
        allowed_types: List[str],
        max_size: int = settings.MAX_FILE_SIZE
    ) -> List[dict]:
        """
        Save multiple uploaded files.
        
        Args:
            files: List of uploaded files
            upload_dir: Directory to save the files
            allowed_types: List of allowed file extensions
            max_size: Maximum file size in bytes
            
        Returns:
            List of dicts with file information
        """
        saved_files = []
        
        for file in files:
            file_info = await FileUploadHandler.save_file(
                file, upload_dir, allowed_types, max_size
            )
            saved_files.append(file_info)
        
        return saved_files
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete a file from the filesystem.
        
        Args:
            file_path: Path to the file to delete
            
        Returns:
            True if deleted, False if file doesn't exist
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
    
    @staticmethod
    def delete_multiple_files(file_paths: List[str]) -> int:
        """
        Delete multiple files from the filesystem.
        
        Args:
            file_paths: List of file paths to delete
            
        Returns:
            Number of files successfully deleted
        """
        deleted_count = 0
        for file_path in file_paths:
            if FileUploadHandler.delete_file(file_path):
                deleted_count += 1
        return deleted_count
