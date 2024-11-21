import React, { useState, useEffect } from "react";
import "./EventFormModal.css";

const EventFormModal = ({
  show,
  onClose,
  onSave,
  onDelete,
  initialData = {},
  selectedDate,
  userType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    eventType: "meeting",
    attendeeType: "client",
  });

  const [clients, setClients] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const loadAdvisors = async () => {
    try {
      const response = await fetch("/api/calendar/advisors");
      if (!response.ok) {
        throw new Error(`Error al cargar asesores: ${response.statusText}`);
      }
      const data = await response.json();
      setAdvisors(data);
    } catch (err) {
      setError("Error al cargar la lista de asesores");
      console.error("Error loading advisors:", err);
    }
  };

  const loadClients = async () => {
    try {
      const promotorID = sessionStorage.getItem("userId");
      const response = await fetch(
        `/api/calendar/get-clients-asesor?advisorId=${promotorID}`
      );
      if (!response.ok) {
        throw new Error(`Error al cargar clientes: ${response.statusText}`);
      }
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar la lista de clientes");
      console.error("Error loading clients:", err);
    }
  };

  useEffect(() => {
    if (show) {
      if (userType === "promoter") {
        loadClients();
        loadAdvisors();
      } else if (userType === "advisor") {
        loadClients();
      }

      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const minutes = startDate.getMinutes();
        const roundedMinutes = Math.ceil(minutes / 15) * 15;
        startDate.setMinutes(roundedMinutes);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        setFormData((prev) => ({
          ...prev,
          startDateTime: formatDateTimeForInput(startDate),
          endDateTime: formatDateTimeForInput(endDate),
        }));
      }
    }
  }, [show, userType, selectedDate]);

  useEffect(() => {
    if (!show) {
      resetForm();
    } else if (initialData?.id) {
      setFormData({
        title: initialData.title || "",
        startDateTime: formatDateTimeForInput(initialData.start) || "",
        endDateTime: formatDateTimeForInput(initialData.end) || "",
        eventType: initialData.eventType || "meeting",
        attendeeType: initialData.attendeeType || "client",
      });
      if (initialData.advisorId) {
        const advisor = advisors.find((a) => a.id === initialData.advisorId);
        setSelectedAdvisor(advisor || null);
      }
      if (initialData.clientId) {
        const client = clients.find(
          (c) => c.id_cliente === initialData.clientId
        );
        setSelectedClient(client || null);
      }
    }
  }, [show, initialData, clients, advisors]);

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      startDateTime: "",
      endDateTime: "",
      eventType: "meeting",
      attendeeType: "client",
    });
    setSelectedClient(null);
    setSelectedAdvisor(null);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
  
    try {
      if (!formData.title) {
        throw new Error("El título es obligatorio");
      }
  
      if (!formData.startDateTime || !formData.endDateTime) {
        throw new Error("Las fechas son obligatorias");
      }
  
      // Validaciones específicas según el tipo de usuario
      if (userType === "advisor" && !selectedClient) {
        throw new Error("Debe seleccionar un cliente");
      }
  
      if (userType === "promoter" && formData.attendeeType === "client" && !selectedClient) {
        throw new Error("Debe seleccionar un cliente");
      }
  
      if (userType === "promoter" && formData.attendeeType === "advisor" && !selectedAdvisor) {
        throw new Error("Debe seleccionar un asesor");
      }
  
      const eventData = {
        title: formData.title.trim(),
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        eventType: formData.eventType,
        attendeeType: formData.attendeeType,
        clientId: selectedClient?.id_cliente,
        advisorId: selectedAdvisor?.id,
        createdBy: sessionStorage.getItem("userId")
      };
  
      await onSave(eventData);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error al guardar el evento:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderClientSelection = () => (
    <div className="form-group">
      <label className="form-label">
        Cliente: <span className="required">*</span>
      </label>
      <select
        className="form-select"
        value={selectedClient?.id_cliente || ""}
        onChange={(e) => {
          const client = clients.find(
            (c) => c.id_cliente === parseInt(e.target.value)
          );
          setSelectedClient(client);
        }}
        disabled={loading || initialData?.id}
      >
        <option value="">Seleccione un cliente</option>
        {clients.map((client) => (
          <option key={client.id_cliente} value={client.id_cliente}>
            {client.nombre_completo}
          </option>
        ))}
      </select>
    </div>
  );

  const renderAdvisorSelection = () => (
    <div className="form-group">
      <label className="form-label">
        Asesor: <span className="required">*</span>
      </label>
      <select
        className="form-select"
        value={selectedAdvisor?.id || ""}
        onChange={(e) => {
          const advisor = advisors.find(
            (a) => a.id === parseInt(e.target.value)
          );
          setSelectedAdvisor(advisor);
        }}
        disabled={loading || initialData?.id}
      >
        <option value="">Seleccione un asesor</option>
        {advisors.map((advisor) => (
          <option key={advisor.id} value={advisor.id}>
            {advisor.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderAttendeeTypeSelection = () => (
    <div className="form-group">
      <label className="form-label">Tipo de Usuario:</label>
      <select
        className="form-select"
        value={formData.attendeeType}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            attendeeType: e.target.value,
          }))
        }
        disabled={loading || initialData?.id}
      >
        <option value="client">Cliente</option>
        <option value="advisor">Asesor</option>
      </select>
    </div>
  );

  useEffect(() => {
    console.log("Modal props received:", { show, initialData, selectedDate });
    if (show) {
      if (initialData) {
        console.log("Setting form data from initialData:", initialData);
        setFormData({
          title: initialData.title || "",
          startDateTime: initialData.startDateTime || "",
          endDateTime: initialData.endDateTime || "",
          eventType: initialData.eventType || "meeting",
        });
      }
    }
  }, [show, initialData, selectedDate]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          {initialData?.id ? "Editar Evento" : "Nuevo Evento"}
        </h2>

        <div className="form-container">
          {/* Mostrar selector de tipo de usuario solo para promotores */}
          {userType === "promoter" &&
            !initialData?.id &&
            renderAttendeeTypeSelection()}

          {/* Mostrar selección de asesor/cliente según el tipo de usuario */}
          {userType === "promoter" &&
            formData.attendeeType === "advisor" &&
            renderAdvisorSelection()}
          {((userType === "promoter" && formData.attendeeType === "client") ||
            userType === "advisor") &&
            renderClientSelection()}

          <div className="form-group">
            <label className="form-label">
              Título: <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Título del Evento"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Fecha y Hora de Inicio: <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.startDateTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDateTime: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Fecha y Hora de Término: <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.endDateTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endDateTime: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          {/* Mostrar selector de tipo de evento solo para asesores y promotores */}
          {(userType === "advisor" || userType === "promoter") &&
            !initialData?.id && (
              <div className="form-group">
                <label className="form-label">Tipo de Evento:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="meeting"
                      checked={formData.eventType === "meeting"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          eventType: "meeting",
                        }))
                      }
                      disabled={loading}
                    />
                    <span>Crear Evento con Google Meet</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="event"
                      checked={formData.eventType === "event"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, eventType: "event" }))
                      }
                      disabled={loading}
                    />
                    <span>Crear solo un evento</span>
                  </label>
                </div>
              </div>
            )}

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            onClick={handleSave}
            disabled={loading}
            className="save-button"
          >
            {loading
              ? "Guardando..."
              : initialData?.id
              ? "Actualizar"
              : "Guardar"}
          </button>
          {initialData?.id && (
            <button
              onClick={() => onDelete(initialData.id)}
              disabled={loading}
              className="delete-button"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={loading}
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
