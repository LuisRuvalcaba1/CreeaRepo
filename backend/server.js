/* backend/server.js */

const express = require('express');
const calendarRoutes = require('./routes/calendarRoutes');
const { sendCustomEmail,sendVerificationEmail } = require('./sendVerificationEmail');
//const { sendCustomEmail } = require('./sendEmail');
const { getConnection } = require('./db'); 
const bcrypt = require('bcryptjs');
const cors = require('cors');
const http = require('http'); // Añadido para Socket.IO
const socketIo = require('socket.io'); // Añadido para Socket.IO
const bodyParser = require('body-parser');
const { chatbotHandler } = require('./controllers/chatbotController.js');
const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Crear servidor HTTP
const server = http.createServer(app);

// Integrar Socket.IO con el servidor HTTP
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());

app.post('/api/chatbot', chatbotHandler);

// Simulación de clientes
const clients = [
  { name: 'Cliente A' },
  { name: 'Cliente B' },
  { name: 'Cliente C' },
];

// Ruta para devolver los clientes
app.get('/api/clients', (req, res) => {
  res.json({ clients });
});

let verificationCodes = {};

// Generar un código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Genera un código de 6 dígitos
};

// Almacenar los dibujos, textos e imágenes actuales del pizarrón
let currentDrawings = [];
let currentTextElements = [];
let currentImageElements = [];

// Mapa para almacenar usuarios conectados
const connectedUsers = new Map();

// Configuración de Socket.IO para el pizarrón interactivo
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado al pizarrón:', socket.id);

  // Registrar al usuario y asociarlo con su socket.id
  socket.on('registerUser', ({ userId }) => {
    if (userId) {
      connectedUsers.set(userId, socket.id); // Asocia userId con socket.id
      console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
    } else {
      console.error('userId no está definido en registerUser');
    }
  });

  // Cuando un cliente solicita sincronización del pizarrón
  socket.on('requestBoardSync', () => {
    socket.emit('syncBoard', {
      drawings: currentDrawings,
      textElements: currentTextElements,
      imageElements: currentImageElements,
    });
  });
  

// Manejar los eventos de dibujo
socket.on('drawing', (data) => {
  currentDrawings.push(data); // Guarda el dibujo actual
  socket.broadcast.emit('drawing', data); // Enviar a todos excepto al remitente
});

// Manejar los eventos de agregar texto
socket.on('addText', (data) => {
  currentTextElements.push(data); // Guarda el texto actual
  socket.broadcast.emit('addText', data); // Enviar a todos excepto al remitente
});

// Manejar los eventos de agregar imágenes
socket.on('addImage', (data) => {
  currentImageElements.push(data); // Guarda la imagen actual
  socket.broadcast.emit('addImage', data); // Enviar a todos excepto al remitente
});


  // Manejar el evento de compartir pizarrón
  socket.on('shareBoard', ({ from, to }) => {
    const recipientSocketId = connectedUsers.get(to); // Obtener socket del destinatario
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveShareRequest', { from });
      console.log(`Usuario ${from} compartió el pizarrón con el usuario ${to}`);
    } else {
      console.log(`Usuario ${to} no está conectado.`);
    }
  });

  // Evento cuando un cliente se desconecta
  socket.on('disconnect', () => {
    console.log('Cliente desconectado del pizarrón:', socket.id);
    connectedUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`Usuario ${userId} eliminado de connectedUsers`);
      }
    });
  });  
});

app.get('/api/get-clients', async (req, res) => {
  const { advisorId } = req.query; // Obtener el id del asesor desde la consulta

  try {
    const connection = getConnection();
    const [clients] = await connection.query(
      `SELECT c.id_cliente, c.nombre_completo, u.correo_electronico, u.id_usuario, u.tipo_usuario,
              c.fecha_nacimiento, c.ocupacion_profesion, c.sexo, c.estado_civil, c.domicilio_completo, 
              c.giro_actividad, c.tipo_actividad, c.ingresos_anuales, c.habitos_toxicologicos
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_asesor = ?`, 
      [advisorId]
    );

    console.log("Clientes obtenidos del asesor:", clients); // Añadir este log para verificar

    if (clients.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes para este asesor.' });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes del asesor.' });
  }
});


// Ruta para obtener el asesor relacionado con un cliente
app.get('/api/get-advisor', async (req, res) => {
  const { userId } = req.query; // Obtener el id del usuario cliente desde la consulta

  try {
    const connection = getConnection();
    const [advisor] = await connection.query(
      `SELECT a.id_asesor, a.nombre_completo 
       FROM asesor a
       JOIN cliente c ON c.id_asesor = a.id_asesor 
       WHERE c.id_usuario = ?`, 
      [userId]
    );

    if (advisor.length === 0) {
      return res.status(404).json({ message: 'No se encontró un asesor asignado para este cliente.' });
    }

    res.status(200).json(advisor[0]);
  } catch (error) {
    console.error('Error al obtener asesor del cliente:', error);
    res.status(500).json({ message: 'Error al obtener el asesor del cliente.' });
  }
});


// Ruta para obtener la lista de asesores
app.get('/api/obtener-asesores', async (req, res) => {
  try {
    console.log("Obteniendo asesores");
    const connection = getConnection();
    const [asesores] = await connection.query('SELECT id_asesor, nombre_completo, clave_agente FROM asesor');
    console.log("Asesores obtenidos:", asesores);
    res.status(200).json(asesores);
  } catch (error) {
    console.error('Error al obtener asesores:', error);
    res.status(500).json({ message: 'Error al obtener la lista de asesores.' });
  }
});


app.post('/api/register-client', async (req, res) => {
  const {
    nombreCompleto,
    fechaNacimiento,
    nacionalidad,
    ocupacion,
    sexo,
    estadoCivil,
    domicilio,
    correo,
    giro,
    tipoActividad,
    entidadFederativa,
    ingresosAnuales,
    origenPatrimonio,
    habitosToxicos,
    especificarHabitos,
    password,
    idAsesorSeleccionado // Captura el asesor seleccionado del frontend
  } = req.body;

  try {
    const connection = getConnection();

    // Verificar si el correo electrónico ya está registrado
    const [existingUser] = await connection.query(
      'SELECT * FROM usuario WHERE correo_electronico = ?',
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la tabla "usuario"
    const [userResult] = await connection.query(
      'INSERT INTO usuario (correo_electronico, password, tipo_usuario) VALUES (?, ?, "cliente")',
      [correo, hashedPassword]
    );

    const userId = userResult.insertId;

    // Asignar un asesor aleatorio si el cliente no seleccionó ninguno
    let idAsesorAsignado = idAsesorSeleccionado;

    if (!idAsesorSeleccionado) {
      // Si no se seleccionó asesor, asignar uno aleatoriamente de la tabla de asesores
      const [asesores] = await connection.query('SELECT id_asesor FROM asesor ORDER BY RAND() LIMIT 1');
      if (asesores.length > 0) {
        idAsesorAsignado = asesores[0].id_asesor;
      } else {
        return res.status(400).json({ message: 'No hay asesores disponibles.' });
      }
    }

    // Insertar los datos del cliente en la tabla "cliente" incluyendo el id_asesor
    await connection.query(
      `
      INSERT INTO cliente (
        id_usuario, nombre_completo, fecha_nacimiento, nacionalidad, ocupacion_profesion, sexo, estado_civil,
        domicilio_completo, giro_actividad, tipo_actividad, entidad_federativa_nacimiento,
        ingresos_anuales, origen_patrimonio, habitos_toxicologicos, descripcion_habitos, id_asesor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId,
        nombreCompleto,
        fechaNacimiento,
        nacionalidad,
        ocupacion,
        sexo,
        estadoCivil,
        domicilio,
        giro,
        tipoActividad,
        entidadFederativa,
        ingresosAnuales,
        origenPatrimonio,
        habitosToxicos,
        especificarHabitos,
        idAsesorAsignado 
      ]
    );

    // Generar y enviar el código de verificación por correo electrónico
    const verificationCode = generateVerificationCode();
    verificationCodes[correo] = verificationCode;

    await sendVerificationEmail(correo, verificationCode);

    res.status(201).json({
      message: 'Cliente registrado exitosamente. Se ha enviado un código de verificación a tu correo.',
    });
  } catch (err) {
    console.error('Error al registrar el cliente:', err);
    res.status(500).json({ message: 'Error en el servidor al registrar el cliente.' });
  }
});

// Ruta para solicitar la recuperación de la contraseña
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Valida el email (simplificado)
  if (!/^[\w-.]+@gmail\.com$/.test(email)) {
    return res.status(400).json({ message: 'Correo electrónico no válido.' });
  }

  // Genera el código de verificación
  const verificationCode = generateVerificationCode();

  // Almacena el código temporalmente (debería estar en una base de datos en producción)
  verificationCodes[email] = verificationCode;

  try {
    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({
      message: 'Se ha enviado un correo con un código para restablecer tu contraseña.',
    });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
  }
});

app.post('/api/verify-code', (req, res) => {
  const { email, verificationCode } = req.body;
  console.log("Datos recibidos para verificación:", email, verificationCode); // Agrega este log

  if (verificationCodes[email] && verificationCodes[email] === verificationCode) {
      delete verificationCodes[email];
      res.status(200).json({ message: 'Código verificado correctamente.' });
  } else {
      console.log("Código incorrecto o no encontrado para:", email); // Log de error
      res.status(400).json({ message: 'Código de verificación incorrecto.' });
  }
});

// Ruta para manejar el inicio de sesión
app.post('/api/login', async (req, res) => {
  const { username, password, userType } = req.body;

  try {
    const connection = getConnection();
    const [results] = await connection.query(
      'SELECT * FROM usuario WHERE correo_electronico = ? AND tipo_usuario = ?',
      [username, userType]
    );

    if (results.length > 0) {
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        res.json({ success: true, message: 'Login exitoso', userType, userId: user.id_usuario });
      } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Ruta para obtener los datos del cliente
app.get('/api/client-data', async (req, res) => {
  const userId = req.query.userId;

  try {
      const connection = await getConnection();

      const sqlCliente = `
          SELECT u.correo_electronico, c.nombre_completo, c.fecha_nacimiento, c.nacionalidad, 
              c.ocupacion_profesion, c.sexo, c.estado_civil, c.domicilio_completo, 
              c.giro_actividad, c.tipo_actividad, c.habitos_toxicologicos, c.entidad_federativa_nacimiento, 
              c.ingresos_anuales, c.origen_patrimonio, c.descripcion_habitos
          FROM usuario u
          JOIN cliente c ON u.id_usuario = c.id_usuario
          WHERE u.id_usuario = ?
      `;
      const [clienteResults] = await connection.query(sqlCliente, [userId]);

      if (clienteResults.length === 0) {
          return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      res.json(clienteResults[0]);
  } catch (err) {
      console.error('Error al obtener los datos del cliente:', err);
      res.status(500).json({ message: 'Error al obtener los datos del cliente' });
  }
});

// Ruta para actualizar los datos del cliente
app.post('/api/update-client', async (req, res) => {
  const {
      nombreCompleto,
      fechaNacimiento,
      nacionalidad,
      ocupacion,
      sexo,
      estadoCivil,
      domicilio,
      giro,
      habitosToxicos,
      entidadFederativa,
      ingresosAnuales,
      origenPatrimonio,
      descripcionHabitos,
      password,
  } = req.body;

  const userId = req.query.userId;

  try {
      const connection = await getConnection();

      // Actualizar datos en la tabla 'cliente'
      await connection.query(
          `
          UPDATE cliente SET 
              nombre_completo = ?, fecha_nacimiento = ?, nacionalidad = ?, 
              ocupacion_profesion = ?, sexo = ?, estado_civil = ?, 
              domicilio_completo = ?, giro_actividad = ?, habitos_toxicologicos = ?, 
              entidad_federativa_nacimiento = ?, ingresos_anuales = ?, 
              origen_patrimonio = ?, descripcion_habitos = ?
          WHERE id_usuario = ?
          `,
          [
              nombreCompleto,
              fechaNacimiento,
              nacionalidad,
              ocupacion,
              sexo,
              estadoCivil,
              domicilio,
              giro,
              habitosToxicos,
              entidadFederativa,
              ingresosAnuales,
              origenPatrimonio,
              descripcionHabitos,
              userId,
          ]
      );

      // Si también necesitas actualizar la contraseña
      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await connection.query(
              `UPDATE usuario SET password = ? WHERE id_usuario = ?`,
              [hashedPassword, userId]
          );
      }

      res.json({ message: 'Datos del cliente actualizados correctamente' });
  } catch (err) {
      console.error('Error al actualizar los datos del cliente:', err);
      res.status(500).json({ message: 'Error al actualizar los datos del cliente' });
  }
});

// Ruta para obtener los datos del asesor
app.get('/api/advisor-data', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }

    try {
        const connection = await getConnection();

        const sql = `
            SELECT u.correo_electronico, u.password, a.nombre_completo, a.clave_agente
            FROM usuario u
            JOIN asesor a ON u.id_usuario = a.id_usuario
            WHERE u.id_usuario = ?
        `;

        const [results] = await connection.query(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Asesor no encontrado' });
        }

        // No enviar la contraseña al frontend por razones de seguridad
        const { password, ...userData } = results[0];
        res.json(userData);
    } catch (error) {
        console.error('Error al obtener los datos del asesor:', error);
        res.status(500).json({ message: 'Error al obtener los datos del asesor' });
    }
});

// Ruta para actualizar los datos del asesor
app.post('/api/update-advisor', async (req, res) => {
    const {
        nombreCompleto,
        claveAgente,
        correoElectronico,
        password
    } = req.body;

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }

    try {
        const connection = await getConnection();

        // Actualizar datos en la tabla 'asesor'
        await connection.query(
            `
            UPDATE asesor SET 
                nombre_completo = ?, 
                clave_agente = ?
            WHERE id_usuario = ?
            `,
            [
                nombreCompleto,
                claveAgente,
                userId
            ]
        );

        // Verificar si se necesita actualizar el correo electrónico o la contraseña
        if (correoElectronico || password) {
            const updateUserQuery = `
                UPDATE usuario SET 
                    correo_electronico = ?,
                    password = COALESCE(?, password) -- Mantener la contraseña actual si no se actualiza
                WHERE id_usuario = ?
            `;

            // Encriptar la nueva contraseña si está presente
            const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

            await connection.query(updateUserQuery, [
                correoElectronico,
                hashedPassword,
                userId
            ]);
        }

        res.json({ message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos del asesor:', error);
        res.status(500).json({ message: 'Error al actualizar los datos del asesor' });
    }
});

// Nueva ruta para obtener asesores con sus clientes
app.get('/api/advisors-with-clients', async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.query(`
      SELECT a.id_asesor AS id, a.nombre_completo AS name, a.clave_agente AS agentNumber,
             c.nombre_completo AS clientName
      FROM asesor a
      LEFT JOIN cliente c ON c.id_asesor = a.id_asesor
      ORDER BY a.id_asesor;
    `);

    // Transformar los datos para que cada asesor tenga una lista de clientes
    const advisorsWithClients = rows.reduce((acc, row) => {
      const advisor = acc.find((advisor) => advisor.id === row.id);
      if (advisor) {
        advisor.clients.push(row.clientName); // Agrega el cliente a la lista del asesor
      } else {
        acc.push({
          id: row.id,
          name: row.name,
          agentNumber: row.agentNumber,
          clients: row.clientName ? [row.clientName] : [],
        });
      }
      return acc;
    }, []);

    res.status(200).json(advisorsWithClients);
  } catch (error) {
    console.error('Error al obtener asesores con clientes:', error);
    res.status(500).json({ message: 'Error al obtener la lista de asesores con clientes.' });
  }
});

// Ruta para registrar un nuevo asesor
app.post('/api/register-advisor', async (req, res) => {
  const { nombreCompleto, correo, numeroIdentificacion, password } = req.body;

  try {
    const connection = getConnection();

    // Verificar si el correo electrónico ya está registrado
    const [existingUser] = await connection.query(
      'SELECT * FROM usuario WHERE correo_electronico = ?',
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la tabla "usuario"
    const [userResult] = await connection.query(
      'INSERT INTO usuario (correo_electronico, password, tipo_usuario) VALUES (?, ?, "asesor")',
      [correo, hashedPassword]
    );

    const userId = userResult.insertId;

    // Insertar los datos del asesor en la tabla "asesor"
    await connection.query(
      `
      INSERT INTO asesor (
        id_usuario, nombre_completo, clave_agente
      ) VALUES (?, ?, ?)
    `,
      [userId, nombreCompleto, numeroIdentificacion]
    );

    // Generar y enviar el código de verificación por correo electrónico
    const verificationCode = generateVerificationCode();
    verificationCodes[correo] = verificationCode;

    await sendVerificationEmail(correo, verificationCode);

    res.status(201).json({
      message: 'Asesor registrado exitosamente. Se ha enviado un código de verificación a tu correo.',
    });
  } catch (err) {
    console.error('Error al registrar el asesor:', err);
    res.status(500).json({ message: 'Error en el servidor al registrar el asesor.' });
  }
});

// Ruta para registrar un nuevo promotor
app.post('/api/register-promoter', async (req, res) => {
  const {
    correo,
    nombreCompleto,
    nombrePromotoria,
    zona,
    numeroPromotoria,
    password,
  } = req.body;

  try {
    const connection = getConnection();

    // Verificar si el correo electrónico ya está registrado
    const [existingUser] = await connection.query(
      'SELECT * FROM usuario WHERE correo_electronico = ?',
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la tabla "usuario"
    const [userResult] = await connection.query(
      'INSERT INTO usuario (correo_electronico, password, tipo_usuario) VALUES (?, ?, "promotor/administrador")',
      [correo, hashedPassword]
    );

    const userId = userResult.insertId;

    // Insertar los datos del promotor en la tabla "promotor"
    await connection.query(
      `
      INSERT INTO promotor (
        id_usuario, nombre_completo, nombre_promotoria, zona, numero_promotoria
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [userId, nombreCompleto, nombrePromotoria, zona, numeroPromotoria]
    );

    // Generar y enviar el código de verificación por correo electrónico
    const verificationCode = generateVerificationCode();
    verificationCodes[correo] = verificationCode;

    await sendVerificationEmail(correo, verificationCode);

    res.status(201).json({
      message: 'Promotor registrado exitosamente. Se ha enviado un código de verificación a tu correo.',
    });
  } catch (err) {
    console.error('Error al registrar el promotor:', err);
    res.status(500).json({ message: 'Error en el servidor al registrar el promotor.' });
  }
});

// Configurar el entorno de PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Función para crear una orden en PayPal
async function createOrder(amount) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN', // Define la moneda aquí
          value: amount, // Solo el valor numérico, sin "MXN"
        },
      },
    ],
  });

  let response = await client.execute(request);
  return response.result;
}

// Ruta en el backend para crear la orden de pago
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  // Validar que el valor de amount sea solo numérico
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount)) {
    return res.status(400).json({ error: 'El monto debe ser un número válido.' });
  }

  try {
    const order = await createOrder(parsedAmount.toString()); // Enviar como string numérico
    res.json(order); // Enviar el resultado al frontend, incluyendo el orderID
  } catch (err) {
    console.error('Error al crear la orden de PayPal:', err.message);
    res.status(500).json({ error: 'Error al crear la orden de PayPal' });
  }
});

// Función para generar clave alfanumérica de 5 dígitos
function generarClaveUnica() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let clave = '';
  for (let i = 0; i < 5; i++) {
    clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return clave;
}

// Verificar si la clave es única en la base de datos
async function verificarClaveUnica(clave) {
  const connection = getConnection();
  const [rows] = await connection.query(
    'SELECT * FROM comprobante_pago WHERE clave_comprobante = ?',
    [clave]
  );
  return rows.length === 0; // Devuelve true si la clave es única
}

// Generar clave única para comprobante
async function generarClave() {
  let clave;
  do {
    clave = generarClaveUnica();
  } while (!(await verificarClaveUnica(clave))); // Sigue generando hasta que sea única
  return clave;
}

const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Función para enviar correo con PDF adjunto
const enviarComprobantePorCorreo = async (clienteEmail, comprobante) => {
  // Crear un nuevo documento PDF
  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);

    // Configurar Nodemailer
    let transporter = nodemailer.createTransport({
      service: 'Gmail', // Ajustar según tu configuración de correo
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Configurar el correo
    let mailOptions = {
      from: '"CreeaApp" <noreply@creeaapp.com>',
      to: clienteEmail,
      subject: 'Comprobante de Pago',
      text: `Estimado cliente, \n\nGracias por su pago. Su comprobante es ${comprobante.clave_comprobante}. El monto pagado fue de ${comprobante.monto}. \n\nSaludos,\nEquipo CreeaApp`,
      attachments: [
        {
          filename: 'comprobante_pago.pdf',
          content: pdfData,
        },
      ],
    };

    // Enviar el correo
    try {
      await transporter.sendMail(mailOptions);
      console.log('Correo enviado con éxito.');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  });

  // Agregar contenido al PDF
  doc.fontSize(20).text('Comprobante de Pago', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Cliente: ${comprobante.nombre_completo}`);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
  doc.text(`Monto: ${comprobante.monto}`);
  doc.text(`Clave Comprobante: ${comprobante.clave_comprobante}`);
  doc.text(`Entidad Federativa: ${comprobante.entidad_federativa}`);
  doc.text(`Correo: ${clienteEmail}`);
  doc.text('\nGracias por su pago.');

  // Finalizar el documento
  doc.end();
};

// Ajustar la ruta para generar el comprobante y enviar por correo
app.post('/generar-comprobante', async (req, res) => {
  const { id_cliente, monto } = req.body;

  try {
    const connection = getConnection();
    const [cliente] = await connection.query(
      `SELECT c.*, u.correo_electronico 
       FROM cliente c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_cliente = ?`,
      [id_cliente]
    );

    if (cliente.length === 0) {
      return res.status(400).json({ message: 'El cliente no existe.' });
    }

    const clave = await generarClave();

    await connection.query(
      'INSERT INTO comprobante_pago (id_cliente, monto, clave_comprobante, fecha) VALUES (?, ?, ?, NOW())',
      [id_cliente, monto, clave]
    );

    // Detalles del comprobante a devolver al frontend y enviar por correo
    const comprobante = {
      nombre_completo: cliente[0].nombre_completo,
      monto,
      clave_comprobante: clave,
      entidad_federativa: cliente[0].entidad_federativa_nacimiento,
      correo_electronico: cliente[0].correo_electronico,
    };

    // Enviar el comprobante por correo
    await enviarComprobantePorCorreo(cliente[0].correo_electronico, comprobante);

    // Devolver los detalles al frontend
    res.status(200).json(comprobante);
  } catch (error) {
    console.error('Error al generar comprobante:', error);
    res.status(500).json({ message: 'Error al generar el comprobante.' });
  }
});

// Usa las rutas de calendario en la ruta `/api/calendar`
app.use('/api/calendar', calendarRoutes);
    
// Endpoint para guardar una nota
app.post('/api/save-note', async (req, res) => {
  const { id_cliente, id_asesor, contenido } = req.body;

  if (!id_cliente || !id_asesor || !contenido) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const connection = getConnection();
    await connection.query(
      'INSERT INTO nota (id_cliente, id_asesor, contenido, fecha_creacion) VALUES (?, ?, ?, NOW())',
      [id_cliente, id_asesor, contenido]
    );
    res.status(201).json({ message: 'Nota guardada exitosamente.' });
  } catch (error) {
    console.error('Error al guardar la nota:', error);
    res.status(500).json({ message: 'Error al guardar la nota.' });
  }
});


app.post('/api/send-email', async (req, res) => {
  const { email, subject, message } = req.body;
  try {
      await sendCustomEmail(email, subject, message);
      res.status(200).json({ message: 'Correo personalizado enviado' });
  } catch (error) {
      res.status(500).json({ message: 'Error al enviar correo personalizado', error });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // Cambiado de app.listen a server.listen
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
