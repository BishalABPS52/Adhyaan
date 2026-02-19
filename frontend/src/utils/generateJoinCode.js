// Generate unique join code for study rooms
export const generateJoinCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Validate join code format
export const validateJoinCode = (code) => {
  return /^[A-Z0-9]{6}$/.test(code);
};
