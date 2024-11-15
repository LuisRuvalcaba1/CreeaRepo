const express = require('express');
const router = express.Router();
const { createEvent, updateEvent, deleteEvent, getEventsByUser, blockTimeInterval, getUpcomingBirthdays } = require('../services/eventService'); // Servicio para la base de datos
const { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } = require('../services/googleCalendarService'); // Servicio para Google Calendar
const { sendConfirmationEmail, sendCancellationEmail } = require('../services/emailService'); // Servicio de correos
const cron = require('node-cron');

// Crear un evento y guardar en Google Calendar y en la base de datos
router.post('/create-event', async (req, res) => {
  const eventDetails = {
    title: req.body.title,
    description: req.body.description || '',
    startDateTime: req.body.startDateTime,
    endDateTime: req.body.endDateTime,
    eventType: req.body.eventType,
    createdBy: req.body.createdBy,
    clientId: req.body.clientId,
    meetLink: null,
    googleEventId: null,
  };

  if (!eventDetails.title || !eventDetails.startDateTime || !eventDetails.endDateTime || !eventDetails.createdBy || !eventDetails.clientId) {
    return res.status(400).json({ error: 'Datos incompletos para crear el evento' });
  }
  if (new Date(eventDetails.startDateTime) >= new Date(eventDetails.endDateTime)) {
    return res.status(400).json({ error: 'La hora de término debe ser posterior a la hora de inicio.' });
  }  

  try {
    if (eventDetails.eventType === 'meeting') {
      const googleEvent = await createGoogleEvent({
        title: eventDetails.title,
        description: eventDetails.description,
        startDateTime: eventDetails.startDateTime,
        endDateTime: eventDetails.endDateTime,
        attendees: req.body.attendees || [],
      });

      eventDetails.meetLink = googleEvent.meetLink || null;
      eventDetails.googleEventId = googleEvent.googleEventId;
    }

    const savedEvent = await createEvent(eventDetails);

    if (req.body.attendees && req.body.attendees.length > 0) {
      try {
        await sendConfirmationEmail({
          to: req.body.attendees[0].email,
          subject: 'Confirmación de Evento',
          text: `Tu evento ha sido programado para el ${eventDetails.startDateTime}. Únete con este enlace: ${eventDetails.meetLink || 'No hay enlace de Meet'}`,
        });
      } catch (error) {
        console.error('Error al enviar el correo de confirmación:', error);
      }
    }

    res.status(201).json({
      message: 'Evento creado exitosamente',
      eventData: savedEvent,
      meetLink: eventDetails.meetLink,
      googleEventId: eventDetails.googleEventId,
    });
  } catch (error) {
    console.error('Error al crear el evento:', error);
    res.status(500).json({ error: 'Error al crear el evento', details: error.message });
  }
});

// Obtener eventos por asesor
router.get('/get-events', async (req, res) => {
  const { advisorId } = req.query;

  if (!advisorId) {
    return res.status(400).json({ error: 'Falta el parámetro advisorId' });
  }

  try {
    const events = await getEventsByUser(advisorId); // Función en eventService para obtener eventos
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No se encontraron eventos para este asesor.' });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos.' });
  }
});

// Actualizar un evento en la base de datos y en Google Calendar
router.put('/update-event/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { title, description, startDateTime, endDateTime, eventType, attendees } = req.body;

  if (!title || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'Datos incompletos para actualizar el evento' });
  }

  if (new Date(startDateTime) >= new Date(endDateTime)) {
    return res.status(400).json({ error: 'La hora de término debe ser posterior a la hora de inicio.' });
  }

  try {
    const updatedDetails = {
      title,
      description,
      startDateTime,
      endDateTime,
      eventType,
    };

    const event = await updateEvent(eventId, updatedDetails);

    if (event.googleEventId) {
      await updateGoogleEvent(event.googleEventId, {
        title,
        description,
        startDateTime,
        endDateTime,
        attendees,
      });
    }

    res.status(200).json({ message: 'Evento actualizado correctamente', event });
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    res.status(500).json({ error: 'Error al actualizar el evento.', details: error.message });
  }
});
// Obtener eventos para un usuario
router.get('/events', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Falta el parámetro userId' });
  }

  try {
    const events = await getEventsByUser(userId);
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No se encontraron eventos para este usuario.' });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos.' });
  }
});
// Eliminar un evento y enviar correo de cancelación
router.delete('/delete-event/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await deleteEvent(eventId);

    if (event.googleEventId) {
      await deleteGoogleEvent(event.googleEventId);
    }

    // Enviar correo de cancelación al cliente
    if (event.clientId && event.clientEmail) { // Asegurar que clientEmail esté definido
      try {
        await sendCancellationEmail({
          to: event.clientEmail, // Correo del cliente asociado
          subject: 'Cancelación de Evento',
          text: `El evento titulado "${event.title}" programado para el ${event.startDateTime} ha sido cancelado.`,
        });
      } catch (error) {
        console.error('Error al enviar el correo de cancelación:', error);
      }
    }

    res.status(200).json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    res.status(500).json({ error: 'Error al eliminar el evento' });
  }
});
// Bloquear intervalos de tiempo para un asesor
router.post('/block-interval', async (req, res) => {
  const { userId, startDateTime, endDateTime } = req.body;

  if (!userId || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'Datos incompletos para bloquear intervalo de tiempo.' });
  }

  try {
    await blockTimeInterval({ userId, startDateTime, endDateTime });
    res.status(200).json({ message: 'Intervalo de tiempo bloqueado correctamente.' });
  } catch (error) {
    console.error('Error al bloquear intervalo de tiempo:', error);
    res.status(500).json({ error: 'Error al bloquear intervalo de tiempo.' });
  }
});
// Programar cron job para recordatorios de cumpleaños
cron.schedule('0 9 * * *', async () => {
  try {
    const upcomingBirthdays = await getUpcomingBirthdays(); // Obtener clientes con cumpleaños próximos

    for (const client of upcomingBirthdays) {
      if (client.email && client.name && client.birthdate) { // Validar datos necesarios
        await sendConfirmationEmail({
          to: client.email,
          subject: 'Recordatorio de Cumpleaños',
          text: `Recuerda felicitar a ${client.name}, su cumpleaños es el ${client.birthdate}.`,
        });
      } else {
        console.error('Datos incompletos para enviar recordatorio de cumpleaños:', client);
      }
    }
  } catch (error) {
    console.error('Error al enviar recordatorios de cumpleaños:', error);
  }
});
module.exports = router;
