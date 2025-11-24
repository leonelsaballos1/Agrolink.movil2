// utils/validations.js

// Validación de correo electrónico
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de número nicaragüense (8 dígitos)
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Validación de nombre (no vacío)
const validateName = (name) => {
  return name.trim().length > 0;
};


