// DocumentUpload.js

import React from 'react';
import './DocumentUpload.css';

const DocumentUpload = ({ onUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    } else {
      alert('Por favor, sube un archivo PDF.');
    }
  };

  return (
    <div className="upload-container">
      <label className="upload-label">Subir documento (PDF):</label>
      <input
        type="file"
        accept="application/pdf"
        className="upload-input"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default DocumentUpload;
