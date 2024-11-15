// utils/pdfValidator.js

exports.isPDF = (file) => {
  const isValid = file.mimetype === 'application/pdf' || file.type === 'application/pdf';
  const sizeLimit = 5 * 1024 * 1024; // 5 MB
  return {
    isValid,
    errorMessage: !isValid ? 'El archivo debe ser un PDF' : file.size > sizeLimit ? 'El archivo no debe exceder 5 MB' : '',
  };
};
