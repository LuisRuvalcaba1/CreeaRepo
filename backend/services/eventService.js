const { getConnection } = require('../db');
const { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } = require('../services/googleCalendarService');

/**
 * Crear un evento en la base de datos y en Google Calendar
 */
async function createEvent(eventDetails) {
    const connection = getConnection();
    let googleEvent = {};
    if (!eventDetails.title || !eventDetails.startDateTime || !eventDetails.endDateTime) {
        throw new Error('Faltan campos obligatorios para crear el evento.');
    }

    if (eventDetails.eventType === 'meeting') {
        try {
            googleEvent = await createGoogleEvent({
                title: eventDetails.title,
                startDateTime: eventDetails.startDateTime,
                endDateTime: eventDetails.endDateTime,
                attendees: eventDetails.attendees || [], // Asegurar que sea un array
            });

            eventDetails.meetLink = googleEvent.meetLink || null;
            eventDetails.googleEventId = googleEvent.googleEventId || null;
        } catch (error) {
            console.error('Error al crear evento en Google Meet:', error.message);
            throw new Error('Error al crear el evento en Google Meet.');
        }
    }

    // Obtener correos electrónicos del cliente y asesor
    try {
        const [client] = await connection.query(
            `SELECT u.correo_electronico AS email 
             FROM cliente c 
             JOIN usuario u ON c.id_usuario = u.id_usuario 
             WHERE c.id_cliente = ?`,
            [eventDetails.clientId]
        );

        const [advisor] = await connection.query(
            `SELECT correo_electronico AS email 
             FROM usuario 
             WHERE id_usuario = ?`,
            [eventDetails.createdBy]
        );

        if (!client.length || !advisor.length) {
            throw new Error('No se encontró el cliente o el asesor asociado.');
        }

        eventDetails.clientEmail = client[0].email || '';
        eventDetails.advisorEmail = advisor[0].email || '';
    } catch (error) {
        console.error('Error al obtener correos del cliente o asesor:', error.message);
        throw new Error('Error al obtener información del cliente o asesor.');
    }

    // Insertar evento en la base de datos
    try {
        const [result] = await connection.query(
            `INSERT INTO events (title, start_datetime, end_datetime, event_type, meet_link, created_by, client_id, google_event_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eventDetails.title,
                eventDetails.startDateTime,
                eventDetails.endDateTime,
                eventDetails.eventType,
                eventDetails.meetLink || null,
                eventDetails.createdBy,
                eventDetails.clientId,
                eventDetails.googleEventId || null,
            ]
        );

        return { id: result.insertId, ...eventDetails };
    } catch (error) {
        console.error('Error al insertar evento en la base de datos:', error.message);
        throw new Error('Error al guardar el evento en la base de datos.');
    }
}

/**
 * Obtener eventos de un usuario (cliente o asesor)
 */
const getEventsByUser = async (advisorId) => {
    const connection = getConnection();
    const query = `
    SELECT id, title, start_datetime AS start, end_datetime AS end
    FROM events
    WHERE created_by = ? OR client_id = ?`;
    const [rows] = await connection.query(query, [advisorId, advisorId]);
    return rows;
};

/**
 * Actualizar un evento en la base de datos y en Google Calendar
 */
async function updateEvent(eventId, updatedDetails) {
    const connection = getConnection();
    const { title, startDateTime, endDateTime, eventType } = updatedDetails;

    const [event] = await connection.query(`SELECT google_event_id FROM events WHERE id = ?`, [eventId]);
    if (!event.length) {
        throw new Error('Evento no encontrado');
    }

    await updateGoogleEvent(event[0].google_event_id, {
        title,
        startDateTime,
        endDateTime,
        eventType,
        attendees: updatedDetails.attendees || [],
    });

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

    const [event] = await connection.query(`SELECT google_event_id FROM events WHERE id = ?`, [eventId]);
    if (!event.length) {
        throw new Error('Evento no encontrado');
    }

    await deleteGoogleEvent(event[0].google_event_id);

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