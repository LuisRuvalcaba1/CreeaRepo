import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import EventCalendar from "./EventCalendar";
import "./PromoterDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PromoterDashboard = () => {
  const [advisors, setAdvisors] = useState([]);
  const [expandedAdvisor, setExpandedAdvisor] = useState(null);
  const [events, setEvents] = useState([]);
  const promotorID = sessionStorage.getItem("userId");
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
  });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Añade este useEffect para cargar los clientes
  useEffect(() => {
    // Cargar la lista de clientes
    const fetchClients = async () => {
      try {
        const response = await axios.get("/api/clients");
        setClients(response.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [promotorID]);

  useEffect(() => {
    axios
      .get("/api/advisors-with-clients")
      .then((response) => {
        setAdvisors(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de asesores:", error);
      });

    axios
      .get("https://api.exchangerate-api.com/v4/latest/USD")
      .then((response) => {
        setExchangeRates({ usd: response.data.rates.MXN, udi: 6.57 });
      });
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `/api/get-events?advisorId=${promotorID}`
      );
      const formattedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startDateTime || event.start),
        end: new Date(event.endDateTime || event.end),
        clientId: event.clientId,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setMeetingDetails({
      title: event.title,
      startDateTime: event.start.toISOString().slice(0, 16),
      endDateTime: event.end.toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (
      !meetingDetails.title ||
      !meetingDetails.startDateTime ||
      !meetingDetails.endDateTime ||
      !selectedClient
    ) {
      alert(
        "Por favor, complete todos los campos requeridos, incluyendo la selección del cliente."
      );
      return;
    }

    try {
      const eventData = {
        title: meetingDetails.title,
        startDateTime: meetingDetails.startDateTime,
        endDateTime: meetingDetails.endDateTime,
        eventType: "meeting",
        createdBy: promotorID,
        clientId: selectedClient.id_cliente, // Asegúrate de incluir el clientId
        description: meetingDetails.description || "",
        attendees: [{ email: selectedClient.correo_electronico }], // Si tienes el correo del cliente
      };

      if (selectedEvent) {
        // Actualizar evento existente
        await axios.put(
          `/api/calendar/update-event/${selectedEvent.id}`,
          eventData
        );
        alert("Evento actualizado exitosamente.");
      } else {
        // Crear nuevo evento
        await axios.post("/api/calendar/create-event", eventData);
        alert("Evento creado exitosamente.");
      }

      await fetchEvents(); // Recargar eventos
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert(
        "Error al guardar el evento: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
      try {
        await axios.delete(`/api/calendar/delete-event/${eventId}`);
        await fetchEvents(); // Recargar eventos
        setIsModalOpen(false);
        setSelectedEvent(null);
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

  return (
    <div className="promoter-dashboard">
      <Header />
      <div className="main-content">
        <div className="left-section">
          <button className="account-btn container">Mi cuenta</button>

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
            {advisors.map((advisor) => (
              <div key={advisor.id} className="advisor">
                <div onClick={() => toggleExpandAdvisor(advisor.id)}>
                  <span className="bold">{advisor.name}</span> -{" "}
                  {advisor.agentNumber}
                </div>
                {expandedAdvisor === advisor.id && (
                  <ul className="clients-list">
                    {advisor.clients.map((client, index) => (
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
            <button onClick={handleAddEvent} className="add-event-button">
              Agregar Evento
            </button>
            <EventCalendar
              events={events}
              onEventClick={handleEventClick}
              onEventAdd={handleAddEvent}
              onEventDelete={handleDeleteEvent}
            />
          </div>

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedEvent ? "Editar Evento" : "Nuevo Evento"}</h2>
                <div className="modal-body">
                  <label>
                    Cliente: {/* Añade este campo de selección de cliente */}
                    <select
                      value={selectedClient?.id_cliente || ""}
                      onChange={(e) => {
                        const client = clients.find(
                          (c) => c.id_cliente === parseInt(e.target.value)
                        );
                        setSelectedClient(client);
                      }}
                      required
                    >
                      <option value="">Seleccione un cliente</option>
                      {clients.map((client) => (
                        <option
                          key={client.id_cliente}
                          value={client.id_cliente}
                        >
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
                      onChange={(e) =>
                        setMeetingDetails({
                          ...meetingDetails,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Fecha y hora de inicio:
                    <input
                      type="datetime-local"
                      value={meetingDetails.startDateTime}
                      onChange={(e) =>
                        setMeetingDetails({
                          ...meetingDetails,
                          startDateTime: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Fecha y hora de fin:
                    <input
                      type="datetime-local"
                      value={meetingDetails.endDateTime}
                      onChange={(e) =>
                        setMeetingDetails({
                          ...meetingDetails,
                          endDateTime: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                </div>
                <div className="modal-footer">
                  <button onClick={handleSaveEvent}>
                    {selectedEvent ? "Actualizar" : "Crear"}
                  </button>
                  {selectedEvent && (
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedClient(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

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
