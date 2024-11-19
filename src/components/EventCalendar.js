import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import EventFormModal from "./EventFormModal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventAdd, onEventEdit, onEventDelete, userType }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const eventStyleGetter = (event) => {
    let className = "";
    switch (event.event_type) {
      case "advisor":
        className = "rbc-event-asesor";
        break;
      case "both":
        className = "rbc-event-both";
        break;
      default:
        className = "rbc-event";
    }
    return { className };
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        await onEventEdit(eventData);
      } else {
        await onEventAdd(eventData);
      }
      setShowEventForm(false);
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleDeleteEvent = async (event) => {
    if (event) {
      try {
        await onEventDelete(event.id || event);
        setShowEventForm(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    }
  };

  const CustomEvent = ({ event }) => (
    <div className="rbc-event-content">
      <span className="event-title">{event.title}</span>
      {event.meetLink && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(event.meetLink, '_blank');
          }}
          className="meet-link-button"
          title="Unirse a la reunión"
        >
          Meet
        </button>
      )}
    </div>
  );

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent
        }}
      />

      {showEventForm && (
        <EventFormModal
          show={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          initialData={selectedEvent}
          selectedDate={selectedDate}
          userType={userType}
        />
      )}
    </div>
  );
};

export default EventCalendar;