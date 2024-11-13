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
async function enviarConfirmacionCita({ to, eventDate, eventTime, link }) {
  try {
    validarParametrosCorreo({ to, eventDate, eventTime, link }, ['to', 'eventDate', 'eventTime', 'link']);

    const mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to,
      subject: 'Confirmación de tu cita programada',
      html: `
        <p>Hola,</p>
        <p>Tu cita ha sido programada para:</p>
        <p><strong>Fecha:</strong> ${eventDate}</p>
        <p><strong>Hora:</strong> ${eventTime}</p>
        <p>Puedes unirte a la reunión usando el siguiente enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Gracias,<br>Equipo CreeaApp</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmación de cita enviada con éxito a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar la confirmación de cita:', error.message);
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

