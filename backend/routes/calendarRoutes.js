// backend/routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { createEvent } = require('../services/googleCalendarService');

router.post('/create-event', async (req, res) => {
  const { summary, startDateTime, endDateTime, attendees, eventType } = req.body;

  if (!summary || !startDateTime || !endDateTime || !attendees) {
    return res.status(400).json({ error: 'Datos incompletos para crear el evento' });
  }

  try {
    const eventDetails = { summary, startDateTime, endDateTime, attendees, eventType };
    const meetingLink = await createEvent(eventDetails);
    res.status(200).json({ message: 'Evento creado exitosamente', meetingLink });
  } catch (error) {
    console.error('Error al crear el evento:', error);
    res.status(500).json({ error: 'Error al crear el evento', details: error.message });
  }
});


module.exports = router;
