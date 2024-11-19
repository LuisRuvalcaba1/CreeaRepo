import React from "react";
import "./EventViewModal.css";

const EventViewModal = ({ show, onClose, eventData }) => {
  if (!show || !eventData) return null;

  // Formatear fecha y hora para mostrar
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Determinar el tipo de evento y su ícono
  const getEventTypeInfo = () => {
    if (eventData.eventType === "meeting") {
      return {
        label: "Reunión Virtual",
        icon: "🎥",
        className: "meeting-type"
      };
    }
    return {
      label: "Evento",
      icon: "📅",
      className: "event-type"
    };
  };

  const eventTypeInfo = getEventTypeInfo();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className={`event-type-badge ${eventTypeInfo.className}`}>
            {eventTypeInfo.icon} {eventTypeInfo.label}
          </span>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <h2>{eventData.title}</h2>
          
          <div className="event-details">
            <div className="detail-item">
              <span className="detail-icon">🕒</span>
              <div className="detail-content">
                <strong>Inicio:</strong>
                <p>{formatDateTime(eventData.start)}</p>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <div className="detail-content">
                <strong>Fin:</strong>
                <p>{formatDateTime(eventData.end)}</p>
              </div>
            </div>

            {eventData.meetLink && (
              <div className="detail-item">
                <span className="detail-icon">🔗</span>
                <div className="detail-content">
                  <strong>Link de la reunión:</strong>
                  <a 
                    href={eventData.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meet-link"
                  >
                    Unirse a la reunión
                  </a>
                </div>
              </div>
            )}

            {eventData.description && (
              <div className="detail-item">
                <span className="detail-icon">📝</span>
                <div className="detail-content">
                  <strong>Descripción:</strong>
                  <p>{eventData.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventViewModal;