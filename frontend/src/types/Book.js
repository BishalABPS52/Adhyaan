// Book Type Definition
export const BookType = {
  id: 'string',
  title: 'string',
  author: 'string',
  authorId: 'string',
  description: 'string',
  coverImage: 'string',
  genre: 'string',
  publishedDate: 'date',
  isPremium: 'boolean',
  totalPages: 'number',
  language: 'string',
  rating: 'number',
  totalReads: 'number',
  tags: 'array',
  category: 'string', // 'indie' or 'academic'
  createdAt: 'date',
};

export const createBook = (data) => ({
  id: data.id || '',
  title: data.title || '',
  author: data.author || '',
  authorId: data.authorId || '',
  description: data.description || '',
  coverImage: data.coverImage || '/images/default-book.png',
  genre: data.genre || '',
  publishedDate: data.publishedDate || new Date(),
  isPremium: data.isPremium || false,
  totalPages: data.totalPages || 0,
  language: data.language || 'English',
  rating: data.rating || 0,
  totalReads: data.totalReads || 0,
  tags: data.tags || [],
  category: data.category || 'indie',
  createdAt: data.createdAt || new Date(),
});
