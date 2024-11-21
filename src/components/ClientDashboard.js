import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import EventCalendar from "./EventCalendar";
import axios from "axios";
import moment from "moment";
import "./ClientDashboard.css";
import EventFormModal from "./EventFormModal";

const ClientDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [insuranceInfo, setInsuranceInfo] = useState([]);
  const [nextRenewal, setNextRenewal] = useState("");
  const [payments, setPayments] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [advisorNotes, setAdvisorNotes] = useState([]);
  const navigate = useNavigate();
  const clientId = sessionStorage.getItem("userId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifiedEvents, setNotifiedEvents] = useState([]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `/api/calendar/get-events?advisorId=${clientId}`
      );
      if (response.data && response.data.length > 0) {
        const upcomingEvents = response.data.filter((event) => {
          const eventDate = new Date(event.start);
          const now = new Date();
          const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          return eventDate >= now && eventDate <= oneDayAhead;
        });

        const newEvents = upcomingEvents.filter(
          (event) =>
            !notifiedEvents.some((notified) => notified.id === event.id)
        );

        if (newEvents.length > 0) {
          alert(
            `Tienes ${newEvents.length} eventos programados en las próximas 24 horas.`
          );
          setNotifiedEvents([...notifiedEvents, ...newEvents]);
        }

        setEvents(
          response.data.map((event) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            clientId: event.client_id,
            eventType: event.event_type,
            meetLink: event.meet_link || "",
            createdBy: event.created_by,
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };

  const handleOpenModal = (event = null, start = null) => {
    if (event) {
      setSelectedEvent({
        ...event,
        startDateTime: formatDateTimeForInput(event.start),
        endDateTime: formatDateTimeForInput(event.end),
      });
    } else if (start) {
      const startDate = new Date(start);
      const endDate = new Date(start);
      endDate.setHours(startDate.getHours() + 1);
      endDate.setMinutes(startDate.getMinutes());
  
      setSelectedEvent({
        title: '',
        startDateTime: formatDateTimeForInput(startDate),
        endDateTime: formatDateTimeForInput(endDate)
      });
    }
    setIsModalOpen(true);
  };
  
  const formatDateTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Función auxiliar para formatear fechas

  const fetchAdvisorNotes = async () => {
    try {
      const response = await axios.get(
        `/api/clients/advisor-notes/${clientId}`
      );
      if (response.data) {
        setAdvisorNotes(response.data);
      }
    } catch (error) {
      console.error("Error al cargar notas del asesor:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAdvisorNotes();

    setInsuranceInfo([
      { policy: "Orvi 99", details: "Cubre fallecimiento y accidentes." },
    ]);
    setNextRenewal("2025-01-15");
    setPayments([
      { date: "2024-09-01", amount: "500 MXN" },
      { date: "2024-08-01", amount: "500 MXN" },
    ]);

    axios
      .get("https://api.exchangerate-api.com/v4/latest/USD")
      .then((response) => {
        setExchangeRates({ usd: response.data.rates.MXN, udi: 6.57 });
      })
      .catch((error) => {
        console.error("Error al obtener tipos de cambio:", error);
        setExchangeRates({ usd: 20.5, udi: 6.57 });
      });
  }, [clientId]);

  const handlePaymentClick = (payment) => {
    navigate("/payment", {
      state: { amount: payment.amount, date: payment.date },
    });
  };

  const handleEventAdd = async (eventData) => {
    try {
      await axios.post("/api/calendar/create-event-client", eventData);
      await fetchEvents();
    } catch (error) {
      console.error("Error al crear el evento:", error);
    }
  };

  const handleEventEdit = async (eventData) => {
    try {
      const eventId = eventData.id;
      if (!eventId) {
        throw new Error("ID del evento no encontrado");
      }
  
      await axios.put(`/api/calendar/update-event/${eventId}`, eventData);
      await fetchEvents(); // Recargar eventos después de actualizar
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      throw error;
    }
  };

  const handleSaveEvent = async (formData) => {
    try {
      const startDate = new Date(formData.startDateTime);
      const endDate = new Date(formData.endDateTime);
  
      const eventData = {
        ...formData,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        createdBy: parseInt(clientId),
        eventType: formData.eventType || "meeting",
      };
  
      const response = await fetch("/api/calendar/create-event-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Error al crear el evento");
      }
  
      const data = await response.json();
      await fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
      return data;
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Si recibimos un objeto en lugar de un ID, extraemos el ID
    const id = typeof eventId === "object" ? eventId.id : eventId;

    if (!id) {
      console.error("No se pudo obtener el ID del evento");
      alert("Error al eliminar el evento: ID no válido");
      return;
    }

    if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
      try {
        await axios.delete(`/api/calendar/delete-event/${id}`);
        await fetchEvents(); // Recargar eventos
        setIsModalOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
        alert("Error al eliminar el evento");
      }
    }
  };

  const handleNavigateFinancialProjection = () => {
    navigate("/financial-projection");
  };

  const handleNavigateInteractiveBoard = () => {
    navigate("/pizarra");
  };

  const handleNavigateCalculator = () => {
    navigate("/calculator");
  };

  return (
    <div className="advisor-dashboard">
      <Header />
      <div className="main-content">
        <div className="left-section">
          <div className="notes-section container">
            <h2>Notas de tu Asesor</h2>
            <div className="notes-list">
              {advisorNotes.map((note, index) => (
                <div key={index} className="note-card">
                  <div className="note-header">
                    <span className="note-date">
                      {moment(note.fecha).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="note-content">{note.contenido}</div>
                </div>
              ))}
              {advisorNotes.length === 0 && (
                <p className="no-notes">No hay notas disponibles</p>
              )}
            </div>
          </div>

          <div className="insurance-info container">
            <h2>Información de Seguros</h2>
            {insuranceInfo.map((insurance, index) => (
              <div key={index} className="insurance-card">
                <h3>{insurance.policy}</h3>
                <p>{insurance.details}</p>
              </div>
            ))}
            <div className="renewal-info">
              <h3>Próxima Renovación</h3>
              <p>{nextRenewal}</p>
            </div>
          </div>

          <div className="payments-section container">
            <h2>Próximos Pagos</h2>
            {payments.map((payment, index) => (
              <div
                key={index}
                className="payment-card"
                onClick={() => handlePaymentClick(payment)}
              >
                <span className="payment-date">{payment.date}</span>
                <span className="payment-amount">{payment.amount}</span>
              </div>
            ))}
          </div>

          <button
            className="financial-projection-btn container"
            onClick={handleNavigateCalculator}
          >
            Calculadora de Riesgo
          </button>
          <button
            className="financial-projection-btn container"
            onClick={handleNavigateFinancialProjection}
          >
            Rendimientos Financieros
          </button>
          <button
            className="financial-projection-btn container"
            onClick={handleNavigateInteractiveBoard}
          >
            Pizarrón Interactivo
          </button>
        </div>

        <div className="right-section">
          <div className="calendar-section container">
            <h2>Calendario</h2>
            <EventCalendar
              events={events}
              onEventAdd={(start) => handleOpenModal(null, start)} // Asegurarse de que este prop exista
              onEventEdit={(event) => handleOpenModal(event)}
              onEventDelete={handleDeleteEvent}
              userType="client"
            />

            <EventFormModal
              show={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
              }}
              onSave={handleSaveEvent}
              onUpdate={handleEventEdit}
              onDelete={handleDeleteEvent}
              initialData={selectedEvent} // Ahora contiene startDateTime y endDateTime formateados
              userType="client"
            />
          </div>
          <div className="exchange-rate-section container">
            <h2>Tipo de Cambio</h2>
            <div className="exchange-rates">
              <p>Dólar: {exchangeRates.usd?.toFixed(2)} MXN</p>
              <p>UDI: {exchangeRates.udi?.toFixed(2)} MXN</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
