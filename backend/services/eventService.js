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
  console.log("Creando evento con detalles:", eventDetails);

  try {
    // Si es un evento tipo meeting, crear el evento en Google Calendar primero
    let meetLink = null;
    let googleEventId = null;

    if (eventDetails.eventType === 'meeting') {
      try {
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees: eventDetails.attendees || []
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;
        console.log("Evento de Google creado:", { meetLink, googleEventId });
      } catch (error) {
        console.error("Error al crear evento en Google:", error);
        throw new Error("No se pudo crear el evento en Google Calendar");
      }
    }

    // Formatear fechas para MySQL
    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // Insertar en la base de datos
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        meetLink,
        eventDetails.createdBy,
        eventDetails.clientId,
        googleEventId
      ]
    );

    // Obtener información del cliente para el correo
    const [clientInfo] = await connection.query(
      `SELECT c.*, u.correo_electronico 
       FROM cliente c 
       JOIN usuario u ON c.id_usuario = u.id_usuario 
       WHERE c.id_cliente = ?`,
      [eventDetails.clientId]
    );

    if (clientInfo.length > 0 && eventDetails.eventType === 'meeting') {
      // Enviar correo de confirmación
      const startDate = new Date(eventDetails.startDateTime);
      await enviarConfirmacionCita({
        to: clientInfo[0].correo_electronico,
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
        link: meetLink
      });
    }

    const savedEvent = {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      meetLink,
      createdBy: eventDetails.createdBy,
      clientId: eventDetails.clientId,
      googleEventId
    };

    return savedEvent;

  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
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
    console.error("Error al obtener clientes:", error);
    throw new Error("Error al obtener los clientes del asesor");
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
async function updateEvent(eventId, eventDetails) {
  const connection = getConnection();
  console.log("Actualizando evento:", { eventId, eventDetails });

  try {
    // Formatear fechas para MySQL
    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // Verificar si el evento existe
    const [existingEvent] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (existingEvent.length === 0) {
      throw new Error('Evento no encontrado');
    }

    const [result] = await connection.query(
      `UPDATE events SET 
        title = ?,
        start_datetime = ?,
        end_datetime = ?,
        event_type = ?,
        meet_link = ?
      WHERE id = ?`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        eventDetails.meetLink || null,
        eventId
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el evento');
    }

    // Devolver el evento actualizado
    return {
      id: eventId,
      ...eventDetails,
      start: formattedStartDate,
      end: formattedEndDate
    };

  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error;
  }
}

/**
 * Eliminar un evento de la base de datos y de Google Calendar
 */

async function deleteEvent(eventId) {
  const connection = getConnection();
  console.log("Eliminando evento:", eventId);

  try {
    // Verificar si el evento existe
    const [existingEvent] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (existingEvent.length === 0) {
      throw new Error('Evento no encontrado');
    }

    const [result] = await connection.query(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el evento');
    }

    return {
      success: true,
      message: 'Evento eliminado correctamente'
    };

  } catch (error) {
    console.error("Error al eliminar evento:", error);
    throw error;
  }
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
