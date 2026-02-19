from typing import Any, Optional
from fastapi.responses import JSONResponse
from fastapi import status


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK
) -> JSONResponse:
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
        
    Returns:
        JSONResponse with standardized format
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )


def error_response(
    message: str = "An error occurred",
    errors: Optional[dict] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        message: Error message
        errors: Optional dictionary of field-specific errors
        status_code: HTTP status code
        
    Returns:
        JSONResponse with standardized error format
    """
    content = {
        "success": False,
        "message": message
    }
    
    if errors:
        content["errors"] = errors
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )


def paginated_response(
    data: list,
    total: int,
    page: int = 1,
    page_size: int = 10,
    message: str = "Success"
) -> JSONResponse:
    """
    Create a paginated response.
    
    Args:
        data: List of items for current page
        total: Total number of items
        page: Current page number
        page_size: Items per page
        message: Success message
        
    Returns:
        JSONResponse with pagination metadata
    """
    total_pages = (total + page_size - 1) // page_size
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "message": message,
            "data": data,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
    )
