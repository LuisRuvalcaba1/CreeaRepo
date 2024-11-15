const express = require('express');
const router = express.Router();

// Importa tu servicio o función para enviar notificaciones
const { sendPushNotification, sendEmailNotification } = require('../services/notificationService'); // Ajusta el path según tu estructura

// Endpoint para enviar una notificación
router.post('/send-notification', async (req, res) => {
  const { recipientId, message, type } = req.body; // `type` puede ser "push", "email", etc.

  if (!recipientId || !message) {
    return res.status(400).json({ error: 'Datos incompletos para enviar la notificación.' });
  }

  try {
    if (type === 'push') {
      // Lógica para notificación push
      await sendPushNotification(recipientId, message);
    } else if (type === 'email') {
      // Lógica para notificación por correo
      await sendEmailNotification(recipientId, message);
    } else {
      return res.status(400).json({ error: 'Tipo de notificación no válido.' });
    }

    res.status(200).json({ message: 'Notificación enviada correctamente.' });
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
    res.status(500).json({ error: 'Error al enviar la notificación.' });
  }
});

module.exports = router;
