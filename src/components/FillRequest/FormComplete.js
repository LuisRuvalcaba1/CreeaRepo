// FormComplete.js

import React from 'react';
import './FormComplete.css';

const FormComplete = ({ onSubmit }) => (
  <div className="complete-container">
    <h3 className="complete-title">Revisión Final</h3>
    <p className="complete-text">Revisa y confirma la información ingresada antes de enviar la solicitud.</p>
    <button className="submit-button" onClick={onSubmit}>Enviar Solicitud</button>
  </div>
);

export default FormComplete;
