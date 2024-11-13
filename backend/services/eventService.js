const { getConnection } = require('../db');
const { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } = require('../services/googleCalendarService');

/**
 * Crear un evento en la base de datos y en Google Calendar
 */
async function createEvent(eventDetails) {
    const connection = getConnection();
    let googleEvent = {};
  
    if (eventDetails.eventType === 'meeting') {
      googleEvent = await createGoogleEvent({
        title: eventDetails.title,
        startDateTime: eventDetails.startDateTime,
        endDateTime: eventDetails.endDateTime,
        attendees: eventDetails.attendees || [],
      });
  
      eventDetails.meetLink = googleEvent.meetLink || null;
      eventDetails.googleEventId = googleEvent.googleEventId;
    }
  
    // Obtener correos electrónicos del cliente y asesor
    const [client] = await connection.query(`SELECT email FROM clients WHERE id = ?`, [eventDetails.clientId]);
    const [advisor] = await connection.query(`SELECT email FROM users WHERE id = ?`, [eventDetails.createdBy]);
  
    eventDetails.clientEmail = client[0]?.email || '';
    eventDetails.advisorEmail = advisor[0]?.email || '';
  
    const [result] = await connection.query(
      `INSERT INTO events (title, start_datetime, end_datetime, event_type, meet_link, created_by, client_id, google_event_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        eventDetails.startDateTime,
        eventDetails.endDateTime,
        eventDetails.eventType,
        eventDetails.meetLink,
        eventDetails.createdBy,
        eventDetails.clientId,
        eventDetails.googleEventId || null,
      ]
    );
  
    return { id: result.insertId, ...eventDetails };
  }
  
/**
 * Obtener eventos de un usuario (cliente o asesor)
 */
async function getEventsByUser(userId) {
    const connection = getConnection();
    const [events] = await connection.query(
        `SELECT * FROM events WHERE created_by = ? OR client_id = ?`,
        [userId, userId]
    );
    return events;
}

/**
 * Actualizar un evento en la base de datos y en Google Calendar
 */
async function updateEvent(eventId, updatedDetails) {
    const connection = getConnection();
    const { title, startDateTime, endDateTime, eventType } = updatedDetails;

    // Obtener el ID del evento en Google Calendar desde la base de datos
    const [event] = await connection.query(`SELECT google_event_id FROM events WHERE id = ?`, [eventId]);
    if (event.length === 0) {
        throw new Error('Evento no encontrado');
    }

    // Actualizar el evento en Google Calendar
    await updateGoogleEvent(event[0].google_event_id, {
        title,
        startDateTime,
        endDateTime,
        eventType,
        attendees: updatedDetails.attendees || [],
    });

    // Actualizar el evento en la base de datos
    const [result] = await connection.query(
        `UPDATE events 
         SET title = ?, start_datetime = ?, end_datetime = ?, event_type = ?
         WHERE id = ?`,
        [title, startDateTime, endDateTime, eventType, eventId]
    );

    return result.affectedRows > 0;
}

/**
 * Eliminar un evento de la base de datos y de Google Calendar
 */
async function deleteEvent(eventId) {
    const connection = getConnection();

    // Obtener el ID del evento en Google Calendar desde la base de datos
    const [event] = await connection.query(`SELECT google_event_id FROM events WHERE id = ?`, [eventId]);
    if (event.length === 0) {
        throw new Error('Evento no encontrado');
    }

    // Eliminar el evento de Google Calendar
    await deleteGoogleEvent(event[0].google_event_id);

    // Eliminar el evento de la base de datos
    const [result] = await connection.query(`DELETE FROM events WHERE id = ?`, [eventId]);

    return result.affectedRows > 0;
}

/**
 * Obtener eventos programados para las próximas 24 horas
 */
async function obtenerEventosProximos24Horas() {
    const connection = getConnection();
    const [rows] = await connection.query(`
      SELECT * FROM events
      WHERE start_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 DAY)
    `);
    return rows;
}

module.exports = {
    createEvent,
    getEventsByUser,
    updateEvent,
    deleteEvent,
    obtenerEventosProximos24Horas,
};
