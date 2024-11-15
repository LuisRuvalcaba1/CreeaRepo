require('dotenv').config(); // Importar dotenv para usar variables de entorno
const mysql = require('mysql2/promise');

let connection;

async function connectToDatabase() {
  try {
    // Crear y conectar la base de datos usando variables de entorno
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('Conectado a la base de datos con id ' + connection.threadId);
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.stack);
    process.exit(1); 
  }
}

// Ejecutar la conexión al cargar el módulo
connectToDatabase();

// Exportar la conexión para su uso
module.exports = {
  getConnection: () => connection
};
