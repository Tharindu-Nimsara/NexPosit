// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password) => {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
};

// Post title validation (3-200 characters)
export const isValidPostTitle = (title) => {
  return title && title.length >= 3 && title.length <= 200;
};

// Name validation (not empty, max 255 chars)
export const isValidName = (name) => {
  return name && name.trim().length > 0 && name.length <= 255;
};

// Context/Project name validation (3-100 characters)
export const isValidContextName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

// Date validation helpers
export const isFutureDate = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

export const isWithin60Days = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60);

  return inputDate <= maxDate;
};
