import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import EventCalendar from "./EventCalendar";
import axios from "axios";
import moment from "moment";
import "./ClientDashboard.css";

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
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifiedEvents, setNotifiedEvents] = useState([]);
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    eventType: "meeting", // Agregar tipo de evento por defecto
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setMeetingDetails({
        title: event.title,
        startDateTime: event.start.toISOString().slice(0, 16),
        endDateTime: event.end.toISOString().slice(0, 16),
        eventType: "meeting"
      });
    } else {
      setEditingEvent(null);
      setMeetingDetails({
        title: "",
        startDateTime: "",
        endDateTime: "",
        eventType: "meeting"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "meeting"
    });
    setEditingEvent(null);
  };

  const handleScheduleMeeting = async () => {
    if (!meetingDetails.title || !meetingDetails.startDateTime || !meetingDetails.endDateTime) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      const eventData = {
        title: meetingDetails.title,
        startDateTime: new Date(meetingDetails.startDateTime).toISOString(),
        endDateTime: new Date(meetingDetails.endDateTime).toISOString(),
        eventType: meetingDetails.eventType,
        createdBy: parseInt(clientId)
      };

      if (editingEvent) {
        await axios.put(`/api/calendar/update-event/${editingEvent.id}`, eventData);
        alert("Evento actualizado exitosamente.");
      } else {
        await axios.post("/api/calendar/create-event-client", eventData);
        alert("Reunión programada exitosamente.");
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error al programar la reunión:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      alert("Error al programar la reunión: " + errorMessage);
    }
  };

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
      await axios.put(`/api/calendar/update-event/${eventData.id}`, eventData);
      await fetchEvents();
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      await axios.delete(`/api/calendar/delete-event/${eventId}`);
      await fetchEvents();
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
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
              onEventAdd={() => handleOpenModal()}
              onEventEdit={(event) => handleOpenModal(event)}
              onEventDelete={handleEventDelete}
              userType="client"
            />
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>{editingEvent ? "Editar Evento" : "Programar Evento"}</h2>
                <label>
                  Título:
                  <input
                    type="text"
                    value={meetingDetails.title}
                    onChange={(e) =>
                      setMeetingDetails({
                        ...meetingDetails,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ingrese el título del evento"
                  />
                </label>
                <label>
                  Fecha y Hora de Inicio:
                  <input
                    type="datetime-local"
                    value={meetingDetails.startDateTime}
                    onChange={(e) =>
                      setMeetingDetails({
                        ...meetingDetails,
                        startDateTime: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Fecha y Hora de Término:
                  <input
                    type="datetime-local"
                    value={meetingDetails.endDateTime}
                    onChange={(e) =>
                      setMeetingDetails({
                        ...meetingDetails,
                        endDateTime: e.target.value,
                      })
                    }
                  />
                </label>
                <div className="modal-actions">
                  <button 
                    onClick={handleScheduleMeeting}
                    className="schedule-button"
                  >
                    {editingEvent ? "Actualizar" : "Agendar"}
                  </button>
                  <button 
                    onClick={handleCloseModal}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
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
