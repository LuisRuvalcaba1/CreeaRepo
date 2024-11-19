import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import EventFormModal from "./EventFormModal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventAdd, onEventEdit, onEventDelete }) => {
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

    return {
      className: className,
    };
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

  const handleSaveEvent = (eventData) => {
    if (selectedEvent) {
      onEventEdit(eventData);
    } else {
      onEventAdd(eventData);
    }
    setShowEventForm(false);
  };

  const handleDeleteEvent = (event) => {
    if (event) {
      onEventDelete(event.id || event);
      setShowEventForm(false);
      setSelectedEvent(null);
    }
  };

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
      />

      {showEventForm && (
        <EventFormModal
          show={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          initialData={selectedEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default EventCalendar;
