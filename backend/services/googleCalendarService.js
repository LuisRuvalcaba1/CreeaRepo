const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  '502530816558-cpn6rhnjcfb4tm2mnd8r25uuub143q5u.apps.googleusercontent.com',          
  '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',      
  'http://localhost:3000'
);

// Configura el refresh token
oauth2Client.setCredentials({
  refresh_token: '1//0frHPWEhrc7z7CgYIARAAGA8SNwF-L9IrLptP_SZk8EZt301aqcPJftd_WUtuhOe1-BGDtKPFjOA3ebokmSA_0DeFO94apPWh0jE'
});

/**
 * Crear un evento en Google Calendar
 */
async function createEvent(eventDetails) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: accessToken.token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Asegúrate de que startDateTime y endDateTime estén en formato ISO adecuado
    const startDateTime = new Date(eventDetails.startDateTime).toISOString();  // Convertir a formato ISO
    const endDateTime = new Date(eventDetails.endDateTime).toISOString();  // Convertir a formato ISO

    // Configuración básica del evento
    const event = {
      summary: eventDetails.summary || 'Nueva Reunión',
      location: 'Virtual - Google Meet',
      description: eventDetails.description || 'Reunión en Google Meet.',
      start: {
        dateTime: startDateTime,  // Debe ser de tipo dateTime en formato ISO
        timeZone: eventDetails.timeZone || 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime,  // También debe ser de tipo dateTime en formato ISO
        timeZone: eventDetails.timeZone || 'America/Mexico_City',
      },
      attendees: eventDetails.attendees || [],  // Lista de asistentes al evento
    };
    
    // Si el tipo de evento es "meeting", se agrega Google Meet
    if (eventDetails.eventType === 'meeting') {
      event.conferenceData = {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: eventDetails.eventType === 'meeting' ? 1 : undefined,
      sendUpdates: 'all',
    });

    console.log('Evento creado: %s', response.data.htmlLink || 'Evento sin enlace de Meet');
    return response.data;
  } catch (error) {
    console.error('Error al crear el evento:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { createEvent };
