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
  const [exchangeRates, setExchangeRates] = useState({});
  const [visibleClients, setVisibleClients] = useState(5); 
  const [filter, setFilter] = useState({ status: '', occupation: '', gender: '' });
  const [note, setNote] = useState('');
  const navigate = useNavigate();
  const advisorId = sessionStorage.getItem('userId'); 

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`/api/get-clients?advisorId=${advisorId}`);
        setClients(response.data);
        setFilteredClients(response.data); 
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
    fetchClients();
  }, [advisorId]);

  // Búsqueda y filtrado de clientes (RQF11 y RQNF29)
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

  const toggleExpandClient = (id) => {
    setExpandedClient(expandedClient === id ? null : id);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  // Programar reuniones (RQF12 y RQNF31)
  const handleProgramMeeting = async (clientId) => {
    const meetingDate = prompt("Ingrese la fecha y hora de la reunión (YYYY-MM-DD HH:MM):");
    if (meetingDate) {
      const existingEvent = events.find(event => event.start.toISOString().startsWith(meetingDate));
      if (existingEvent) {
        alert('La fecha seleccionada ya tiene una reunión programada.');
      } else {
        alert(`Reunión programada con el cliente ID: ${clientId} en ${meetingDate}`);
        const newEvent = {
          id: events.length + 1,
          title: `Reunión con Cliente ${clientId}`,
          start: new Date(`${meetingDate}`),
          end: new Date(`${meetingDate}`),
        };
        setEvents([...events, newEvent]);
      }
    }
  };

  // Registrar notas (RQF12, RQNF32)
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

  // Enviar correos (RQF12, RQNF30, RQNF34)
  const handleSendEmail = async (clientEmail) => {
    if (!clients.some((client) => client.correo_electronico === clientEmail)) {
      alert("El correo no está registrado en la base de datos.");
    } else if (window.confirm(`¿Desea enviar un correo a ${clientEmail}?`)) {
      try {
        await axios.post('/api/send-email', {
          email: clientEmail,
          subject: 'Asunto del Correo Deseado',
          message: 'Mensaje personalizado que deseas enviar al cliente'
        });
        alert(`Correo enviado a ${clientEmail}`);
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        alert('Error al enviar el correo');
      }
    }
  };

  // Cargar más clientes
  const showMoreClients = () => {
    setVisibleClients(visibleClients + 5); 
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
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
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
                    <li>Teléfono: {client.telefono}</li>
                    <li>Estado: {client.estado_cuenta}</li>
                    <li>
                      <button onClick={() => handleSendEmail(client.correo_electronico)}>
                        Enviar Correo
                      </button>
                      <button onClick={() => handleProgramMeeting(client.id_cliente)}>
                        Programar Reunión
                      </button>
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
          <button className="risk-calculator-btn container">Calculadora de Riesgo</button>
          <button className="financial-projection-btn container" onClick={handleNavigateFinancialProjection}>
              Rendimientos Financieros
            </button>
          <button className="payments-btn container">Pagos</button>
          <button className="form-fill-btn container" onClick={handleNavigateFormFill}>
          Llenado de Solicitud
        </button>
        </div>
        <div className="right-section">
          <div className="agenda-section container">
            <h2>Calendario</h2>
            <EventCalendar
              events={events}
              onEventAdd={(e) => setEvents([...events, e])}
              onEventEdit={(e) => setEvents(events.map(ev => ev.id === e.id ? e : ev))}
              onEventDelete={(e) => setEvents(events.filter(ev => ev.id !== e.id))}
            />
          </div>
          <div className="exchange-rate-section container">
            <h2>Tipo de Cambio</h2>
            <p>Dólar: {exchangeRates.usd ? exchangeRates.usd.toFixed(2) : '20.04'} MXN</p>
            <p>UDI: {exchangeRates.udi} 8.272670 MXN</p>
          </div>
          <div className="interactive-board-section container">
            <h2>Pizarra Interactiva</h2>
            <button className="open-board-btn" onClick={() => navigate('/pizarra')}>
              Ir a la Pizarra
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdvisorDashboard;
