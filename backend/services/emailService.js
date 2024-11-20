const nodemailer = require('nodemailer');

// Configuración de transporte para Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail', // Parametrizamos el servicio de correo
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Validar que todos los parámetros requeridos estén presentes
 */
function validarParametrosCorreo(params, requiredFields) {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`Parámetro requerido faltante: ${field}`);
    }
  }
}

/**
 * Enviar correo electrónico de invitación a la reunión
 */
async function enviarCorreoInvitacion({ to, subject, text, link }) {
  try {
    validarParametrosCorreo({ to, subject, text, link }, ['to', 'subject', 'text', 'link']);

    const mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to,
      subject,
      html: `
        <p>${text}</p>
        <p>Para unirte a la reunión, haz clic en el siguiente enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Gracias,<br>Equipo CreeaApp</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de invitación enviado con éxito a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo de invitación:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar recordatorio de evento 24 horas antes
 */
async function enviarRecordatorio({ to, eventDate, eventTime, link }) {
  try {
    validarParametrosCorreo({ to, eventDate, eventTime, link }, ['to', 'eventDate', 'eventTime', 'link']);

    const mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to,
      subject: 'Recordatorio de tu evento próximo',
      html: `
        <p>Hola,</p>
        <p>Este es un recordatorio de tu evento programado para:</p>
        <p><strong>Fecha:</strong> ${eventDate}</p>
        <p><strong>Hora:</strong> ${eventTime}</p>
        <p>Puedes unirte a la reunión usando el siguiente enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Gracias,<br>Equipo CreeaApp</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Recordatorio de evento enviado con éxito a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el recordatorio de evento:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar confirmación de cita al cliente después de que el asesor la programe
 */
async function enviarConfirmacionCita({ to, eventDate, eventTime, link, participantName, hostName, isHost }) {
  try {
    const mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to,
      subject: isHost ? 'Nueva reunión programada' : 'Invitación a reunión',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${isHost ? 'Nueva Reunión Programada' : 'Invitación a Reunión'}</h2>
          <p>${isHost 
              ? `Se ha programado una reunión con ${participantName}` 
              : `${hostName} te ha invitado a una reunión`}</p>
          <p>Detalles de la reunión:</p>
          <ul>
            <li><strong>Fecha:</strong> ${eventDate}</li>
            <li><strong>Hora:</strong> ${eventTime}</li>
            ${link ? `<li><strong>Link de la reunión:</strong> <a href="${link}">${link}</a></li>` : ''}
          </ul>
          ${link ? `
            <p>Puedes unirte a la reunión haciendo clic en el siguiente botón:</p>
            <p><a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Unirse a la reunión</a></p>
          ` : ''}
          <p>Por favor, agrega este evento a tu calendario.</p>
          <p>Si necesitas hacer algún cambio o tienes preguntas, por favor contáctanos.</p>
          <p>Saludos cordiales,<br>Equipo CreeaApp</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación enviado con éxito a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo de confirmación:', error);
    return { success: false, error: error.message };
  }
}

async function enviarCorreoCancelacion({ to, subject, text }) {
  try {
    validarParametrosCorreo({ to, subject, text }, ['to', 'subject', 'text']);

    const mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to,
      subject,
      html: `<p>${text}</p><p>Gracias,<br>Equipo CreeaApp</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de cancelación enviado con éxito a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo de cancelación:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  enviarCorreoInvitacion,
  enviarRecordatorio,
  enviarConfirmacionCita,
  enviarCorreoCancelacion,
};

