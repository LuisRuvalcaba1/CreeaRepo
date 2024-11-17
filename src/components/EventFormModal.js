import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventFormModal.css';

const EventFormModal = ({ show, onClose, onSave, initialData = {}, onDelete, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && selectedDate) {
      // Crear fecha inicial (hora actual)
      const startDate = new Date(selectedDate);
      startDate.setMinutes(Math.ceil(startDate.getMinutes() / 15) * 15); // Redondear a los próximos 15 minutos
      
      // Crear fecha final (1 hora después)
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      // Formatear fechas para el input datetime-local
      setStartDateTime(startDate.toISOString().slice(0, 16));
      setEndDateTime(endDate.toISOString().slice(0, 16));

      // Cargar clientes
      const loadClients = async () => {
        const advisorId = sessionStorage.getItem('userId');
        try {
          const response = await axios.get(`/api/calendar/get-clients-asesor?advisorId=${advisorId}`);
          setClients(response.data);
        } catch (error) {
          console.error('Error al cargar clientes:', error);
          setError('Error al cargar la lista de clientes');
        }
      };

      loadClients();
    }
  }, [show, selectedDate]);

  // Limpiar el formulario cuando se cierra
  useEffect(() => {
    if (!show) {
      setTitle('');
      setStartDateTime('');
      setEndDateTime('');
      setEventType('meeting');
      setLink('');
      setError('');
      setSelectedClient(null);
    }
  }, [show]);

  const handleSave = async () => {
    setError('');
    setLoading(true);
    const advisorId = sessionStorage.getItem('userId');

    try {
      if (!title.trim()) {
        throw new Error('El título es obligatorio');
      }

      if (!selectedClient) {
        throw new Error('Por favor, seleccione un cliente');
      }

      if (!startDateTime || !endDateTime) {
        throw new Error('Las fechas de inicio y término son obligatorias');
      }

      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      if (start >= end) {
        throw new Error('La hora de término debe ser posterior a la hora de inicio');
      }

      const eventData = {
        title: title.trim(),
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        eventType,
        createdBy: parseInt(advisorId),
        clientId: parseInt(selectedClient.id_cliente),
        attendees: [{ email: selectedClient.correo_electronico }]
      };

      const response = await axios.post('/api/calendar/create-event', eventData);
      console.log('Evento creado:', response.data);

      onSave({
        title: eventData.title,
        start,
        end,
        clientId: selectedClient.id_cliente,
        clientName: selectedClient.nombre_completo,
        meetLink: response.data.eventData.meetLink
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData?.id ? 'Editar Evento' : 'Nuevo Evento'}</h2>

        <div className="form-group">
          <label>Cliente:</label>
          <select
            value={selectedClient?.id_cliente || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id_cliente === parseInt(e.target.value));
              setSelectedClient(client || null);
            }}
            disabled={loading}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clients.map(client => (
              <option key={client.id_cliente} value={client.id_cliente}>
                {client.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del Evento"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y Hora de Inicio:</label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y Hora de Término:</label>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de Evento:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="meeting"
                checked={eventType === 'meeting'}
                onChange={() => setEventType('meeting')}
                disabled={loading}
              />
              Crear Evento con Google Meet
            </label>
            <label>
              <input
                type="radio"
                value="event"
                checked={eventType === 'event'}
                onChange={() => setEventType('event')}
                disabled={loading}
              />
              Crear solo un evento
            </label>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button 
            onClick={handleSave} 
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;