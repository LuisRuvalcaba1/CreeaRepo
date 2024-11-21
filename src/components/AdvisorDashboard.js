import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import EventCalendar from "./EventCalendar";
import axios from "axios";
import "./AdvisorDashboard.css";
import EventFormModal from "./EventFormModal";

const AdvisorDashboard = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClient, setExpandedClient] = useState(null);
  const [events, setEvents] = useState([]);
  const [visibleClients, setVisibleClients] = useState(5);
  const [filter, setFilter] = useState({
    status: "",
    occupation: "",
    gender: "",
  });
  const [note, setNote] = useState("");
  const [exchangeRates] = useState({ usd: 20.5, udi: 6.5 });
  const navigate = useNavigate();
  const advisorId = sessionStorage.getItem("userId");
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notifiedEvents, setNotifiedEvents] = useState([]);
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    eventType: "meeting", // Agregar tipo de evento por defecto
  });
  const [clientNotes, setClientNotes] = useState({});
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchClientNotes = async (clientId) => {
    setIsLoadingNotes(true);
    try {
      const response = await axios.get(`/api/notes/client/${clientId}`, {
        params: { advisorId },
      });
      setClientNotes((prev) => ({
        ...prev,
        [clientId]: response.data,
      }));
    } catch (error) {
      console.error("Error al cargar las notas:", error);
      alert("Error al cargar las notas del cliente");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleCreateNote = async (clientId) => {
    if (!newNote.trim()) {
      alert("Por favor, escribe una nota antes de guardar.");
      return;
    }

    try {
      const response = await axios.post("/api/notes/create", {
        id_cliente: clientId,
        id_asesor: advisorId,
        contenido: newNote,
      });

      // Actualizar el estado local con la nueva nota
      setClientNotes((prev) => ({
        ...prev,
        [clientId]: [...(prev[clientId] || []), response.data],
      }));

      setNewNote(""); // Limpiar el campo de nota
      alert("Nota guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      alert(error.response?.data?.message || "Error al guardar la nota");
    }
  };

  // Función para iniciar la edición de una nota
  const handleStartEditNote = (note) => {
    setEditingNote(note.id_nota);
    setEditNoteContent(note.contenido);
  };

  // Función para guardar la nota editada
  const handleSaveEditedNote = async (noteId, clientId) => {
    try {
      const response = await axios.put(`/api/notes/${noteId}`, {
        contenido: editNoteContent,
        advisorId,
      });

      // Actualizar el estado local con la nota editada
      setClientNotes((prev) => ({
        ...prev,
        [clientId]: prev[clientId].map((note) =>
          note.id_nota === noteId ? response.data : note
        ),
      }));

      setEditingNote(null);
      setEditNoteContent("");
      alert("Nota actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar la nota:", error);
      alert(error.response?.data?.message || "Error al actualizar la nota");
    }
  };

  // Función para eliminar una nota
  const handleDeleteNote = async (noteId, clientId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      return;
    }

    try {
      await axios.delete(`/api/notes/${noteId}`, {
        params: { advisorId },
      });

      // Actualizar el estado local eliminando la nota
      setClientNotes((prev) => ({
        ...prev,
        [clientId]: prev[clientId].filter((note) => note.id_nota !== noteId),
      }));

      alert("Nota eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la nota:", error);
      alert(error.response?.data?.message || "Error al eliminar la nota");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `/api/calendar/get-clients-asesor?advisorId=${advisorId}`
      );
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
      alert("Error al cargar los clientes");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `/api/calendar/get-events?advisorId=${advisorId}`
      );

      // Ajustar las fechas al mostrarlas
      const processedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        clientId: event.client_id,
        clientName: event.client_name,
        eventType: event.event_type,
        meetLink: event.meet_link,
      }));

      setEvents(processedEvents);

      // Procesar notificaciones de eventos próximos
      const upcomingEvents = processedEvents.filter((event) => {
        const eventDate = new Date(event.start);
        const now = new Date();
        const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= oneDayAhead;
      });

      const newEvents = upcomingEvents.filter(
        (event) => !notifiedEvents.some((notified) => notified.id === event.id)
      );

      if (newEvents.length > 0) {
        alert(
          `Tienes ${newEvents.length} eventos programados en las próximas 24 horas.`
        );
        setNotifiedEvents([...notifiedEvents, ...newEvents]);
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  // Efecto para cargar clientes y eventos al montar el componente
  useEffect(() => {
    fetchClients();
    fetchEvents();
  }, [advisorId]);

  // Efecto para filtrar clientes
  useEffect(() => {
    if (clients.length > 0) {
      const filtered = clients
        .filter(
          (client) =>
            client.nombre_completo
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            client.correo_electronico
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
        .filter(
          (client) =>
            (!filter.status || client.estado_cuenta === filter.status) &&
            (!filter.occupation || client.ocupacion === filter.occupation) &&
            (!filter.gender || client.sexo === filter.gender)
        );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients, filter]);

  const handleNavigateFinancialProjection = () => {
    navigate("/financial-projection");
  };

  const handleNavigateFormFill = () => {
    navigate("/fill-request");
  };

  const handleNavigateInteractiveBoard = () => {
    navigate("/pizarra");
  };

  const handleNavigateCalculator = () => {
    navigate("/calculator");
  };

  const toggleExpandClient = (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
      fetchClientNotes(clientId);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleRegisterNote = async (clientId) => {
    if (note.length > 255) {
      alert("La nota no puede exceder los 255 caracteres.");
    } else {
      try {
        await axios.post("/api/save-note", {
          id_cliente: clientId,
          id_asesor: advisorId,
          contenido: note,
        });
        alert("Nota guardada exitosamente.");
        setNote("");
      } catch (error) {
        console.error("Error al guardar la nota:", error);
        alert("Error al guardar la nota.");
      }
    }
  };

  const showMoreClients = () => {
    setVisibleClients(visibleClients + 5);
  };
  // const formatDateTimeForInput = (date) => {
  //   if (!date) return "";
  //   const d = new Date(date);
  //   if (isNaN(d.getTime())) return "";

  //   return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  //     .toISOString()
  //     .slice(0, 16);
  // };

  const handleOpenModal = (event = null, start = null) => {
    setSelectedDate(start);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "meeting",
    });
    setEditingEvent(null);
  };

  const handleSaveEvent = async (formData) => {
    try {
      const response = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Error al crear el evento");
      }

      const data = await response.json();
      await fetchEvents(); // Recargar eventos
      return data;
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      throw error;
    }
  };

  const handleEventEdit = async (event) => {
    try {
      await fetchEvents(); // Recargar eventos después de editar
    } catch (error) {
      console.error("Error al actualizar eventos:", error);
      alert("Error al actualizar los eventos");
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
        setSelectedClient(null);
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
        alert("Error al eliminar el evento");
      }
    }
  };

  const handleScheduleMeeting = async () => {
    if (
      !selectedClient ||
      !meetingDetails.title ||
      !meetingDetails.startDateTime ||
      !meetingDetails.endDateTime
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      // Crear fechas sin ajuste de zona horaria
      const startDate = new Date(meetingDetails.startDateTime);
      const endDate = new Date(meetingDetails.endDateTime);

      const eventData = {
        title: meetingDetails.title,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        eventType: meetingDetails.eventType,
        clientId: parseInt(selectedClient.id_usuario),
        createdBy: parseInt(advisorId),
        attendees: [{ email: selectedClient.correo_electronico }],
      };

      console.log("Datos del evento:", eventData);

      if (editingEvent) {
        await axios.put(
          `/api/calendar/update-event/${editingEvent.id}`,
          eventData
        );
        alert("Evento actualizado exitosamente.");
      } else {
        const response = await axios.post(
          "/api/calendar/create-event",
          eventData
        );
        console.log("Evento creado:", response.data);
        alert("Reunión programada exitosamente.");
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error al programar la reunión:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message;
      alert("Error al programar la reunión: " + errorMessage);
    }
  };

  const resetForm = () => {
    setMeetingDetails({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "meeting",
      attendeeType: "client", // Valor por defecto
    });
    setSelectedClient(null);
    setSelectedEvent(null);
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
              <select
                name="status"
                onChange={handleFilterChange}
                className="filter-dropdown"
              >
                <option value="">Estado</option>
                <option value="activo">Activo</option>
                <option value="en proceso">En proceso</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <select
                name="occupation"
                onChange={handleFilterChange}
                className="filter-dropdown"
              >
                <option value="">Ocupación</option>
                <option value="profesion">Profesión</option>
                <option value="empleo">Empleado</option>
              </select>
              <select
                name="gender"
                onChange={handleFilterChange}
                className="filter-dropdown"
              >
                <option value="">Sexo</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
              </select>
            </div>

            {filteredClients.slice(0, visibleClients).map((client) => (
              <div key={client.id_cliente} className="client">
                <div
                  onClick={() => toggleExpandClient(client.id_cliente)}
                  className="client-header"
                >
                  <span className="bold">{client.nombre_completo}</span> -{" "}
                  {client.estado_cuenta}
                </div>

                {expandedClient === client.id_cliente && (
                  <div className="client-details">
                    <ul>
                      <li>Email: {client.correo_electronico}</li>
                      <li>Estado: {client.estado_cuenta}</li>
                      <li>Ocupación: {client.ocupacion}</li>
                    </ul>

                    <div className="notes-section">
                      <h4>Notas del Cliente</h4>

                      {/* Área para crear nueva nota */}
                      <div className="new-note-area">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Escribe una nueva nota..."
                          className="note-textarea"
                          maxLength="255"
                        />
                        <button
                          onClick={() => handleCreateNote(client.id_cliente)}
                          className="create-note-btn"
                        >
                          Guardar Nota
                        </button>
                      </div>

                      {/* Lista de notas existentes */}
                      <div className="notes-list">
                        {isLoadingNotes ? (
                          <p>Cargando notas...</p>
                        ) : clientNotes[client.id_cliente]?.length > 0 ? (
                          clientNotes[client.id_cliente].map((note) => (
                            <div key={note.id_nota} className="note-item">
                              {editingNote === note.id_nota ? (
                                <div className="edit-note-area">
                                  <textarea
                                    value={editNoteContent}
                                    onChange={(e) =>
                                      setEditNoteContent(e.target.value)
                                    }
                                    className="note-textarea"
                                    maxLength="255"
                                  />
                                  <div className="note-actions">
                                    <button
                                      onClick={() =>
                                        handleSaveEditedNote(
                                          note.id_nota,
                                          client.id_cliente
                                        )
                                      }
                                      className="save-note-btn"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => setEditingNote(null)}
                                      className="cancel-btn"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="note-content">
                                  <p>{note.contenido}</p>
                                  <small className="note-date">
                                    {new Date(
                                      note.fecha_creacion
                                    ).toLocaleString()}
                                  </small>
                                  <div className="note-actions">
                                    <button
                                      onClick={() => handleStartEditNote(note)}
                                      className="edit-btn"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteNote(
                                          note.id_nota,
                                          client.id_cliente
                                        )
                                      }
                                      className="delete-btn"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>No hay notas para este cliente</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {visibleClients < filteredClients.length && (
              <button onClick={showMoreClients} className="load-more-btn">
                Cargar más clientes
              </button>
            )}
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
            onClick={handleNavigateFormFill}
          >
            Llenado de Solicitud
          </button>
          <button
            className="financial-projection-btn container"
            onClick={handleNavigateInteractiveBoard}
          >
            Pizarron Interactivo
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
              userType="advisor"
            />

            <EventFormModal
              show={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              initialData={selectedEvent}
              selectedDate={selectedDate}
              userType="advisor"
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
