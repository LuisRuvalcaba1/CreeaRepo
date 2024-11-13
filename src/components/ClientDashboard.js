import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EventCalendar from './EventCalendar'; 
import axios from 'axios';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [events, setEvents] = useState([]);
  const [insuranceInfo, setInsuranceInfo] = useState([]);
  const [nextRenewal, setNextRenewal] = useState('');
  const [payments, setPayments] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [conflictError, setConflictError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
  const userId = sessionStorage.getItem('userId');
  axios.get(`/api/calendar/events?userId=${userId}`)
    .then((response) => {
      setEvents(response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_datetime),
        end: new Date(event.end_datetime),
        link: event.meet_link || '',
      })));
    })
    .catch((error) => {
      console.error('Error al cargar eventos:', error);
    });
    // Datos simulados de seguros, pagos y renovación
    setInsuranceInfo([{ policy: 'Orvi 99', details: 'Cubre fallecimiento y accidentes.' }]);
    setNextRenewal('2025-01-15');
    setPayments([{ date: '2024-09-01', amount: '500 MXN' }, { date: '2024-08-01', amount: '500 MXN' }]);

    // Llamada API para obtener tipo de cambio (ejemplo)
    axios.get('https://api.exchangerate-api.com/v4/latest/USD')
    .then((response) => {
        setExchangeRates({ usd: response.data.rates.MXN, udi: 6.57 });
    });

    // Inicializamos algunos eventos
    setEvents([
      { id: 1, title: 'Reunión con asesor', start: new Date('2024-09-10T10:00'), end: new Date('2024-09-10T11:00'), link: 'https://meet.google.com' },
      { id: 2, title: 'Renovación de seguro', start: new Date('2024-10-05T14:00'), end: new Date('2024-10-05T15:00'), link: '' }
    ]);
  }, []);

  // Validación de conflictos de eventos
  const validateEventConflict = (newEvent) => {
    return events.some(event => event.start.toISOString() === newEvent.start.toISOString());
  };

  // Función para guardar un nuevo evento
  const handleSaveEvent = (eventData) => {
    const newEvent = {
      id: events.length + 1,
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      link: eventData.link,
    };

    if (validateEventConflict(newEvent)) {
      setConflictError('Ya tienes un evento programado para esa fecha y hora.');
      return;
    }

    setEvents([...events, newEvent]);
    setShowConfirmation(true);
  };

  const handleEditEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
    );
    setShowConfirmation(true);
  };

  const handleDeleteEvent = (eventToDelete) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id));
    setShowConfirmation(true);
  };

  // Función para manejar el clic en un pago pendiente
  const handlePaymentClick = (payment) => {
    navigate('/payment', { state: { amount: payment.amount, date: payment.date } });
  };

  return (
    <div className="client-dashboard">
      <Header />

      <div className="client-main-content">
        <div className="client-grid">

          {/* Productos */}
          <div className="client-section products-section">
            <h2>Productos</h2>
            <button>Imagina Ser</button>
            <button>Star Dotal</button>
            <button>Orvi 99</button>
            <button>Vida Mujer</button>
          </div>

          {/* Mis Seguros */}
          <div className="client-section insurance-section">
            <h2>Mis Seguros</h2>
            {insuranceInfo.map((insurance, index) => (
              <div key={index}>
                <p><strong>{insurance.policy}</strong>: {insurance.details}</p>
              </div>
            ))}
          </div>

          {/* Mis Pagos */}
          <div className="client-section payments-section">
            <h2>Mis Pagos</h2>
            <ul>
              {payments.map((payment, index) => (
                <li 
                  key={index}
                  className="payment-item" 
                  onClick={() => handlePaymentClick(payment)}
                >
                  {payment.date} - {payment.amount}
                </li>
              ))}
            </ul>
          </div>

          {/* Renovación de Seguro */}
          <div className="client-section renewal-section">
            <h2>Renovación de Seguro</h2>
            <p>Tu próxima renovación de seguro es el: <strong>{nextRenewal}</strong></p>
          </div>

          {/* Tipo de Cambio */}
          <div className="client-section exchange-rate-section">
            <h2>Tipo de Cambio</h2>
            <p>Dólar: {exchangeRates.usd} MXN</p>
            <p>UDI: {exchangeRates.udi} MXN</p>
          </div>

          {/* Calendario */}
          <div className="client-section calendar-section">
            <h2>Calendario</h2>
            <EventCalendar
              events={events}
              onEventAdd={handleSaveEvent}
              onEventEdit={handleEditEvent}
              onEventDelete={handleDeleteEvent}
            />

            {/* Mostrar confirmación o errores */}
            {showConfirmation && <p>¡Evento guardado exitosamente!</p>}
            {conflictError && <p style={{ color: 'red' }}>{conflictError}</p>}
          </div>

          {/* Calculadora de Riesgo */}
          <div className="client-section risk-calculator-section">
            <h2>Calculadora de Riesgo</h2>
            <button onClick={() => navigate('/calculator')}>Acceder</button>
          </div>

          {/* Pizarrón Interactivo */}
          <div className="client-section interactive-board-section">
            <h2>Pizarrón Interactivo</h2>
            <button onClick={() => navigate('/pizarra')}>Acceder al Pizarrón</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
