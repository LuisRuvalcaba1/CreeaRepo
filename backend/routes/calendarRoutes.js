const express = require("express");
const router = express.Router();
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByUser,
  getClientsByUserType,
  getAdvisors,
  createEventByClient,
  createEventByPromotor,
  blockTimeInterval,
  getUpcomingBirthdays,
} = require("../services/eventService"); // Servicio para la base de datos
const {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} = require("../services/googleCalendarService"); // Servicio para Google Calendar
const {
  enviarConfirmacionCita,
  enviarCorreoCancelacion,
} = require("../services/emailService"); // Servicio de correos
const cron = require("node-cron");

// Crear un evento y guardar en Google Calendar y en la base de datos
router.post("/create-event", async (req, res) => {
  console.log("Datos recibidos para crear evento:", req.body);

  try {
    const eventDetails = {
      title: req.body.title,
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      eventType: req.body.eventType || "event",
      createdBy: req.body.createdBy,
      clientId: req.body.clientId,
      advisorId: req.body.advisorId,
      attendeeType: req.body.attendeeType || "client",
      attendees: req.body.attendees || [],
    };

    const savedEvent = await createEvent(eventDetails);

    res.status(201).json({
      message: "Evento creado exitosamente",
      eventData: savedEvent,
    });
  } catch (error) {
    console.error("Error en la ruta de crear evento:", error);
    res.status(500).json({
      error: "Error al crear el evento",
      details: error.message,
    });
  }
});

router.post("/create-event-client", async (req, res) => {
  console.log("Datos recibidos para crear evento de cliente:", req.body);

  try {
    const eventDetails = {
      title: req.body.title,
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      eventType: req.body.eventType || "event",
      createdBy: req.body.createdBy,
      clientEmail: req.body.clientEmail, // Añadir el email del cliente si está disponible
    };

    const savedEvent = await createEventByClient(eventDetails);

    res.status(201).json({
      message: "Evento creado exitosamente",
      eventData: savedEvent,
    });
  } catch (error) {
    console.error("Error en la ruta de crear evento de cliente:", error);
    res.status(500).json({
      error: "Error al crear el evento",
      details: error.message,
    });
  }
});

router.post("/create-event-promotor", async (req, res) => {
  console.log("Datos recibidos para crear evento por promotor:", req.body);

  try {
    const eventDetails = {
      title: req.body.title,
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      eventType: req.body.eventType || "event",
      createdBy: req.body.createdBy,
      attendeeType: req.body.attendeeType,
      events: req.body.events // Array de eventos para clientes y/o asesores
    };

    const savedEvents = await createEventByPromotor(eventDetails);

    res.status(201).json({
      message: "Eventos creados exitosamente",
      eventData: savedEvents
    });
  } catch (error) {
    console.error("Error en la ruta de crear evento por promotor:", error);
    res.status(500).json({
      error: "Error al crear el evento",
      details: error.message
    });
  }
});

router.get("/advisors", async (req, res) => {
  try {
    const advisors = await getAdvisors();
    res.status(200).json(advisors);
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    res.status(500).json({ error: "Error al obtener la lista de asesores." });
  }
});

router.get("/get-clients-asesor", async (req, res) => {
  const { advisorId } = req.query;

  if (!advisorId) {
    return res.status(400).json({ error: "Falta el parámetro advisorId" });
  }

  try {
    const clients = await getClientsByUserType(advisorId);
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        message: "No se encontraron clientes.",
      });
    }
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes." });
  }
});
// Obtener eventos por asesor
router.get("/get-events", async (req, res) => {
  const { advisorId } = req.query;

  if (!advisorId) {
    return res.status(400).json({ error: "Falta el parámetro advisorId" });
  }

  try {
    const events = await getEventsByUser(advisorId);
    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No se encontraron eventos." });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ error: "Error al obtener eventos." });
  }
});

router.get("/get-events-promotor", async (req, res) => {
  const { promotorID } = req.query;
  console.log(promotorID);
  if (!promotorID) {
    return res.status(400).json({ error: "Falta el parámetro promotorID" });
  }

  try {
    const events = await getEventsByUser(promotorID); // Función en eventService para obtener eventos
    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron eventos para este asesor." });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ error: "Error al obtener eventos." });
  }
});

// Actualizar un evento en la base de datos y en Google Calendar
router.put("/update-event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  console.log("Actualizando evento:", { eventId, body: req.body });

  try {
    if (!req.body.title || !req.body.startDateTime || !req.body.endDateTime) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const eventDetails = {
      title: req.body.title,
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      eventType: req.body.eventType || "event",
      clientId: req.body.clientId,
      advisorId: req.body.advisorId,
      attendeeType: req.body.attendeeType || "client",
      meetLink: req.body.meetLink,
    };

    const updatedEvent = await updateEvent(eventId, eventDetails);

    res.status(200).json({
      message: "Evento actualizado exitosamente",
      eventData: updatedEvent,
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(500).json({
      error: "Error al actualizar el evento",
      details: error.message,
    });
  }
});

// Obtener eventos para un usuario
router.get("/events", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el parámetro userId" });
  }

  try {
    const events = await getEventsByUser(userId);
    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron eventos para este usuario." });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ error: "Error al obtener eventos." });
  }
});

// Eliminar un evento y enviar correo de cancelación
router.delete("/delete-event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  console.log("Eliminando evento:", eventId);

  try {
    await deleteEvent(eventId);
    res.status(200).json({
      message: "Evento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(500).json({
      error: "Error al eliminar el evento",
      details: error.message,
    });
  }
});

// Bloquear intervalos de tiempo para un asesor
router.post("/block-interval", async (req, res) => {
  const { userId, startDateTime, endDateTime } = req.body;

  if (!userId || !startDateTime || !endDateTime) {
    return res
      .status(400)
      .json({ error: "Datos incompletos para bloquear intervalo de tiempo." });
  }

  try {
    await blockTimeInterval({ userId, startDateTime, endDateTime });
    res
      .status(200)
      .json({ message: "Intervalo de tiempo bloqueado correctamente." });
  } catch (error) {
    console.error("Error al bloquear intervalo de tiempo:", error);
    res.status(500).json({ error: "Error al bloquear intervalo de tiempo." });
  }
});

// Programar cron job para recordatorios de cumpleaños
cron.schedule("0 9 * * *", async () => {
  try {
    const upcomingBirthdays = await getUpcomingBirthdays(); // Obtener clientes con cumpleaños próximos

    for (const client of upcomingBirthdays) {
      if (client.email && client.name && client.birthdate) {
        // Validar datos necesarios
        await enviarConfirmacionCita({
          to: client.email,
          subject: "Recordatorio de Cumpleaños",
          text: `Recuerda felicitar a ${client.name}, su cumpleaños es el ${client.birthdate}.`,
        });
      } else {
        console.error(
          "Datos incompletos para enviar recordatorio de cumpleaños:",
          client
        );
      }
    }
  } catch (error) {
    console.error("Error al enviar recordatorios de cumpleaños:", error);
  }
});
module.exports = router;
