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

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/api/get-events?advisorId=${advisorId}`);
        setEvents(response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };

    fetchClients();
    fetchEvents();
  }, [advisorId]);

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
                    <li>Teléfono: {client.telefono}</li>
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
