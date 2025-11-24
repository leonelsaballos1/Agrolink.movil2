// utils/validations.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6; // mínimo 6 caracteres
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{8,15}$/; // solo números de 8 a 15 dígitos
  return phoneRegex.test(phone);
};
