const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  '502530816558-cpn6rhnjcfb4tm2mnd8r25uuub143q5u.apps.googleusercontent.com',
  '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',
  'http://localhost:3000'
);

oauth2Client.setCredentials({
  refresh_token: '1//0frHPWEhrc7z7CgYIARAAGA8SNwF-L9IrLptP_SZk8EZt301aqcPJftd_WUtuhOe1-BGDtKPFjOA3ebokmSA_0DeFO94apPWh0jE'
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Crear un evento en Google Calendar
 */
async function createGoogleEvent({ title, startDateTime, endDateTime, attendees = [] }) {
  if (!title || !startDateTime || !endDateTime) {
    throw new Error('Datos incompletos para crear el evento en Google Meet.');
  }

  try {
    // Simulación de creación de evento en Google Calendar
    const event = {
      summary: title,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Mexico_City',
      },
      attendees: attendees.map(email => ({ email })), // Asegurar que los asistentes sean un array válido
    };

    // Simular llamada a la API de Google Calendar
    console.log('Evento creado en Google Calendar:', event);
    return {
      meetLink: 'https://meet.google.com/fake-link', // Devuelve un enlace simulado
      googleEventId: '12345abcde', // Devuelve un ID simulado
    };
  } catch (error) {
    console.error('Error al crear evento en Google Calendar:', error.message);
    throw new Error('Error al crear el evento en Google Calendar.');
  }
}

/**
 * Actualizar un evento en Google Calendar
 */
async function updateGoogleEvent(eventId, eventDetails) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: accessToken.token });

    const startDateTime = new Date(eventDetails.startDateTime).toISOString();
    const endDateTime = new Date(eventDetails.endDateTime).toISOString();

    const event = {
      summary: eventDetails.title,
      start: {
        dateTime: startDateTime,
        timeZone: eventDetails.timeZone || 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime,
        timeZone: eventDetails.timeZone || 'America/Mexico_City',
      },
      attendees: eventDetails.attendees || [],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    console.log('Evento actualizado:', response.data.htmlLink);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el evento:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Eliminar un evento en Google Calendar
 */
async function deleteGoogleEvent(eventId) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: accessToken.token });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    console.log('Evento eliminado con ID:', eventId);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el evento:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent };
