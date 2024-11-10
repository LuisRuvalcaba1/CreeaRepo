const nodemailer = require('nodemailer');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

const sendVerificationEmail = (email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Usamos el correo del archivo .env
            pass: process.env.EMAIL_PASSWORD  // Usamos la contraseña del archivo .env
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de Verificación CreeaApp',
        text: `Tu código de verificación es: ${verificationCode}`
    };

    console.log(`Código de verificación enviado al correo (${email}): ${verificationCode}`);

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo:', error);
                reject(error); // Rechaza la promesa si hay un error
            } else {
                console.log('Correo enviado:', info.response);
                resolve(info.response); // Resuelve la promesa si el correo se envía
            }
        });
    });
};

const sendCustomEmail = (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo:', error);
                reject(error);
            } else {
                console.log('Correo enviado:', info.response);
                resolve(info.response);
            }
        });
    });
};

module.exports = { sendVerificationEmail, sendCustomEmail };
