// src/components/ScheduleMeetingForm.js
import React, { useState } from 'react';

const ScheduleMeetingForm = ({ onEventAdd }) => {
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const meetingDetails = {
      summary: 'Cita con Asesor',
      startDateTime,
      endDateTime,
      attendees: [{ email: clientEmail }],
    };

    try {
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingDetails),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Reunión creada con éxito. Aquí está el enlace: ${result.meetingLink}`);
        onEventAdd({
          title: 'Reunión programada con cliente',
          start: new Date(startDateTime),
          end: new Date(endDateTime),
          link: result.meetingLink,
        });
      } else {
        alert(`Error al crear la reunión: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al crear la reunión:', error);
      alert('Hubo un error al intentar programar la reunión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Fecha y Hora de Inicio:</label>
        <input
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Fecha y Hora de Fin:</label>
        <input
          type="datetime-local"
          value={endDateTime}
          onChange={(e) => setEndDateTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Correo Electrónico del Cliente:</label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit">Programar Reunión</button>
    </form>
  );
};

export default ScheduleMeetingForm;
