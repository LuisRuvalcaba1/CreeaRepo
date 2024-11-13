  const { google } = require('googleapis');
  const { v4: uuidv4 } = require('uuid');

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
  async function createGoogleEvent(eventDetails) {
    try {
      const accessToken = await oauth2Client.getAccessToken();
      oauth2Client.setCredentials({ access_token: accessToken.token });

      const startDateTime = new Date(eventDetails.startDateTime).toISOString();
      const endDateTime = new Date(eventDetails.endDateTime).toISOString();

      const event = {
        summary: eventDetails.title || 'Nueva Reunión',
        location: 'Virtual - Google Meet',
        description: eventDetails.description || 'Reunión en Google Meet.',
        start: {
          dateTime: startDateTime,
          timeZone: eventDetails.timeZone || 'America/Mexico_City',
        },
        end: {
          dateTime: endDateTime,
          timeZone: eventDetails.timeZone || 'America/Mexico_City',
        },
        attendees: eventDetails.attendees || [],
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === 'video'
      )?.uri;

      console.log('Evento creado: %s', meetLink || 'Evento sin enlace de Meet');

      return {
        htmlLink: response.data.htmlLink,
        meetLink: meetLink || null,
        googleEventId: response.data.id, // Incluye el ID del evento en Google Calendar
      };
    } catch (error) {
      console.error('Error al crear el evento:', error.response?.data || error.message);
      throw error;
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
