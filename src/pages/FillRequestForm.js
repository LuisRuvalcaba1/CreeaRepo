// FillRequestForm.js

import React, { useState } from 'react';
import FormSummary from '../components/FillRequest/FormSummary';
import FormNavigator from '../components/FillRequest/FormNavigator';
import FormComplete from '../components/FillRequest/FormComplete';

const FillRequestForm = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleStart = () => {
    console.log("Iniciando llenado de solicitud...");
    setStarted(true);
  };

  const handleComplete = () => {
    console.log("Solicitud completada.");
    setCompleted(true);
  };

  return (
    <div>
      {!started && <FormSummary onStart={handleStart} />}
      {started && !completed && <FormNavigator startNode={0} onComplete={handleComplete} />}
      {completed && <FormComplete onSubmit={() => alert('Solicitud Enviada')} />}
    </div>
  );
};

export default FillRequestForm;
