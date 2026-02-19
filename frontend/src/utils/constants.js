// Application Constants

export const APP_NAME = 'Adhyaan – Study & Learn';

export const COLORS = {
  PRIMARY: '#1F5FA8',
  ACCENT: '#F4C430',
  BG_DARK: '#0E1621',
  BG_LIGHT: '#F9FAFB',
  TEXT_PRIMARY_LIGHT: '#0F172A',
  TEXT_PRIMARY_DARK: '#E5E7EB',
  TEXT_MUTED: '#64748B',
  BORDER: '#E5E7EB',
  WHITE: '#FFFFFF',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
};

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Self-Help',
  'Business',
  'Technology',
  'Education',
  'Poetry',
  'Drama',
];

export const BOARDS = {
  NEB: 'National Examination Board',
  TU: 'Tribhuvan University',
  PU: 'Pokhara University',
  KU: 'Kathmandu University',
  IOE: 'Institute of Engineering',
};

export const LEVELS = {
  PRIMARY: 'Primary (Class 1-8)',
  SECONDARY: 'Secondary (Class 9-12)',
  UNDERGRADUATE: 'Undergraduate (Bachelor)',
};

export const USER_ROLES = {
  READER: 'reader',
  AUTHOR: 'author',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Reader Routes
  READER_GENRES: '/reader/genres',
  READER_BOOKS: '/reader/books',
  READER_BOOKMARKS: '/reader/bookmarks',
  READER_HISTORY: '/reader/history',
  
  // Study Routes
  STUDY_BOARDS: '/study/boards',
  STUDY_LEVELS: '/study/levels',
  STUDY_CLASSES: '/study/classes',
  STUDY_SUBJECTS: '/study/subjects',
  STUDY_SYLLABUS: '/study/syllabus',
  STUDY_BOOKS: '/study/books',
  
  // Study Room Routes
  STUDY_ROOM_CREATE: '/study-room/create',
  STUDY_ROOM_JOIN: '/study-room/join',
  
  // Dashboard Routes
  DASHBOARD_STUDENT: '/dashboard/student',
  DASHBOARD_AUTHOR: '/dashboard/author',
  
  // Author Routes
  AUTHOR_CREATE_BOOK: '/author/create-book',
  AUTHOR_DRAFTS: '/author/drafts',
  AUTHOR_ANALYTICS: '/author/analytics',
  AUTHOR_PROFILE: '/author/profile',
  
  // Other Routes
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  HELP: '/help',
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  BOOKS: '/books',
  STUDY_ROOMS: '/study-rooms',
  USERS: '/users',
  COURSES: '/courses',
};
