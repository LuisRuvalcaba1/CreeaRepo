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
      setTime(selectedTime || '00:00'); // Valor predeterminado
      setEndTime(selectedTime || '00:00'); // Inicializa con el mismo valor predeterminado
    }
  
    if (initialData?.time) setTime(initialData.time);
    if (initialData?.endTime) setEndTime(initialData.endTime);
    if (initialData?.link) setLink(initialData.link);
  }, [selectedDate, initialData]);
  

  const handleSave = async () => {
    setError(''); // Limpiar errores previos
  
    const userId = sessionStorage.getItem('userId');
    const clientId = sessionStorage.getItem('clientId');
  
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
  
    let startHours, startMinutes, endHours, endMinutes;
    try {
      [startHours, startMinutes] = time.split(':').map(Number);
      [endHours, endMinutes] = endTime.split(':').map(Number);
    } catch (err) {
      console.error('Error al dividir los valores de tiempo:', { time, endTime });
      setError('Error al procesar las horas. Verifica el formato.');
      return;
    }
  
    const formattedStartDateTime = new Date(selectedDate);
    formattedStartDateTime.setHours(startHours, startMinutes);
  
    const formattedEndDateTime = new Date(selectedDate);
    formattedEndDateTime.setHours(endHours, endMinutes);
  
    if (formattedStartDateTime >= formattedEndDateTime) {
      setError('La hora de término debe ser posterior a la hora de inicio.');
      return;
    }
  
    const eventData = {
      title,
      startDateTime: formattedStartDateTime.toISOString(),
      endDateTime: formattedEndDateTime.toISOString(),
      eventType,
      createdBy: userId,
      clientId: clientId || null,
      attendees: [],
    };
  
    console.log('Datos enviados al backend:', eventData);
  
    try {
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido.');
      }
  
      const result = await response.json();
      onSave({
        title,
        start: formattedStartDateTime,
        end: formattedEndDateTime,
        link: result.meetingLink || '',
      });
    } catch (error) {
      console.error('Error al crear el evento:', error.message);
      setError(error.message); // Mostrar el mensaje específico del backend
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
            value={time || '00:00'} // Valor predeterminado
            onChange={(e) => setTime(e.target.value)}
            placeholder="Hora de Inicio"
          />
          <input
            type="time"
            value={endTime || '00:00'} // Valor predeterminado
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
