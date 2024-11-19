import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import EventCalendar from "./EventCalendar";
import "./PromoterDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    eventType: "event",
    attendeeType: "both",
  });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setMeetingDetails({
      title: event.title,
      startDateTime: event.start.toISOString().slice(0, 16),
      endDateTime: event.end.toISOString().slice(0, 16),
      eventType: event.eventType || "event",
      attendeeType: event.attendeeType || "both",
    });
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "event",
      attendeeType: "both",
    });
    setSelectedClient(null);
    setSelectedAdvisor(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!meetingDetails.title || !meetingDetails.startDateTime || !meetingDetails.endDateTime) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    // Validaciones según el tipo de asistentes
    if (meetingDetails.attendeeType === "both" && (!selectedClient || !selectedAdvisor)) {
      alert("Por favor, seleccione tanto cliente como asesor.");
      return;
    } else if (meetingDetails.attendeeType === "client" && !selectedClient) {
      alert("Por favor, seleccione un cliente.");
      return;
    } else if (meetingDetails.attendeeType === "advisor" && !selectedAdvisor) {
      alert("Por favor, seleccione un asesor.");
      return;
    }

    try {
      let eventData;

      switch (meetingDetails.attendeeType) {
        case "both":
          // Crear dos eventos separados: uno para el cliente y otro para el asesor
          eventData = {
            title: meetingDetails.title,
            startDateTime: meetingDetails.startDateTime,
            endDateTime: meetingDetails.endDateTime,
            eventType: meetingDetails.eventType,
            createdBy: promotorID,
            attendeeType: meetingDetails.attendeeType,
            events: [
              {
                clientId: selectedClient.id_cliente,
                email: selectedClient.correo_electronico,
                type: 'client'
              },
              {
                clientId: selectedAdvisor.id,
                email: selectedAdvisor.email,
                type: 'advisor'
              }
            ]
          };
          break;

        case "client":
          eventData = {
            title: meetingDetails.title,
            startDateTime: meetingDetails.startDateTime,
            endDateTime: meetingDetails.endDateTime,
            eventType: meetingDetails.eventType,
            createdBy: promotorID,
            attendeeType: meetingDetails.attendeeType,
            events: [
              {
                clientId: selectedClient.id_cliente,
                email: selectedClient.correo_electronico,
                type: 'client'
              }
            ]
          };
          break;

        case "advisor":
          eventData = {
            title: meetingDetails.title,
            startDateTime: meetingDetails.startDateTime,
            endDateTime: meetingDetails.endDateTime,
            eventType: meetingDetails.eventType,
            createdBy: promotorID,
            attendeeType: meetingDetails.attendeeType,
            events: [
              {
                clientId: selectedAdvisor.id,
                email: selectedAdvisor.email,
                type: 'advisor'
              }
            ]
          };
          break;

        case "all":
          // Este caso requerirá una lógica especial en el backend para obtener todos los usuarios
          eventData = {
            title: meetingDetails.title,
            startDateTime: meetingDetails.startDateTime,
            endDateTime: meetingDetails.endDateTime,
            eventType: meetingDetails.eventType,
            createdBy: promotorID,
            attendeeType: "all"
          };
          break;

        default:
          throw new Error("Tipo de asistentes no válido");
      }

      if (selectedEvent) {
        await axios.put(`/api/calendar/update-event/${selectedEvent.id}`, eventData);
        alert("Evento actualizado exitosamente.");
      } else {
        await axios.post("/api/calendar/create-event", eventData);
        alert("Evento creado exitosamente.");
      }

      await fetchEvents();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      alert("Error al guardar el evento: " + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setSelectedClient(null);
    setSelectedAdvisor(null);
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "event",
      attendeeType: "both",
    });
  };

  const handleDeleteEvent = async (eventId) => {
    // Si recibimos un objeto en lugar de un ID, extraemos el ID
    const id = typeof eventId === 'object' ? eventId.id : eventId;
    
    if (!id) {
      console.error('No se pudo obtener el ID del evento');
      alert('Error al eliminar el evento: ID no válido');
      return;
    }
  
    if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
      try {
        await axios.delete(`/api/calendar/delete-event/${id}`);
        await fetchEvents(); // Recargar eventos
        setIsModalOpen(false);
        setSelectedEvent(null);
        setSelectedClient(null);
        setSelectedAdvisor(null);
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
              onEventClick={handleEventClick}
              onEventAdd={handleAddEvent}
              onEventDelete={handleDeleteEvent}
              userType="promoter"
            />
          </div>

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedEvent ? "Editar Evento" : "Nuevo Evento"}</h2>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tipo de Asistentes:</label>
                    <select
                      value={meetingDetails.attendeeType}
                      onChange={(e) =>
                        setMeetingDetails({
                          ...meetingDetails,
                          attendeeType: e.target.value,
                        }) 
                      }
                      className="container-asistance"
                      required
                    >
                      <option value="both">Clientes y Asesores</option>
                      <option value="client">Solo Clientes</option>
                      <option value="advisor">Solo Asesores</option>
                    </select>
                  </div>

                  {(meetingDetails.attendeeType === "advisor" ||
                    meetingDetails.attendeeType === "both") && (
                    <div className="form-group">
                      <label>
                        Asesor: <span className="required">*</span>
                      </label>
                      <select
                        value={selectedAdvisor?.id || ""}
                        onChange={(e) => {
                          const advisor = activeAdvisors.find(
                            (a) => a.id === parseInt(e.target.value)
                          );
                          setSelectedAdvisor(advisor);
                        }}
                        required
                      >
                        <option value="">Seleccione un asesor</option>
                        {Array.isArray(activeAdvisors) &&
                          activeAdvisors.map((advisor) => (
                            <option key={advisor.id} value={advisor.id}>
                              {advisor.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {(meetingDetails.attendeeType === "client" ||
                    meetingDetails.attendeeType === "both") && (
                    <div className="form-group">
                      <label>
                        Cliente: <span className="required">*</span>
                      </label>
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
                        {Array.isArray(clients) &&
                          clients.map((client) => (
                            <option
                              key={client.id_cliente}
                              value={client.id_cliente}
                            >
                              {client.nombre_completo}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      Título: <span className="required">*</span>
                    </label>
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
                  </div>

                  <div className="form-group">
                    <label>
                      Fecha y hora de inicio:{" "}
                      <span className="required">*</span>
                    </label>
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
                  </div>

                  <div className="form-group">
                    <label>
                      Fecha y hora de fin: <span className="required">*</span>
                    </label>
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
                  </div>

                  <div className="form-group">
                    <label>Tipo de Evento:</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="meeting"
                          checked={meetingDetails.eventType === "meeting"}
                          onChange={() =>
                            setMeetingDetails((prev) => ({
                              ...prev,
                              eventType: "meeting",
                            }))
                          }
                        />
                        <span>Crear Evento con Google Meet</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="event"
                          checked={meetingDetails.eventType === "event"}
                          onChange={() =>
                            setMeetingDetails((prev) => ({
                              ...prev,
                              eventType: "event",
                            }))
                          }
                        />
                        <span>Crear solo un evento</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={handleSaveEvent} className="save-button">
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
                      resetForm();
                    }}
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
