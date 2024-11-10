import React, { useState, useEffect } from 'react';
import './EventFormModal.css';

const EventFormModal = ({ show, onClose, onSave, initialData = {}, onDelete, selectedDate }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [time, setTime] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [eventType, setEventType] = useState('meeting');

  useEffect(() => {
    if (selectedDate) {
      // Inicializa la hora si es necesario
      const selectedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTime(selectedTime);
    }
  }, [selectedDate]);

  const handleSave = async () => {
    if (!time || !time.includes(':')) {
      alert('Por favor, introduce una hora válida.');
      return;
    }

    // Asegúrate de que la hora esté en formato "HH:MM"
    const [hours, minutes] = time.split(':');

    if (!hours || !minutes) {
      alert('Hora inválida. Por favor, introduce una hora válida.');
      return;
    }

    // Crea un nuevo objeto Date combinando la fecha y la hora
    const formattedStartDateTime = new Date(selectedDate);
    formattedStartDateTime.setHours(hours);
    formattedStartDateTime.setMinutes(minutes);

    if (isNaN(formattedStartDateTime.getTime())) {
      alert('Fecha u hora inválida.');
      return;
    }

    // Establece la duración del evento (ej. 1 hora)
    const endDateTime = new Date(formattedStartDateTime.getTime() + 60 * 60 * 1000);

    const eventData = {
      title,
      startDateTime: formattedStartDateTime.toISOString(), // Formato ISO válido
      endDateTime: endDateTime.toISOString(),
      clientEmail: eventType === 'meeting' ? clientEmail : '',
      advisorEmail: eventType === 'meeting' ? advisorEmail : '',
      eventType,
    };

    const response = await fetch('/api/calendar/save-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    if (response.ok) {
      onSave({ ...eventData, link: result.meetingLink || '' });
    } else {
      alert('Error al crear el evento: ' + result.error);
    }

    onClose();
  };

  return (
    show && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{initialData && initialData.id ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <input
            type="text"
            placeholder="Título del Evento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          {/* Mostrar los campos de correo solo si es un evento de Google Meet */}
          {eventType === 'meeting' && (
            <>
              <input
                type="email"
                placeholder="Correo del Cliente"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <input
                type="email"
                placeholder="Correo del Asesor"
                value={advisorEmail}
                onChange={(e) => setAdvisorEmail(e.target.value)}
              />
            </>
          )}

          <label>
            <input
              type="radio"
              value="meeting"
              checked={eventType === 'meeting'}
              onChange={() => setEventType('meeting')}
            />
            Crear Evento con Google Meet
          </label>
          <label>
            <input
              type="radio"
              value="event"
              checked={eventType === 'event'}
              onChange={() => setEventType('event')}
            />
            Crear solo un evento
          </label>

          <button onClick={handleSave}>Guardar</button>
          {initialData && initialData.id && (
            <button onClick={onDelete} className="delete-btn">Eliminar</button>
          )}
          <button onClick={onClose} className="cancel-btn">Cancelar</button>
        </div>
      </div>
    )
  );
};

export default EventFormModal;
