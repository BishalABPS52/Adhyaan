/**
 * Format genre string to proper capitalization
 * @param {string} genre - Genre string (e.g., "auto-biography", "fantasy")
 * @returns {string} - Properly formatted genre (e.g., "Auto-Biography", "Fantasy")
 */
export const formatGenre = (genre) => {
  if (!genre) return '';
  
  // Handle multi-word genres with hyphens or underscores
  return genre
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
};

/**
 * Format multiple genres separated by comma
 * @param {string} genres - Comma-separated genres
 * @returns {string} - Formatted genres
 */
export const formatGenres = (genres) => {
  if (!genres) return '';
  
  return genres
    .split(',')
    .map(genre => formatGenre(genre.trim()))
    .join(', ');
};
