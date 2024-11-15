// FillRequestForm.js

import React, { useState, useEffect } from 'react';
import FormSummary from '../components/FillRequest/FormSummary';
import FormNavigator from '../components/FillRequest/FormNavigator';
import FormComplete from '../components/FillRequest/FormComplete';

const FillRequestForm = ({ userData }) => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [prefilledData, setPrefilledData] = useState({});

  const handleStart = () => {
    console.log("Iniciando llenado de solicitud...");
    setStarted(true);
  };

  const handleComplete = () => {
    console.log("Solicitud completada.");
    setCompleted(true);
  };

  const handleSelection = (isBoth) => {
    if (isBoth) {
      // Prellenar datos si es contratante y asegurado
      setPrefilledData({
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        correo: userData.correo,
        telefono: userData.telefono,
        nacionalidad: userData.nacionalidad,
        fechaNacimiento: userData.fechaNacimiento,
        ocupacion: userData.ocupacion,
      });
    } else {
      // Prellenar solo contratante, solicitar datos del asegurado
      setPrefilledData({
        contratante: {
          nombre: userData.nombre,
          apellidoPaterno: userData.apellidoPaterno,
          apellidoMaterno: userData.apellidoMaterno,
          correo: userData.correo,
          telefono: userData.telefono,
          nacionalidad: userData.nacionalidad,
          fechaNacimiento: userData.fechaNacimiento,
          ocupacion: userData.ocupacion,
        },
        asegurado: {},
      });
    }
  };

  useEffect(() => {
    if (userData) {
      console.log("Datos del usuario cargados:", userData);
    }
  }, [userData]);

  return (
    <div>
      {!started && (
        <FormSummary
          onStart={handleStart}
          onSelection={(isBoth) => handleSelection(isBoth)}
        />
      )}
      {started && !completed && (
        <FormNavigator
          startNode={0}
          onComplete={handleComplete}
          prefilledData={prefilledData}
        />
      )}
      {completed && <FormComplete onSubmit={() => alert('Solicitud Enviada')} />}
    </div>
  );
};

export default FillRequestForm;
