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

    // Obtener información del cliente y asesor...
    const [clientInfo] = await connection.query(
      `SELECT c.id_cliente, c.nombre_completo as client_name, 
              u.correo_electronico as client_email
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_cliente = ?`,
      [eventDetails.clientId]
    );

    const [advisorInfo] = await connection.query(
      `SELECT a.id_asesor, a.nombre_completo as advisor_name,
              u.correo_electronico as advisor_email
       FROM asesor a
       JOIN usuario u ON a.id_usuario = u.id_usuario
       WHERE a.id_usuario = ?`,
      [eventDetails.createdBy]
    );

    if (!clientInfo.length || !advisorInfo.length) {
      throw new Error("No se encontró la información del cliente o asesor");
    }

    // Función auxiliar para formatear fechas manteniendo la zona horaria correcta
    const formatDateForMySQL = (dateString) => {
      const date = new Date(dateString);
      
      // Obtener el offset de la zona horaria en minutos
      const offset = date.getTimezoneOffset();
      
      // Crear una nueva fecha ajustada por el offset
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      
      // Extraer los componentes de la fecha
      const year = adjustedDate.getUTCFullYear();
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
      const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
      const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

      // Retornar el formato para MySQL
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStartDate = formatDateForMySQL(eventDetails.startDateTime);
    const formattedEndDate = formatDateForMySQL(eventDetails.endDateTime);

    if (eventDetails.eventType === "meeting") {
      try {
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees: [
            { email: clientInfo[0].client_email },
            { email: advisorInfo[0].advisor_email }
          ],
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;

        // Enviar correos de confirmación...
        await enviarConfirmacionCita({
          to: clientInfo[0].client_email,
          eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
          eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
          link: meetLink,
          participantName: clientInfo[0].client_name,
          hostName: advisorInfo[0].advisor_name,
          isHost: false
        });

        await enviarConfirmacionCita({
          to: advisorInfo[0].advisor_email,
          eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
          eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
          link: meetLink,
          participantName: clientInfo[0].client_name,
          hostName: advisorInfo[0].advisor_name,
          isHost: true
        });
      } catch (error) {
        console.error("Error al crear evento en Google:", error);
        throw new Error("No se pudo crear el evento en Google Calendar");
      }
    }

    const [result] = await connection.query(
      `INSERT INTO events (
        title, 
        start_datetime, 
        end_datetime, 
        event_type, 
        meet_link, 
        created_by, 
        client_id,
        google_event_id,
        asesor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        meetLink,
        eventDetails.createdBy,
        clientInfo[0].id_cliente,
        googleEventId,
        false
      ]
    );

    return {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      clientId: clientInfo[0].id_cliente,
      meetLink,
      createdBy: eventDetails.createdBy,
      googleEventId,
    };
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
}

const createEventByPromotor = async(eventDetails) => {
  const connection = getConnection();
  console.log("Creando evento por parte del promotor: ", eventDetails);

  try {
    let meetLink = null;
    let googleEventId = null;
    let targetId = null;
    let targetEmail = null;
    
    // Asegurarnos que createdBy sea un número
    const createdBy = parseInt(eventDetails.createdBy);
    if (isNaN(createdBy)) {
      throw new Error("ID del promotor inválido");
    }

    // Función auxiliar para formatear fechas manteniendo la zona horaria correcta
    const formatDateForMySQL = (dateString) => {
      const date = new Date(dateString);
      
      // Obtener el offset de la zona horaria en minutos
      const offset = date.getTimezoneOffset();
      
      // Crear una nueva fecha ajustada por el offset
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      
      // Extraer los componentes de la fecha
      const year = adjustedDate.getUTCFullYear();
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
      const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
      const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

      // Retornar el formato para MySQL
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Determinar el tipo de evento y obtener la información correspondiente
    if (eventDetails.attendeeType === "client") {
      const clientEvent = eventDetails.events.find(e => e.type === 'client');
      if (!clientEvent) {
        throw new Error("Información del cliente no proporcionada");
      }

      const [clientInfo] = await connection.query(
        `SELECT c.id_cliente, c.nombre_completo as client_name,
                u.correo_electronico as client_email
         FROM cliente c
         JOIN usuario u ON c.id_usuario = u.id_usuario
         WHERE c.id_cliente = ?`,
        [clientEvent.clientId]
      );

      if (!clientInfo || clientInfo.length === 0) {
        throw new Error(`No se encontró la información del cliente con ID ${clientEvent.clientId}`);
      }

      targetId = clientInfo[0].id_cliente;
      targetEmail = clientInfo[0].client_email;
    } else if (eventDetails.attendeeType === "advisor") {
      const advisorEvent = eventDetails.events.find(e => e.type === 'advisor');
      if (!advisorEvent) {
        throw new Error("Información del asesor no proporcionada");
      }

      const [advisorInfo] = await connection.query(
        `SELECT a.id_asesor, a.nombre_completo as advisor_name,
                u.correo_electronico as advisor_email
         FROM asesor a
         JOIN usuario u ON a.id_usuario = u.id_usuario
         WHERE a.id_usuario = ?`,
        [advisorEvent.clientId]
      );

      if (!advisorInfo || advisorInfo.length === 0) {
        throw new Error(`No se encontró la información del asesor con ID ${advisorEvent.clientId}`);
      }

      targetId = advisorInfo[0].id_asesor;
      targetEmail = advisorInfo[0].advisor_email;
    }

    // Formatear fechas usando la nueva función
    const formattedStartDate = formatDateForMySQL(eventDetails.startDateTime);
    const formattedEndDate = formatDateForMySQL(eventDetails.endDateTime);

    // Crear evento en Google Calendar si es necesario
    if (eventDetails.eventType === "meeting") {
      try {
        const attendees = eventDetails.events.map(event => ({ email: event.email }));
        
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;

        // Enviar correos de confirmación
        for (const attendee of eventDetails.events) {
          await enviarConfirmacionCita({
            to: attendee.email,
            eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
            eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
            link: meetLink,
            participantName: "el promotor",
            hostName: "El promotor",
            isHost: false
          });
        }
      } catch (error) {
        console.error("Error al crear evento en Google:", error);
        throw new Error("No se pudo crear el evento en Google Calendar");
      }
    }

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
        google_event_id,
        asesor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        meetLink,
        createdBy,
        eventDetails.attendeeType === "client" ? targetId : null,
        googleEventId,
        eventDetails.attendeeType === "advisor" ? targetId : false
      ]
    );

    return {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      clientId: eventDetails.attendeeType === "client" ? targetId : null,
      advisorId: eventDetails.attendeeType === "advisor" ? targetId : false,
      meetLink,
      createdBy,
      googleEventId,
    };
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};

const createEventByClient = async (eventDetails) => {
  const connection = getConnection();

  try {
    // Obtener información del cliente y su asesor asignado
    const [clientAndAdvisorInfo] = await connection.query(
      `SELECT 
        c.id_cliente,
        c.nombre_completo as client_name,
        a.id_asesor,
        a.nombre_completo as advisor_name,
        uc.correo_electronico as client_email,
        ua.correo_electronico as advisor_email
       FROM cliente c
       JOIN usuario uc ON c.id_usuario = uc.id_usuario
       JOIN asesor a ON c.id_asesor = a.id_asesor
       JOIN usuario ua ON a.id_usuario = ua.id_usuario
       WHERE c.id_usuario = ?`,
      [eventDetails.createdBy]
    );

    if (!clientAndAdvisorInfo.length) {
      throw new Error("No se encontró la información del cliente o asesor");
    }

    const { 
      id_cliente, 
      id_asesor,
      client_email, 
      advisor_email, 
      client_name, 
      advisor_name 
    } = clientAndAdvisorInfo[0];
    
    let meetLink = null;
    let googleEventId = null;

    if (eventDetails.eventType === "meeting") {
      try {
        console.log("Creando evento en Google Calendar...");
        const googleEvent = await createGoogleEvent({
          title: eventDetails.title,
          startDateTime: eventDetails.startDateTime,
          endDateTime: eventDetails.endDateTime,
          attendees: [
            { email: client_email },
            { email: advisor_email }
          ]
        });

        meetLink = googleEvent.meetLink;
        googleEventId = googleEvent.googleEventId;

        console.log("Enviando correo de confirmación al cliente...");
        // Enviar correo al cliente (creador del evento)
        const clientEmailResult = await enviarConfirmacionCita({
          to: client_email,
          eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
          eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
          link: meetLink,
          participantName: advisor_name,
          hostName: client_name,
          isHost: true
        });

        console.log("Resultado envío correo cliente:", clientEmailResult);

        console.log("Enviando correo de confirmación al asesor...");
        // Enviar correo al asesor
        const advisorEmailResult = await enviarConfirmacionCita({
          to: advisor_email,
          eventDate: new Date(eventDetails.startDateTime).toLocaleDateString(),
          eventTime: new Date(eventDetails.startDateTime).toLocaleTimeString(),
          link: meetLink,
          participantName: client_name,
          hostName: client_name,
          isHost: false
        });

        console.log("Resultado envío correo asesor:", advisorEmailResult);

      } catch (error) {
        console.error("Error al crear evento en Google o enviar correos:", error);
        throw new Error("No se pudo crear el evento en Google Calendar o enviar las notificaciones");
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

    console.log("Guardando evento en la base de datos...");
    const [result] = await connection.query(
      `INSERT INTO events (
        title, 
        start_datetime, 
        end_datetime, 
        event_type, 
        meet_link, 
        created_by, 
        client_id, 
        asesor_id,
        google_event_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventDetails.title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType,
        meetLink,
        eventDetails.createdBy,
        null,  // client_id ahora es null
        id_asesor, 
        googleEventId
      ]
    );

    console.log("Evento creado exitosamente");
    return {
      id: result.insertId,
      title: eventDetails.title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: eventDetails.eventType,
      clientId: id_cliente,
      advisorId: id_asesor,
      meetLink,
      createdBy: eventDetails.createdBy,
      googleEventId
    };
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};

async function getAdvisorEvents(advisorId) {
  const connection = getConnection();

  try {
    // Obtener el id_asesor del usuario
    const [advisorInfo] = await connection.query(
      `SELECT id_asesor FROM asesor WHERE id_usuario = ?`,
      [advisorId]
    );

    if (!advisorInfo.length) {
      throw new Error("Asesor no encontrado");
    }

    const id_asesor = advisorInfo[0].id_asesor;

    // Consulta de eventos
    const query = `
      SELECT 
        e.*,
        COALESCE(c.nombre_completo, a2.nombre_completo) as participant_name,
        CASE 
          WHEN e.client_id IS NOT NULL THEN 'client'
          WHEN e.asesor_id IS NOT NULL THEN 'advisor'
        END as participant_type,
        a_creator.nombre_completo as creator_name,
        u_creator.tipo_usuario as creator_type
      FROM events e
      LEFT JOIN cliente c ON e.client_id = c.id_cliente
      LEFT JOIN asesor a2 ON e.asesor_id = a2.id_asesor
      LEFT JOIN usuario u_creator ON e.created_by = u_creator.id_usuario
      LEFT JOIN asesor a_creator ON u_creator.id_usuario = a_creator.id_usuario
      WHERE e.asesor_id = ? 
      OR e.created_by = ?
      ORDER BY e.start_datetime DESC
    `;

    const [events] = await connection.query(query, [id_asesor, advisorId]);
    return events;
    
  } catch (error) {
    console.error("Error al obtener eventos del asesor:", error);
    throw error;
  }
}

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
    return advisors;
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    throw new Error("Error al obtener la lista de asesores");
  }
};

const getClientsByAdvisor = async (advisorId) => {
  const connection = getConnection();

  try {
    // Primero obtenemos el id_asesor correspondiente al id_usuario del asesor
    const [advisorInfo] = await connection.query(
      `SELECT id_asesor FROM asesor WHERE id_usuario = ?`,
      [advisorId]
    );

    if (!advisorInfo.length) {
      throw new Error("Asesor no encontrado");
    }

    const id_asesor = advisorInfo[0].id_asesor;

    // Ahora usamos el id_asesor para obtener los clientes
    const [clients] = await connection.query(
      `SELECT 
        c.*,
        u.correo_electronico
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_asesor = ?
       ORDER BY c.nombre_completo ASC`,
      [id_asesor]
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

    // Si es asesor, obtener solo sus clientes usando el id_asesor
    const [advisorInfo] = await connection.query(
      `SELECT id_asesor FROM asesor WHERE id_usuario = ?`,
      [userId]
    );

    if (!advisorInfo.length) {
      throw new Error("Información de asesor no encontrada");
    }

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
    // Obtener el evento actual y el tipo de usuario
    const [currentEvent] = await connection.query(
      'SELECT e.*, u.tipo_usuario FROM events e ' +
      'JOIN usuario u ON e.created_by = u.id_usuario ' +
      'WHERE e.id = ?',
      [eventId]
    );

    if (!currentEvent.length) {
      throw new Error('Evento no encontrado');
    }

    const isClientUser = currentEvent[0].tipo_usuario === 'cliente';

    // Función auxiliar para formatear fechas manteniendo la zona horaria correcta
    const formatDateForMySQL = (dateString) => {
      const date = new Date(dateString);
      
      // Obtener el offset de la zona horaria en minutos
      const offset = date.getTimezoneOffset();
      
      // Crear una nueva fecha ajustada por el offset
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      
      // Extraer los componentes de la fecha
      const year = adjustedDate.getUTCFullYear();
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
      const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
      const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');

      // Retornar el formato para MySQL
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Formatear las fechas usando la nueva función
    const formattedStartDate = formatDateForMySQL(eventDetails.startDateTime);
    const formattedEndDate = formatDateForMySQL(eventDetails.endDateTime);

    // Si el evento es de tipo meeting y tiene un Google Event ID, actualizarlo
    if (currentEvent[0].google_event_id && currentEvent[0].event_type === 'meeting') {
      // Obtener información de los participantes
      const [clientInfo] = await connection.query(
        `SELECT c.nombre_completo as client_name, u.correo_electronico as client_email
         FROM cliente c
         JOIN usuario u ON c.id_usuario = u.id_usuario
         WHERE c.id_cliente = ?`,
        [currentEvent[0].client_id]
      );

      const [advisorInfo] = await connection.query(
        `SELECT a.nombre_completo as advisor_name, u.correo_electronico as advisor_email
         FROM asesor a
         JOIN usuario u ON a.id_usuario = u.id_usuario
         WHERE a.id_usuario = ?`,
        [currentEvent[0].created_by]
      );

      if (clientInfo.length && advisorInfo.length) {
        await updateGoogleEvent(currentEvent[0].google_event_id, {
          title: eventDetails.title || currentEvent[0].title,
          startDateTime: new Date(eventDetails.startDateTime).toISOString(),
          endDateTime: new Date(eventDetails.endDateTime).toISOString(),
          attendees: [
            { email: clientInfo[0].client_email },
            { email: advisorInfo[0].advisor_email }
          ]
        });
      }
    }

    let query;
    let queryParams;

    if (isClientUser) {
      // Si es cliente, solo actualizar título y fechas
      query = `
        UPDATE events 
        SET title = ?,
            start_datetime = ?,
            end_datetime = ?
        WHERE id = ?
      `;
      queryParams = [
        eventDetails.title || currentEvent[0].title,
        formattedStartDate,
        formattedEndDate,
        eventId
      ];
    } else {
      // Si es asesor o promotor, permitir actualizar todos los campos
      query = `
        UPDATE events 
        SET title = ?,
            start_datetime = ?,
            end_datetime = ?,
            event_type = ?,
            client_id = ?
        WHERE id = ?
      `;
      queryParams = [
        eventDetails.title || currentEvent[0].title,
        formattedStartDate,
        formattedEndDate,
        eventDetails.eventType || currentEvent[0].event_type,
        eventDetails.clientId || currentEvent[0].client_id,
        eventId
      ];
    }

    const [result] = await connection.query(query, queryParams);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el evento');
    }

    // Retornar el evento actualizado con los campos apropiados
    return {
      id: eventId,
      title: eventDetails.title || currentEvent[0].title,
      start: formattedStartDate,
      end: formattedEndDate,
      eventType: currentEvent[0].event_type,
      clientId: currentEvent[0].client_id,
      createdBy: currentEvent[0].created_by,
      meetLink: currentEvent[0].meet_link,
      googleEventId: currentEvent[0].google_event_id
    };
  } catch (error) {
    console.error('Error al actualizar evento:', error);
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
  createEventByPromotor,
  getAdvisorEvents
};
