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
  const [selectedDate, setSelectedDate] = useState(null);  // Estado para la fecha seleccionada

  // Cuando se selecciona un espacio en el calendario
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);  // Capturamos la fecha seleccionada
    setSelectedEvent(null);  // Si se trata de un nuevo evento
    setShowEventForm(true);  // Abre el modal
  };

  // Cuando se selecciona un evento existente
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);  // Usa la fecha del evento seleccionado
    setShowEventForm(true);  // Abre el modal para editar
  };

  // Guardar un nuevo evento o editar uno existente
  const handleSaveEvent = (eventData) => {
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = eventData.time.split(':');
    startDateTime.setHours(hours);
    startDateTime.setMinutes(minutes);

    const newEvent = {
      id: selectedEvent ? selectedEvent.id : events.length + 1,  // Generar un id único si es nuevo
      title: eventData.title,
      start: startDateTime,  // Fecha de inicio
      end: new Date(startDateTime.getTime() + 60 * 60 * 1000),  // Añadimos una hora al tiempo de finalización
      link: eventData.link,  // Enlace si es un evento de Google Meet
    };

    if (selectedEvent) {
      // Editar un evento existente
      onEventEdit({ ...selectedEvent, ...newEvent });
    } else {
      // Crear un nuevo evento
      onEventAdd(newEvent);
    }
    
    setShowEventForm(false);
  };

  // Eliminar un evento
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
          selectedDate={selectedDate}  // Pasamos la fecha seleccionada al modal
        />
      )}
    </div>
  );
};

export default EventCalendar;
