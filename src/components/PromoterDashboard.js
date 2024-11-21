import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import EventCalendar from "./EventCalendar";
import "./PromoterDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EventFormModal from "./EventFormModal";

const PromoterDashboard = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [expandedAdvisor, setExpandedAdvisor] = useState(null);
  const [events, setEvents] = useState([]);
  const promotorID = sessionStorage.getItem("userId");
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [clients, setClients] = useState([]);
  const [activeAdvisors, setActiveAdvisors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar clientes
        const clientsResponse = await axios.get(
          `/api/calendar/get-clients-asesor?advisorId=${promotorID}`
        );
        setClients(
          Array.isArray(clientsResponse.data) ? clientsResponse.data : []
        );

        // Cargar asesores activos
        const advisorsResponse = await axios.get("/api/calendar/advisors");
        setActiveAdvisors(
          Array.isArray(advisorsResponse.data) ? advisorsResponse.data : []
        );

        // Cargar asesores con sus clientes para el panel lateral
        const advisorsWithClientsResponse = await axios.get(
          "/api/advisors-with-clients"
        );
        setAdvisors(
          Array.isArray(advisorsWithClientsResponse.data)
            ? advisorsWithClientsResponse.data
            : []
        );

        // Cargar tipo de cambio
        const exchangeResponse = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        setExchangeRates({
          usd: exchangeResponse.data.rates.MXN,
          udi: 6.57,
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // Manejar errores específicos si es necesario
      }
    };

    fetchData();
    fetchEvents();
  }, [promotorID]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `/api/calendar/get-events?advisorId=${promotorID}`
      );
      if (response.data && Array.isArray(response.data)) {
        const formattedEvents = response.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          clientId: event.client_id,
          eventType: event.event_type,
          attendeeType: event.attendee_type,
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      setEvents([]);
    }
  };


  const handleSaveEvent = async (formData) => {
    console.log("Datos recibidos del modal:", formData);
    
    if (!formData.title || !formData.startDateTime || !formData.endDateTime) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }
  
    try {
      if (selectedEvent) {
        // Si es una actualización, solo enviamos los campos editables
        const updateData = {
          title: formData.title,
          startDateTime: formData.startDateTime,
          endDateTime: formData.endDateTime,
          // Mantenemos los valores originales para estos campos
          eventType: selectedEvent.eventType,
          attendeeType: selectedEvent.attendeeType,
          clientId: selectedEvent.clientId,
          createdBy: promotorID,
        };
  
        await axios.put(
          `/api/calendar/update-event/${selectedEvent.id}`,
          updateData
        );
        alert("Evento actualizado exitosamente.");
      } else {
        // Si es un nuevo evento
        let eventData = {
          title: formData.title,
          startDateTime: formData.startDateTime,
          endDateTime: formData.endDateTime,
          eventType: formData.eventType,
          createdBy: promotorID,
          attendeeType: formData.attendeeType,
          events: formData.events
        };
  
        const response = await axios.post(
          "/api/calendar/create-event-promotor",
          eventData
        );
        if (response.data) {
          alert("Evento creado exitosamente");
        }
      }
  
      await fetchEvents();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert(
        "Error al guardar el evento: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
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
        alert("Evento eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
        alert("Error al eliminar el evento");
      }
    }
  };

  const toggleExpandAdvisor = (id) => {
    setExpandedAdvisor(expandedAdvisor === id ? null : id);
  };

  const toggleExpandProduct = (product) => {
    setExpandedProduct(expandedProduct === product ? null : product);
  };

  const closeChatbot = () => {
    setShowChatbot(false);
  };

  const handleOpenModal = (event = null, start = null) => {
    setSelectedDate(start);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="promoter-dashboard">
      <Header />
      <div className="main-content">
        <div className="left-section">
          <div className="products-section container">
            <h2>Productos</h2>
            <div className="product-options">
              <button onClick={() => toggleExpandProduct("Imagina Ser")}>
                Imagina Ser
              </button>
              <button onClick={() => toggleExpandProduct("Star Dotal")}>
                Star Dotal
              </button>
              <button onClick={() => toggleExpandProduct("Orvi 99")}>
                Orvi 99
              </button>
              <button onClick={() => toggleExpandProduct("Vida Mujer")}>
                Vida Mujer
              </button>
              <button onClick={() => toggleExpandProduct("SeguBeca")}>
                SeguBeca
              </button>
            </div>
            {expandedProduct && (
              <div className="product-info">
                {expandedProduct === "Imagina Ser" && (
                  <p>Información general sobre Imagina Ser...</p>
                )}
                {expandedProduct === "Star Dotal" && (
                  <p>Información general sobre Star Dotal...</p>
                )}
                {expandedProduct === "Orvi 99" && (
                  <p>Información general sobre Orvi 99...</p>
                )}
                {expandedProduct === "Vida Mujer" && (
                  <p>Información general sobre Vida Mujer...</p>
                )}
                {expandedProduct === "SeguBeca" && (
                  <p>Información general sobre SeguBeca...</p>
                )}
              </div>
            )}
          </div>

          <div className="advisors-section container">
            <h2>Asesores</h2>
            {Array.isArray(advisors) &&
              advisors.map((advisor) => (
                <div key={advisor.id} className="advisor">
                  <div onClick={() => toggleExpandAdvisor(advisor.id)}>
                    <span className="bold">{advisor.name}</span>
                    {advisor.agentNumber && ` - ${advisor.agentNumber}`}
                  </div>
                  {expandedAdvisor === advisor.id && (
                    <ul className="clients-list">
                      {Array.isArray(advisor.clients) &&
                        advisor.clients.map((client, index) => (
                          <li key={index}>{client}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>

          <div className="renewals-section container">
            <h2>Renovaciones del mes</h2>
            <p>Renovación de cliente X - Septiembre 2024</p>
            <p>Renovación de cliente Y - Septiembre 2024</p>
          </div>

          <button className="presentation-btn container">
            Presentaciones con Rendimientos Financieros
          </button>
        </div>

        <div className="right-section">
          <div className="agenda-section container">
            <h2>Calendario</h2>
            <EventCalendar
              events={events}
              onEventAdd={(start) => handleOpenModal(null, start)}
              onEventEdit={(event) => handleOpenModal(event)}
              onEventDelete={handleDeleteEvent}
              userType="promoter"
            />

            <EventFormModal
              show={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              initialData={selectedEvent}
              selectedDate={selectedDate}
              userType="promoter"
            />
          </div>

          <div className="exchange-rate-section container">
            <h2>Tipo de Cambio</h2>
            <p>
              Dólar:{" "}
              {exchangeRates.usd ? exchangeRates.usd.toFixed(2) : "Cargando..."}{" "}
              MXN
            </p>
            <p>UDI: {exchangeRates.udi} MXN</p>
          </div>

          <div className="virtual-assistant-section container">
            <h2>Asistente Virtual</h2>
            <button
              className="open-assistant-btn"
              onClick={() => setShowChatbot(true)}
            >
              Abrir Asistente
            </button>
          </div>
        </div>
      </div>

      {showChatbot && (
        <div className="chatbot-modal">
          <div className="chatbot-modal-content">
            <span className="close-button" onClick={closeChatbot}>
              &times;
            </span>
            <Chatbot userType="promotor" closeChatbot={closeChatbot} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PromoterDashboard;
