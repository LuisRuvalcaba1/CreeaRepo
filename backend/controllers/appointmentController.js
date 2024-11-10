const { crearEventoConMeet } = require('../services/googleCalendarService');
const { enviarCorreoInvitacion } = require('../services/emailService');

async function agendarCita(req, res) {
  try {
    const evento = await crearEventoConMeet({
      summary: 'Cita con Asesor',
      description: 'Cita para discutir detalles de seguros',
      startDateTime: req.body.startDateTime,
      endDateTime: req.body.endDateTime,
      attendees: req.body.attendees.map(email => ({ email })), // Verifica que sea un array de objetos
    });    

    await enviarCorreoInvitacion({
      to: req.body.clientEmail,
      subject: 'Confirmación de Cita',
      text: `Tu cita ha sido programada para el ${evento.start.dateTime}.`,
      link: evento.hangoutLink,
    });

    res.status(200).json({ message: 'Cita agendada y correo enviado.' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el proceso de agendar la cita.' });
  }
}

module.exports = {
  agendarCita,
};
