from typing import TypeVar, Generic, List
from pydantic import BaseModel


T = TypeVar('T')


class PaginationParams(BaseModel):
    """Standard pagination parameters."""
    page: int = 1
    page_size: int = 10
    
    def get_offset(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.page_size
    
    def get_limit(self) -> int:
        """Get limit for database query."""
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(cls, items: List[T], total: int, pagination: PaginationParams):
        """
        Create a paginated response.
        
        Args:
            items: List of items for current page
            total: Total number of items
            pagination: Pagination parameters
            
        Returns:
            PaginatedResponse instance
        """
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages,
            has_next=pagination.page < total_pages,
            has_prev=pagination.page > 1
        )
