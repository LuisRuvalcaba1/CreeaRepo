import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventAdd, onEventEdit, onEventDelete, userType }) => {
  const eventStyleGetter = (event) => {
    let className = "";
    switch (event.event_type) {
      case "advisor":
        className = "rbc-event-asesor";
        break;
      default:
        className = "rbc-event";
    }
    return { className };
  };

  const handleSelectSlot = ({ start }) => {
    onEventAdd(start); // Solo pasar la fecha seleccionada
  };

  const handleSelectEvent = (event) => {
    onEventEdit(event); // Pasar el evento seleccionado
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
    </div>
  );
};

export default EventCalendar;