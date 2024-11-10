// controllers/formController.js

const TemporaryData = require('../models/TemporaryData');
const RequestForm = require('../models/RequestForm');
const { Op } = require('sequelize');

exports.saveTemporaryData = async (req, res) => {
  const { userId, data } = req.body;
  const expirationDate = new Date();
  //Aqui se establece que es una semanaaaa 
  expirationDate.setDate(expirationDate.getDate() + 7);

  try {
    await TemporaryData.upsert({
      userId,
      data,
      expirationDate,
    });
    res.status(200).send('Datos guardados temporalmente');
  } catch (error) {
    res.status(500).send('Error al guardar datos');
  }
};

exports.completeRequest = async (req, res) => {
  const { userId, data } = req.body;
  try {
    // Guarda la solicitud sin asignarla a una variable
    await RequestForm.create({ userId, data }); 
    await TemporaryData.destroy({
      where: { userId }
    });
    res.status(200).send('Solicitud completada');
  } catch (error) {
    res.status(500).send('Error al completar la solicitud');
  }
};


exports.loadTemporaryData = async (req, res) => {
  const { userId } = req.body;
  try {
    const tempData = await TemporaryData.findOne({
      where: {
        userId,
        expirationDate: { [Op.gt]: new Date() }
      }
    });
    if (!tempData) {
      return res.status(404).send('No se encontraron datos temporales o han expirado');
    }
    res.status(200).json(tempData.data);
  } catch (error) {
    res.status(500).send('Error al cargar datos temporales');
  }
};
