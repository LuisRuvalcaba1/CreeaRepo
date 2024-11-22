import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EventCalendar from './EventCalendar';
import axios from 'axios';
import './AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [expandedClient, setExpandedClient] = useState(null);
  const [events, setEvents] = useState([]);
  const [visibleClients, setVisibleClients] = useState(5); 
  const [filter, setFilter] = useState({ status: '', occupation: '', gender: '' });
  const [note, setNote] = useState('');
  const [exchangeRates] = useState({ usd: 20.50, udi: 6.50 });
  const navigate = useNavigate();
  const advisorId = sessionStorage.getItem('userId'); 
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notifiedEvents, setNotifiedEvents] = useState([]);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    startDateTime: '',
    endDateTime: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/api/get-events?advisorId=${advisorId}`);
        const upcomingEvents = response.data.filter((event) => {
          const eventDate = new Date(event.start);
          const now = new Date();
          const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Próximas 24 horas
          return eventDate >= now && eventDate <= oneDayAhead;
        });
  
        // Filtrar eventos ya notificados
        const newEvents = upcomingEvents.filter(
          (event) => !notifiedEvents.some((notified) => notified.id === event.id)
        );
  
        if (newEvents.length > 0) {
          alert(`Tienes ${newEvents.length} eventos programados en las próximas 24 horas.`);
          setNotifiedEvents([...notifiedEvents, ...newEvents]); // Agregar los nuevos eventos al estado
        }
  
        setEvents(response.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
        })));
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };
  
    fetchEvents();
  }, [advisorId, notifiedEvents]); // La dependencia incluye `notifiedEvents`

  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.correo_electronico.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(client =>
      (!filter.status || client.estado_cuenta === filter.status) &&
      (!filter.occupation || client.ocupacion === filter.occupation) &&
      (!filter.gender || client.sexo === filter.gender)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients, filter]);

  const handleNavigateFinancialProjection = () => {
    navigate('/financial-projection');
  };

  const handleNavigateFormFill = () => {
    navigate('/fill-request');
  };

  const handleNavigateInteractiveBoard = () => {
    navigate('/pizarra');
  };

  const handleNavigateCalculator = () => {
    navigate('/calculator');
  };


  const toggleExpandClient = (id) => {
    setExpandedClient(expandedClient === id ? null : id);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleRegisterNote = async (clientId) => {
    if (note.length > 255) {
      alert('La nota no puede exceder los 255 caracteres.');
    } else {
      try {
        await axios.post('/api/save-note', {
          id_cliente: clientId,
          id_asesor: advisorId,
          contenido: note
        });
        alert('Nota guardada exitosamente.');
        setNote('');
      } catch (error) {
        console.error('Error al guardar la nota:', error);
        alert('Error al guardar la nota.');
      }
    }
  };

  const showMoreClients = () => {
    setVisibleClients(visibleClients + 5); 
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      // Modo edición
      setEditingEvent(event);
      setMeetingDetails({
        title: event.title,
        startDateTime: event.start.toISOString().slice(0, 16),
        endDateTime: event.end.toISOString().slice(0, 16),
      });
      setSelectedClient(clients.find(client => client.id_cliente === event.clientId) || null);
    } else {
      // Modo creación
      setEditingEvent(null);
      setMeetingDetails({ title: '', startDateTime: '', endDateTime: '' });
      setSelectedClient(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setMeetingDetails({ title: '', startDateTime: '', endDateTime: '' });
  };
  
  const handleScheduleMeeting = async () => {
    if (!selectedClient || !meetingDetails.title || !meetingDetails.startDateTime || !meetingDetails.endDateTime) {
      alert('Por favor, complete todos los campos.');
      return;
    }
  
    try {
      if (editingEvent) {
        // Editar evento existente
        await axios.put(`/api/calendar/update-event/${editingEvent.id}`, {
          title: meetingDetails.title,
          startDateTime: meetingDetails.startDateTime,
          endDateTime: meetingDetails.endDateTime,
          clientId: selectedClient.id_cliente,
        });
        alert('Evento actualizado exitosamente.');
      } else {
        // Crear nuevo evento
        await axios.post('/api/calendar/create-event', {
          title: meetingDetails.title,
          startDateTime: meetingDetails.startDateTime,
          endDateTime: meetingDetails.endDateTime,
          clientId: selectedClient.id_cliente,
          createdBy: advisorId,
        });
        alert('Reunión programada exitosamente.');
      }
  
      // Recargar eventos después de la operación
      const response = await axios.get(`/api/get-events?advisorId=${advisorId}`);
      setEvents(response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
  
      handleCloseModal();
    } catch (error) {
      console.error('Error al programar la reunión:', error);
      alert('Error al programar la reunión.');
    }
  };
  
  return (
    <div className="advisor-dashboard">
      <Header />
      <div className="main-content">
        <div className="left-section">
          <div className="clients-section container">
            <h2>Listado de Clientes</h2>
            <input
              type="text"
              placeholder="Buscar por nombre o correo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <div className="filters">
              <select name="status" onChange={handleFilterChange} className="filter-dropdown">
                <option value="">Estado</option>
                <option value="activo">Activo</option>
                <option value="en proceso">En proceso</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <select name="occupation" onChange={handleFilterChange} className="filter-dropdown">
                <option value="">Ocupación</option>
                <option value="profesion">Profesión</option>
                <option value="empleo">Empleado</option>
              </select>
              <select name="gender" onChange={handleFilterChange} className="filter-dropdown">
                <option value="">Sexo</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
              </select>
            </div>

            {filteredClients.slice(0, visibleClients).map((client) => (
              <div key={client.id_cliente} className="client">
                <div onClick={() => toggleExpandClient(client.id_cliente)}>
                  <span className="bold">{client.nombre_completo}</span> - {client.estado_cuenta}
                </div>
                {expandedClient === client.id_cliente && (
                  <ul className="client-details">
                    <li>Email: {client.correo_electronico}</li>
                    <li>Estado: {client.estado_cuenta}</li>
                    <li>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength="255"
                        placeholder="Escribe una nota (máx 255 caracteres)"
                        className="note-textarea"
                      />
                      <button onClick={() => handleRegisterNote(client.id_cliente)}>
                        Guardar Nota
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ))}

            {visibleClients < filteredClients.length && (
              <button onClick={showMoreClients} className="load-more-btn">
                Cargar más clientes
              </button>
            )}
          </div>
          <button className="financial-projection-btn container"onClick={handleNavigateCalculator}>
            Calculadora de Riesgo
            </button>
          <button className="financial-projection-btn container" onClick={handleNavigateFinancialProjection}>
            Rendimientos Financieros
          </button>
          <button className="financial-projection-btn container" onClick={handleNavigateFormFill}>
            Llenado de Solicitud
          </button>
          <button className="financial-projection-btn container" onClick={handleNavigateInteractiveBoard}>
            Pizarron Interactivo
          </button>
        </div>
        <div className="right-section">
          <div className="agenda-section container">
            <h2>Calendario</h2>
            <EventCalendar
              events={events}
              onEventAdd={() => handleOpenModal()} // Crear nuevo evento
              onEventEdit={(event) => handleOpenModal(event)} // Editar evento existente
              onEventDelete={(event) => setEvents(events.filter(ev => ev.id !== event.id))} // Eliminar evento
            />
          </div>

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Agendar Reunión</h2>
                <label>
                  Cliente:
                  <select
                    onChange={(e) => setSelectedClient(clients.find(client => client.id_cliente === parseInt(e.target.value)))}
                  >
                    <option value="">Seleccione un cliente</option>
                    {clients.map(client => (
                      <option key={client.id_cliente} value={client.id_cliente}>
                        {client.nombre_completo}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Título:
                  <input
                    type="text"
                    value={meetingDetails.title}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, title: e.target.value })}
                  />
                </label>
                <label>
                  Fecha y Hora de Inicio:
                  <input
                    type="datetime-local"
                    value={meetingDetails.startDateTime}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, startDateTime: e.target.value })}
                  />
                </label>
                <label>
                  Fecha y Hora de Término:
                  <input
                    type="datetime-local"
                    value={meetingDetails.endDateTime}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, endDateTime: e.target.value })}
                  />
                </label>
                <div className="modal-actions">
                  <button onClick={handleScheduleMeeting}>Agendar</button>
                  <button onClick={handleCloseModal}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="exchange-rate-section container">
            <h2>Tipo de Cambio</h2>
            <p>Dólar: {exchangeRates.usd.toFixed(2)} MXN</p>
            <p>UDI: {exchangeRates.udi.toFixed(2)} MXN</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdvisorDashboard;
