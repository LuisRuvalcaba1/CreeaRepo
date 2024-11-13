import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import EventFormModal from './EventFormModal'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventCalendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventAdd, onEventEdit, onEventDelete }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Cuando se selecciona un espacio en el calendario
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  // Cuando se selecciona un evento existente
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setShowEventForm(true);
  };

  const handleSaveEvent = (eventData) => {
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = eventData.time.split(':');
    startDateTime.setHours(hours);
    startDateTime.setMinutes(minutes);

    const newEvent = {
      id: selectedEvent ? selectedEvent.id : events.length + 1,
      title: eventData.title,
      start: startDateTime,
      end: new Date(startDateTime.getTime() + 60 * 60 * 1000),
      link: eventData.link,
    };

    if (selectedEvent) {
      onEventEdit({ ...selectedEvent, ...newEvent });
    } else {
      onEventAdd(newEvent);
    }

    setShowEventForm(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      onEventDelete(selectedEvent);
      setShowEventForm(false);
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
      />

      {showEventForm && (
        <EventFormModal
          show={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          initialData={selectedEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default EventCalendar;
