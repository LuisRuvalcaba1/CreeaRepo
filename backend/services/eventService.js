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
    let meetLink = null;
    let googleEventId = null;

    if (eventDetails.eventType === "meeting") {
      try {
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees: eventDetails.attendees || [],
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;
      } catch (error) {
        console.error("Error al crear evento en Google:", error);
        throw new Error("No se pudo crear el evento en Google Calendar");
      }
    }

    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

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
        googleEventId,
      ]
    );

    enviarConfirmacionCita({
      title: eventDetails.title,
      startDateTime: eventDetails.startDateTime,
      endDateTime: eventDetails.endDateTime,
      clientEmail: eventDetails.clientEmail,
      advisorEmail: eventDetails.advisorEmail,
    });

    return {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      clientId: eventDetails.clientId,
      meetLink,
      createdBy: eventDetails.createdBy,
      googleEventId,
    };
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
}

const createEventByClient = async (eventDetails) => {
  const connection = getConnection();
  console.log("Creando evento de cliente con detalles:", eventDetails);

  try {
    const { advisorId, advisorEmail } = await getClientAdvisor(eventDetails.createdBy);
    let meetLink = null;
    let googleEventId = null;

    if (eventDetails.eventType === "meeting") {
      try {
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees: [
            { email: eventDetails.clientEmail },
            { email: advisorEmail }
          ]
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;

        // Enviar correo con link de meet
        await enviarConfirmacionCita({
          to: eventDetails.clientEmail,
          eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
          eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
          link: meetLink
        });
      } catch (error) {
        console.error("Error al crear evento en Google:", error);
        throw new Error("No se pudo crear el evento en Google Calendar");
      }
    }

    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const [result] = await connection.query(
      `INSERT INTO events (title, start_datetime, end_datetime, event_type, meet_link, created_by, client_id, google_event_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        meetLink,
        eventDetails.createdBy,
        advisorId,
        googleEventId
      ]
    );

    return {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      clientId: eventDetails.createdBy,
      advisorId: advisorId,
      meetLink,
      createdBy: eventDetails.createdBy,
      googleEventId
    };
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};

const getClientAdvisor = async (clientId) => {
  const connection = getConnection();
  try {
    const [result] = await connection.query(
      `SELECT id_asesor, a.correo_electronico as advisor_email
       FROM cliente c
       JOIN usuario a ON c.id_asesor = a.id_usuario
       WHERE c.id_usuario = ?`,
      [clientId]
    );

    if (result.length === 0) {
      throw new Error("Cliente no encontrado o sin asesor asignado");
    }

    return {
      advisorId: result[0].id_asesor,
      advisorEmail: result[0].advisor_email,
    };
  } catch (error) {
    console.error("Error al obtener el asesor del cliente:", error);
    throw error;
  }
};

const getAdvisors = async () => {
  const connection = getConnection();
  try {
    const [advisors] = await connection.query(
      `SELECT 
        u.id_usuario as id,
        u.correo_electronico as email,
        a.nombre_completo as name
      FROM usuario u
      JOIN asesor a ON u.id_usuario = a.id_usuario
      WHERE u.tipo_usuario = 'asesor'
      ORDER BY a.nombre_completo ASC`
    );
    console.log(advisors);
    return advisors;
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    throw new Error("Error al obtener la lista de asesores");
  }
};

const getClientsByAdvisor = async (advisorId) => {
  const connection = getConnection();

  try {
    const [clients] = await connection.query(
      `SELECT 
        c.*,
        u.correo_electronico
      FROM cliente c
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

// Nueva función para obtener todos los clientes (para promotores)
const getAllClients = async () => {
  const connection = getConnection();

  try {
    const [clients] = await connection.query(
      `SELECT 
        c.*,
        u.correo_electronico,
        u2.correo_electronico as correo_asesor
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       LEFT JOIN usuario u2 ON c.id_asesor = u2.id_usuario
       ORDER BY c.nombre_completo ASC`
    );

    return clients;
  } catch (error) {
    console.error("Error al obtener todos los clientes:", error);
    throw new Error("Error al obtener la lista completa de clientes");
  }
};

const getClientsByUserType = async (userId) => {
  const connection = getConnection();

  try {
    // Verificar el tipo de usuario
    const [userType] = await connection.query(
      `SELECT tipo_usuario FROM usuario WHERE id_usuario = ?`,
      [userId]
    );

    if (!userType.length) {
      throw new Error("Usuario no encontrado");
    }

    // Si es promotor, obtener todos los clientes
    if (userType[0].tipo_usuario === "promotor/administrador") {
      return await getAllClients();
    }

    // Si es asesor, obtener solo sus clientes
    return await getClientsByAdvisor(userId);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw new Error("Error al obtener los clientes");
  }
};

/**
 * Obtener eventos de un usuario (cliente o asesor)
 */

const getEventsByUser = async (userId) => {
  const connection = getConnection();

  try {
    const [userType] = await connection.query(
      "SELECT tipo_usuario FROM usuario WHERE id_usuario = ?",
      [userId]
    );

    if (userType[0]?.tipo_usuario === "promotor/administrador") {
      const query = `
        SELECT 
          events.id, 
          events.title, 
          events.start_datetime as start, 
          events.end_datetime as end,
          events.event_type,
          events.client_id,
          u.tipo_usuario,
          CASE 
            WHEN u.tipo_usuario = 'asesor' THEN 'advisor'
            WHEN u.tipo_usuario = 'cliente' THEN 'client'
            ELSE 'both'
          END as attendee_type
        FROM events
        LEFT JOIN usuario u ON events.client_id = u.id_usuario
        WHERE events.created_by = ?
        OR (EXISTS (
          SELECT 1 
          FROM usuario u2 
          WHERE u2.id_usuario = events.created_by
          AND (u2.tipo_usuario = 'asesor' OR u2.tipo_usuario = 'cliente')
        ))
      `;
      const [rows] = await connection.query(query, [userId]);
      return rows;
    } else {
      const query = `
          SELECT 
            e.id, 
            e.title, 
            e.start_datetime as start, 
            e.end_datetime as end,
            e.event_type,
            e.client_id,
            e.meet_link
          FROM events e
          LEFT JOIN cliente c ON c.id_usuario = ?
          WHERE e.created_by = ? 
          OR e.client_id = ?
          OR e.client_id = c.id_cliente`;
      const [rows] = await connection.query(query, [userId, userId, userId]);
      return rows;
    }
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error;
  }
};

/**
 * Actualizar un evento en la base de datos y en Google Calendar
 */
async function updateEvent(eventId, eventDetails) {
  const connection = getConnection();
  try {
    const formattedStartDate = new Date(eventDetails.startDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const formattedEndDate = new Date(eventDetails.endDateTime)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    let clientId = null;
    if (["client", "both"].includes(eventDetails.attendeeType)) {
      clientId = eventDetails.clientId;
    } else if (eventDetails.attendeeType === "advisor") {
      clientId = eventDetails.advisorId;
    }

    const [result] = await connection.query(
      `UPDATE events SET 
        title = ?,
        start_datetime = ?,
        end_datetime = ?,
        event_type = ?,
        meet_link = ?,
        client_id = ?
      WHERE id = ?`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        eventDetails.meetLink,
        clientId,
        eventId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("No se pudo actualizar el evento");
    }

    return {
      id: eventId,
      ...eventDetails,
      start: formattedStartDate,
      end: formattedEndDate,
      clientId,
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
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    if (existingEvent.length === 0) {
      throw new Error("Evento no encontrado");
    }

    const [result] = await connection.query("DELETE FROM events WHERE id = ?", [
      eventId,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("No se pudo eliminar el evento");
    }

    return {
      success: true,
      message: "Evento eliminado correctamente",
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
  getAdvisors,
  getClientsByUserType,
  getAllClients,
  createEventByClient,
};
