import apiService from './api';

export const bookService = {
  async getAllBooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/books?${queryString}`);
  },

  async getBookById(id) {
    return await apiService.get(`/books/${id}`);
  },

  async getBooksByGenre(genre) {
    return await apiService.get(`/books/genre/${genre}`);
  },

  async searchBooks(query) {
    return await apiService.get(`/books/search?q=${query}`);
  },

  async createBook(bookData) {
    return await apiService.post('/books', bookData);
  },

  async updateBook(id, bookData) {
    return await apiService.put(`/books/${id}`, bookData);
  },

  async deleteBook(id) {
    return await apiService.delete(`/books/${id}`);
  },

  async getPopularBooks() {
    return await apiService.get('/books/popular');
  },

  async getRecentBooks() {
    return await apiService.get('/books/recent');
  },

  async getIndieBooks(limit = 10) {
    return await apiService.get(`/books/indie?limit=${limit}`);
  },

  async getAcademicBooks(limit = 10) {
    return await apiService.get(`/books/academic?limit=${limit}`);
  },
};
