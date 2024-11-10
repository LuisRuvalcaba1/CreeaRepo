import React, { useState } from 'react';
import {
  validateFile,
  validateRequestDate,
  validateText,
  validateNumber,
  validateEmail,
} from '../../utils/validation';
import './FormQuestion.css';

const FormQuestion = ({ question, options, type, onAnswer, documentUpload }) => {
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warning, setWarning] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    const validation = validateFile(selectedFile);

    if (!validation.isValid) {
      setError(validation.errorMessage);
      setSuccessMessage(''); // Limpia el mensaje de éxito si hay un error
      setFile(null); // No se guarda el archivo si no es válido
    } else {
      setError('');
      setSuccessMessage('Archivo PDF subido correctamente.');
      setFile(selectedFile);
    }
  };

  const validateAnswer = () => {
    let validation = { isValid: true, errorMessage: '' };

    if (type === 'date') {
      validation = validateRequestDate(answer);
    } else if (type === 'number') {
      validation = validateNumber(parseFloat(answer));
    } else if (type === 'email') {
      validation = validateEmail(answer);
    } else if (type === 'text') {
      validation = validateText(answer);
    }

    if (!validation.isValid) {
      setError(validation.errorMessage);
      return false;
    }

    setError('');
    return true;
  };

  const handleAnswer = () => {
    const isValid = type === 'file' ? !!file : validateAnswer();

    if (!isValid) {
      setWarning('Por favor, contesta la pregunta antes de continuar.');
    } else {
      setWarning('');
      onAnswer({ answer, file });
    }
  };

  return (
    <div className="question-container">
      <h3 className="question-title">{question}</h3>

      {options ? (
        <div className="options-container">
          {options.map((option) => (
            <button
              key={option}
              className="option-button"
              onClick={() => setAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div>
          {type === 'text' && (
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input-field"
              placeholder="Ingrese texto"
            />
          )}
          {type === 'number' && (
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input-field"
              placeholder="Ingrese un número"
            />
          )}
          {type === 'date' && (
            <input
              type="date"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input-field"
            />
          )}

          {type === 'email' && (
            <input
              type="email"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input-field"
              placeholder="Ingrese su correo electrónico"
            />
          )}
          
          {type === 'file' && (
            <div className="file-upload-container">
              <label className="file-upload-label">
                Sube tu {documentUpload || 'archivo'}
              </label>
              <div className="file-upload-box">
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  className="file-input" 
                  id="file-upload" 
                  style={{ display: 'none' }} 
                />
                <button 
                  className="upload-button" 
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Seleccionar archivo
                </button>
              </div>
              {file && <p className="file-name">Archivo seleccionado: {file.name}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
              {error && <p className="error-message">{error}</p>}
            </div>
          )}
        </div>
      )}

      {warning && <p className="warning-message">{warning}</p>} 
      <button onClick={handleAnswer} disabled={!answer && !file} className="option-button">
        Siguiente
      </button>
    </div>
  );
};

export default FormQuestion;
