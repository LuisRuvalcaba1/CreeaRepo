import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import EventViewModal from './EventViewModal';
import './ClientDashboard.css';

const localizer = momentLocalizer(moment);

const ClientDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [insuranceInfo, setInsuranceInfo] = useState([]);
  const [nextRenewal, setNextRenewal] = useState('');
  const [payments, setPayments] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const userId = sessionStorage.getItem('userId');
    try {
      const response = await axios.get(`/api/calendar/get-events?advisorId=${userId}`);
      if (response.data && response.data.length > 0) {
        setEvents(response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          clientId: event.client_id,
          eventType: event.event_type,
          meetLink: event.meet_link || '',
          createdBy: event.created_by
        })));
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

   useEffect(() => {
    fetchEvents();
    
    setInsuranceInfo([{ policy: 'Orvi 99', details: 'Cubre fallecimiento y accidentes.' }]);
    setNextRenewal('2025-01-15');
    setPayments([
      { date: '2024-09-01', amount: '500 MXN' },
      { date: '2024-08-01', amount: '500 MXN' }
    ]);

    axios.get('https://api.exchangerate-api.com/v4/latest/USD')
      .then((response) => {
        setExchangeRates({ usd: response.data.rates.MXN, udi: 6.57 });
      })
      .catch(error => {
        console.error('Error al obtener tipos de cambio:', error);
        setExchangeRates({ usd: 20.5, udi: 6.57 });
      });
  }, []);


  const handlePaymentClick = (payment) => {
    navigate('/payment', { state: { amount: payment.amount, date: payment.date } });
  };

  const eventStyleGetter = (event) => {
    let className = "";
    switch (event.eventType) {
      case "meeting":
        className = "rbc-event-meeting";
        break;
      default:
        className = "rbc-event-regular";
    }
    return { className };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
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
            <p>Dólar: {exchangeRates.usd?.toFixed(2)} MXN</p>
            <p>UDI: {exchangeRates.udi?.toFixed(2)} MXN</p>
          </div>

          {/* Calendario */}
          <div className="client-section calendar-section">
            <h2>Calendario de Eventos</h2>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              selectable={false}
              toolbar={true}
            />

            <EventViewModal
              show={showEventModal}
              onClose={() => setShowEventModal(false)}
              eventData={selectedEvent}
            />
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