// validations.js

const MAX_FILE_SIZE_MB = 5; // Tamaño máximo de archivo en MB
const ALLOWED_FILE_TYPE = 'application/pdf'; // Solo PDF

/**
 * Valida campos de texto con un límite de caracteres.
 * @param {string} text - Texto a validar.
 * @param {number} maxLength - Longitud máxima permitida.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validateText = (text, maxLength = 50) => {
  const errors = {};
  if (!text) {
    errors.isValid = false;
    errors.errorMessage = 'Este campo es obligatorio.';
    return errors;
  }
  if (text.length > maxLength) {
    errors.isValid = false;
    errors.errorMessage = `El texto no debe exceder ${maxLength} caracteres.`;
    return errors;
  }
  errors.isValid = true;
  return errors;
};

/**
 * Valida números, asegurando que estén dentro de un rango específico.
 * @param {number} number - Número a validar.
 * @param {number} min - Mínimo permitido.
 * @param {number} max - Máximo permitido.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validateNumber = (number, min = 0, max = 1000000) => {
  const errors = {};
  if (isNaN(number)) {
    errors.isValid = false;
    errors.errorMessage = 'Debe ser un número válido.';
    return errors;
  }
  if (number < min || number > max) {
    errors.isValid = false;
    errors.errorMessage = `El número debe estar entre ${min} y ${max}.`;
    return errors;
  }
  errors.isValid = true;
  return errors;
};

/**
 * Valida que la fecha de solicitud no sea posterior al día actual.
 * @param {string} date - Fecha de solicitud en formato YYYY-MM-DD.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validateRequestDate = (date) => {
  const errors = {};
  const inputDate = new Date(date);
  const today = new Date();
  
  if (isNaN(inputDate.getTime())) {
    errors.isValid = false;
    errors.errorMessage = 'Fecha inválida.';
    return errors;
  }
  
  // Verificar si la fecha es posterior a hoy
  if (inputDate > today) {
    errors.isValid = false;
    errors.errorMessage = 'La fecha de solicitud no puede ser posterior al día actual.';
    return errors;
  }

  errors.isValid = true;
  return errors;
};

/**
 * Valida una fecha y verifica si es mayor de edad.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validateDate = (date) => {
  const errors = {};
  const inputDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - inputDate.getFullYear();
  const monthDiff = today.getMonth() - inputDate.getMonth();
  const dayDiff = today.getDate() - inputDate.getDate();

  if (isNaN(inputDate.getTime())) {
    errors.isValid = false;
    errors.errorMessage = 'Fecha inválida.';
    return errors;
  }

  if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
    errors.isValid = false;
    errors.errorMessage = 'Debe ser mayor de edad.';
    return errors;
  }
  errors.isValid = true;
  return errors;
};

/**
 * Valida un correo electrónico.
 * @param {string} email - Email a validar.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validateEmail = (email) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.isValid = false;
    errors.errorMessage = 'Este campo es obligatorio.';
    return errors;
  }

  if (!emailRegex.test(email)) {
    errors.isValid = false;
    errors.errorMessage = 'El formato del correo es inválido.';
    return errors;
  }
  errors.isValid = true;
  return errors;
};

/**
 * Valida un número de teléfono.
 * @param {string} phone - Número de teléfono a validar.
 * @returns {Object} - Objeto con 'isValid' y 'errorMessage' si no es válido.
 */
export const validatePhone = (phone) => {
  const errors = {};
  const phoneRegex = /^\d{10}$/; // Asume números de 10 dígitos

  if (!phone) {
    errors.isValid = false;
    errors.errorMessage = 'Este campo es obligatorio.';
    return errors;
  }

  if (!phoneRegex.test(phone)) {
    errors.isValid = false;
    errors.errorMessage = 'El número de teléfono debe tener 10 dígitos.';
    return errors;
  }
  errors.isValid = true;
  return errors;
};

/**
 * Valida un archivo para asegurarse de que sea PDF y no supere el tamaño máximo permitido.
 * @param {File} file - El archivo a validar.
 * @returns {Object} - Objeto con 'isValid' y, si no es válido, 'errorMessage'.
 */
export const validateFile = (file) => {
  const errors = {};

  if (!file) {
    errors.isValid = false;
    errors.errorMessage = 'Por favor, sube un archivo.';
    return errors;
  }

  // Validar tipo de archivo
  if (file.type !== ALLOWED_FILE_TYPE) {
    errors.isValid = false;
    errors.errorMessage = 'El archivo debe ser un PDF.';
    return errors;
  }

  // Validar tamaño de archivo
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > MAX_FILE_SIZE_MB) {
    errors.isValid = false;
    errors.errorMessage = `El archivo no debe exceder los ${MAX_FILE_SIZE_MB} MB.`;
    return errors;
  }

  errors.isValid = true;
  return errors;
};
