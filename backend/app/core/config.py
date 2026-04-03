from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Application
    APP_NAME: str = "Adhyaan API"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_HOST: str
    DATABASE_PORT: int = 6543
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://adhyaan.vercel.app,https://adhyaan.bishalshrestha52.com.np"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Email Configuration
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 465
    EMAIL_USER: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "Adhyaan"
    
    # Vercel Blob Storage Configuration
    BLOB_READ_WRITE_TOKEN: str = ""
    
    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB in bytes
    MAX_DOCUMENT_SIZE: int = 31457280  # 30MB in bytes
    MAX_COVER_SIZE: int = 15728640  # 15MB in bytes
    ALLOWED_DOCUMENT_TYPES: List[str] = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
    ALLOWED_BOOK_TYPES: List[str] = [".pdf", ".docx"]
    
    @property
    def database_url(self) -> str:
        """Construct PostgreSQL connection URL."""
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def documents_upload_dir(self) -> str:
        """Get documents upload directory path."""
        path = os.path.join(self.UPLOAD_DIR, "documents")
        os.makedirs(path, exist_ok=True)
        return path
    
    @property
    def books_upload_dir(self) -> str:
        """Get books upload directory path."""
        path = os.path.join(self.UPLOAD_DIR, "books")
        os.makedirs(path, exist_ok=True)
        return path
    
    @property
    def covers_upload_dir(self) -> str:
        """Get book covers upload directory path."""
        path = os.path.join(self.UPLOAD_DIR, "covers")
        os.makedirs(path, exist_ok=True)
        return path
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "../../.env")
        case_sensitive = True
        extra = "ignore"


# Global settings instance
settings = Settings()
