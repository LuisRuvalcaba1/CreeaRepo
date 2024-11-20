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
    selectedClient: null,
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advisors, setAdvisors] = useState([]);

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    // Formatear la fecha manteniendo la zona horaria local
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (show && selectedDate) {
      const startDate = new Date(selectedDate);
      // Redondear a los próximos 15 minutos sin afectar la zona horaria
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

      if (userType === "advisor") {
        loadClients();
      }
      if (userType === "promoter") {
        loadAdvisors();
      }
    }
  }, [show, selectedDate, userType]);

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

  useEffect(() => {
    if (!show) {
      setFormData({
        title: "",
        startDateTime: "",
        endDateTime: "",
        eventType: "meeting",
        selectedClient: null,
      });
      setError("");
    } else if (initialData?.id) {
      setFormData({
        title: initialData.title || "",
        startDateTime: formatDateTimeForInput(initialData.start) || "",
        endDateTime: formatDateTimeForInput(initialData.end) || "",
        eventType: initialData.eventType || "meeting",
        selectedClient:
          clients.find((c) => c.id_cliente === initialData.clientId) || null,
      });
    }
  }, [show, initialData, clients]);

  const loadClients = async () => {
    const advisorId = sessionStorage.getItem("userId");
    if (!advisorId) {
      setError("No se encontró ID del asesor");
      return;
    }

    try {
      const response = await fetch(
        `/api/calendar/get-clients-asesor?advisorId=${advisorId}`
      );
      if (!response.ok) {
        throw new Error(`Error al cargar clientes: ${response.statusText}`);
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError("Error al cargar la lista de clientes");
      console.error("Error loading clients:", err);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error("El título es obligatorio");
    }

    if (userType === "advisor" && !formData.selectedClient) {
      throw new Error("Por favor, seleccione un cliente");
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      throw new Error("Las fechas de inicio y término son obligatorias");
    }

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Fechas inválidas");
    }

    if (start >= end) {
      throw new Error(
        "La hora de término debe ser posterior a la hora de inicio"
      );
    }
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);

    try {
      validateForm();

      const userId = sessionStorage.getItem("userId");
      const userEmail = sessionStorage.getItem("userEmail");

      if (!userId) {
        throw new Error("No se encontró ID del usuario");
      }

      // Crear fechas manteniendo la zona horaria local
      const startDateTime = new Date(formData.startDateTime);
      const endDateTime = new Date(formData.endDateTime);

      let eventData = {
        title: formData.title.trim(),
        startDateTime: startDateTime.toJSON(),
        endDateTime: endDateTime.toJSON(),
        eventType: formData.eventType,
        createdBy: parseInt(userId),
      };

      if (userType === "advisor") {
        eventData = {
          ...eventData,
          clientId: formData.selectedClient.id_cliente,
          attendees: [{ email: formData.selectedClient.correo_electronico }],
        };
      } else if (userType === "client") {
        eventData.clientEmail = userEmail;
      }

      let response;
      if (initialData?.id) {
        response = await fetch(`/api/calendar/update-event/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        const endpoint =
          userType === "client"
            ? "/api/calendar/create-event-client"
            : "/api/calendar/create-event";

        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el evento");
      }

      const responseData = await response.json();
      onSave(responseData.eventData);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !initialData?.id) return;

    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      setLoading(true);
      try {
        onDelete(initialData.id);
        onClose();
      } catch (error) {
        setError("Error al eliminar el evento");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          {initialData?.id ? "Editar Evento" : "Nuevo Evento"}
        </h2>

        <div className="form-container">
          {/* Selector de cliente solo para asesores */}
          {userType === "advisor" && (
            <div className="form-group">
              <label className="form-label">
                Cliente: <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.selectedClient?.id_cliente || ""}
                onChange={(e) => {
                  const client = clients.find(
                    (c) => c.id_cliente === parseInt(e.target.value)
                  );
                  setFormData((prev) => ({ ...prev, selectedClient: client }));
                }}
                disabled={loading}
              >
                <option value="">Seleccione un cliente</option>
                {clients.map((client) => (
                  <option key={client.id_cliente} value={client.id_cliente}>
                    {client.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div className="form-group">
            <label className="form-label">Tipo de Evento:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="meeting"
                  checked={formData.eventType === "meeting"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, eventType: "meeting" }))
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

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

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
                onClick={handleDelete}
                disabled={loading}
                className="delete-button"
                type="button"
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
    </div>
  );
};

export default EventFormModal;
