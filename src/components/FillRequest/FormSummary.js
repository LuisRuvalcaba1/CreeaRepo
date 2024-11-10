// FormSummary.js

import React from 'react';
import './FormSummary.css';

const FormSummary = ({ onStart }) => (
  <div className="summary-container">
    <h2 className="summary-title">Resumen de requisitos para llenar la solicitud</h2>
    <p className="summary-text">Revisa los requisitos y documentos necesarios antes de comenzar.

      Necesitarás tener a la mano:
      *Documento de Identificacion del contratante
      *Comprobante de domicilio del contratante
      (En caso de querer deducir impuestos)
      *Constancia de situación fiscal del contrantante
    </p>
    <button className="start-button" onClick={onStart}>Iniciar llenado de solicitud</button>
  </div>
);

export default FormSummary;
