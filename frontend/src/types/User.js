// User Type Definition
export const UserType = {
  id: 'string',
  email: 'string',
  name: 'string',
  profileImage: 'string',
  role: 'reader', // 'reader' or 'author'
  createdAt: 'date',
  updatedAt: 'date',
};

// Example User object structure
export const createUser = (data) => ({
  id: data.id || '',
  email: data.email || '',
  name: data.name || '',
  profileImage: data.profileImage || '/images/default-avatar.png',
  role: data.role || 'reader',
  createdAt: data.createdAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
});
