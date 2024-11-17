const { getConnection } = require("../db");
const {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} = require("../services/googleCalendarService");
const { enviarConfirmacionCita } = require("../services/emailService");

/**
 * Crear un evento en la base de datos y en Google Calendar
 */
async function createEvent(eventDetails) {
  const connection = getConnection();
  let googleEvent = {};

  // Validar datos antes de continuar
  if (
    !eventDetails.title ||
    !eventDetails.startDateTime ||
    !eventDetails.endDateTime ||
    !eventDetails.createdBy ||
    !eventDetails.clientId
  ) {
    throw new Error("Faltan campos obligatorios para crear el evento.");
  }

  // Verificar que el cliente pertenezca al asesor
  try {
    const [clientCheck] = await connection.query(
      `SELECT c.*, u.correo_electronico, c.nombre_completo
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_cliente = ?`,
      [eventDetails.clientId]
    );

    if (!clientCheck.length) {
      throw new Error("Cliente no encontrado");
    }

    // Permite crear eventos si es el asesor asignado
    if (clientCheck[0].id_asesor !== parseInt(eventDetails.createdBy)) {
      throw new Error("No tienes permiso para crear eventos para este cliente.");
    }

    eventDetails.clientEmail = clientCheck[0].correo_electronico;
    eventDetails.clientName = clientCheck[0].nombre_usuario;
  } catch (error) {
    console.error("Error al verificar permisos:", error);
    throw error;
  }

  // Crear evento en Google Calendar si es una reunión
  if (eventDetails.eventType === "meeting") {
    try {
      googleEvent = await createGoogleEvent({
        title: eventDetails.title,
        startDateTime: eventDetails.startDateTime,
        endDateTime: eventDetails.endDateTime,
        attendees: eventDetails.attendees || [],
      });

      eventDetails.meetLink = googleEvent.meetLink || null;
      eventDetails.googleEventId = googleEvent.googleEventId || null;
    } catch (error) {
      console.error("Error al crear evento en Google Meet:", error.message);
      throw new Error("Error al crear el evento en Google Meet.");
    }
  }

  // Insertar evento en la base de datos
  try {
    // Formatear las fechas para MySQL
    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const [result] = await connection.query(
      `INSERT INTO events (
        title, 
        start_datetime, 
        end_datetime, 
        event_type, 
        meet_link, 
        created_by, 
        client_id, 
        google_event_id
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        eventDetails.meetLink || null,
        eventDetails.createdBy,
        eventDetails.clientId,
        eventDetails.googleEventId || null,
      ]
    );

    const savedEvent = {
      id: result.insertId,
      ...eventDetails,
      start: formattedStartDate,
      end: formattedEndDate,
    };

    // Enviar correo de confirmación
    if (eventDetails.clientEmail) {
      try {
        const startDate = new Date(eventDetails.startDateTime);
        
        await enviarConfirmacionCita({
          to: eventDetails.clientEmail,
          eventDate: startDate.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          eventTime: startDate.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          link: eventDetails.meetLink || 'No hay enlace disponible'
        });
      } catch (emailError) {
        console.error("Error al enviar la confirmación de cita:", emailError);
        // No interrumpir la creación del evento si falla el envío del correo
      }
    }

    return savedEvent;
  } catch (error) {
    console.error("Error al insertar evento:", error);
    throw new Error("Error al guardar el evento en la base de datos: " + error.message);
  }
}


const getClientsByAdvisor = async (advisorId) => {
  const connection = getConnection();
  
  try {
    const [clients] = await connection.query(
      `SELECT * FROM cliente c
      JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_asesor = ?
      ORDER BY c.nombre_completo ASC`,
      [advisorId]
    );
    
    return clients;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('Error al obtener los clientes del asesor');
  }
};
/**
 * Obtener eventos de un usuario (cliente o asesor)
 */
const getEventsByUser = async (userId) => {
  const connection = getConnection();

  // Primero verificamos el tipo de usuario
  const userTypeQuery = `
        SELECT tipo_usuario 
        FROM usuario 
        WHERE id_usuario = ?`;

  const [userType] = await connection.query(userTypeQuery, [userId]);

  // Si es promotor, obtener todos los eventos
  if (userType[0]?.tipo_usuario === "promotor/administrador") {
    const query = `
            SELECT DISTINCT e.id, e.title, e.start_datetime AS start, e.end_datetime AS end
            FROM events e
            LEFT JOIN usuario u ON e.created_by = u.id_usuario
            WHERE e.created_by = ?  -- Eventos creados por el promotor
            OR (EXISTS (          -- Eventos creados por asesores
                SELECT 1 
                FROM usuario u2 
                WHERE u2.id_usuario = e.created_by 
                AND u2.tipo_usuario = 'asesor' OR u2.tipo_usuario = 'cliente'
            ))
        `;
    const [rows] = await connection.query(query, [userId]);
    return rows;
  }
  // Si es asesor o cliente, mantener la lógica original
  else {
    const query = `
            SELECT id, title, start_datetime AS start, end_datetime AS end
            FROM events
            WHERE created_by = ? OR client_id = ?
        `;
    const [rows] = await connection.query(query, [userId, userId]);
    return rows;
  }
};
/**
 * Actualizar un evento en la base de datos y en Google Calendar
 */
async function updateEvent(eventId, updatedDetails) {
  const connection = getConnection();
  const { title, startDateTime, endDateTime, eventType } = updatedDetails;

  const [event] = await connection.query(
    `SELECT google_event_id FROM events WHERE id = ?`,
    [eventId]
  );
  if (!event.length) {
    throw new Error("Evento no encontrado");
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

  const [event] = await connection.query(
    `SELECT google_event_id FROM events WHERE id = ?`,
    [eventId]
  );
  if (!event.length) {
    throw new Error("Evento no encontrado");
  }

  await deleteGoogleEvent(event[0].google_event_id);

  const [result] = await connection.query(`DELETE FROM events WHERE id = ?`, [
    eventId,
  ]);

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
  getClientsByAdvisor,
  updateEvent,
  deleteEvent,
  obtenerEventosProximos24Horas,
};