// controllers/reminderController.js

const TemporaryData = require('../models/TemporaryData');

exports.sendReminders = async () => {
  const incompleteForms = await TemporaryData.find();
  incompleteForms.forEach(form => {
    // Aquí se enviaría el recordatorio al asesor sobre la solicitud incompleta
    console.log(`Enviando recordatorio a asesor con ID ${form.userId}`);
  });
};
