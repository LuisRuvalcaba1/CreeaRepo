import React, { useState, useEffect } from 'react';
import './EventFormModal.css';

const EventFormModal = ({ show, onClose, onSave, initialData = {}, onDelete, selectedDate }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [link, setLink] = useState(initialData?.link || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedDate) {
      const selectedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTime(selectedTime);
      setEndTime(selectedTime); // Inicializar hora de término igual a la de inicio
    }
    if (initialData?.time) setTime(initialData.time);
    if (initialData?.endTime) setEndTime(initialData.endTime);
    if (initialData?.link) setLink(initialData.link);
  }, [selectedDate, initialData]);

  const handleSave = async () => {
    // Limpiar errores previos
    setError('');

    const userId = sessionStorage.getItem('userId'); // Obtener userId del sessionStorage
    const clientId = sessionStorage.getItem('clientId'); // Obtener clientId del sessionStorage

    if (!userId) {
      setError('No se encontró el userId. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!title) {
      setError('El título es obligatorio.');
      return;
    }

    if (!time || !time.includes(':')) {
      setError('Por favor, introduce una hora de inicio válida.');
      return;
    }

    if (!endTime || !endTime.includes(':')) {
      setError('Por favor, introduce una hora de término válida.');
      return;
    }

    const [startHours, startMinutes] = time.split(':');
    const [endHours, endMinutes] = endTime.split(':');

    const formattedStartDateTime = new Date(selectedDate);
    formattedStartDateTime.setHours(startHours);
    formattedStartDateTime.setMinutes(startMinutes);

    const formattedEndDateTime = new Date(selectedDate);
    formattedEndDateTime.setHours(endHours);
    formattedEndDateTime.setMinutes(endMinutes);

    if (isNaN(formattedStartDateTime.getTime()) || isNaN(formattedEndDateTime.getTime())) {
      setError('Fecha u hora inválida.');
      return;
    }

    if (formattedStartDateTime >= formattedEndDateTime) {
      setError('La hora de término debe ser posterior a la hora de inicio.');
      return;
    }

    const eventData = {
      title,
      time,
      startDateTime: formattedStartDateTime.toISOString(),
      endDateTime: formattedEndDateTime.toISOString(),
      eventType,
      createdBy: userId,
      clientId: clientId || null,
      attendees: [],
    };

    try {
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();
      onSave({
        title,
        time,
        start: formattedStartDateTime,
        end: formattedEndDateTime,
        link: result.meetingLink || '', // Incluye el enlace del Meet si existe
      });
      setLink(result.meetingLink || '');
    } catch (error) {
      console.error('Error al crear el evento:', error);
      setError(`Error al crear el evento: ${error.message}`);
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
            placeholder="Hora de Inicio"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="Hora de Término"
          />
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
          {link && (
            <div className="meet-link">
              <a href={link} target="_blank" rel="noopener noreferrer">
                Ir a la videollamada de Google Meet
              </a>
            </div>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleSave}>Guardar</button>
          {initialData && initialData.id && (
            <button onClick={onDelete} className="delete-btn">
              Eliminar
            </button>
          )}
          <button onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    )
  );
};

export default EventFormModal;
