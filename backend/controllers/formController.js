const TemporaryData = require('../models/TemporaryData');
const RequestForm = require('../models/RequestForm');
const { Op } = require('sequelize');

exports.saveTemporaryData = async (req, res) => {
  const { userId, data } = req.body;

  if (!userId || !data) {
    return res.status(400).send('Faltan datos requeridos');
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // 1 semana

  try {
    await TemporaryData.upsert({
      userId,
      data,
      expirationDate,
    });
    console.log(`Datos temporales guardados para el usuario ${userId}`);
    res.status(200).send('Datos guardados temporalmente');
  } catch (error) {
    console.error(`Error al guardar datos temporales: ${error.message}`);
    res.status(500).send(`Error al guardar datos temporales: ${error.message}`);
  }
};

exports.completeRequest = async (req, res) => {
  const { userId, data } = req.body;

  if (!userId || !data) {
    return res.status(400).send('Faltan datos requeridos');
  }

  try {
    const existingRequest = await RequestForm.findOne({ where: { userId } });
    if (existingRequest) {
      return res.status(400).send('Ya existe una solicitud completa para este usuario.');
    }

    await RequestForm.create({ userId, data });
    await TemporaryData.destroy({ where: { userId } });
    console.log(`Solicitud completada para el usuario ${userId}`);
    res.status(200).send('Solicitud completada');
  } catch (error) {
    console.error(`Error al completar la solicitud: ${error.message}`);
    res.status(500).send(`Error al completar la solicitud: ${error.message}`);
  }
};

exports.loadTemporaryData = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send('Faltan datos requeridos');
  }

  try {
    const tempData = await TemporaryData.findOne({
      where: {
        userId,
        expirationDate: { [Op.gt]: new Date() },
      },
    });

    if (!tempData) {
      return res.status(404).send('No se encontraron datos temporales o han expirado');
    }

    const remainingTime = Math.max(
      0,
      (new Date(tempData.expirationDate) - new Date()) / 1000
    );

    console.log(`Datos temporales cargados para el usuario ${userId}`);
    res.status(200).json({ data: tempData.data, remainingTime });
  } catch (error) {
    console.error(`Error al cargar datos temporales: ${error.message}`);
    res.status(500).send(`Error al cargar datos temporales: ${error.message}`);
  }
};
