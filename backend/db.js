// backend/db.js
const mysql = require('mysql2/promise'); // Asegúrate de usar 'mysql2/promise'

let connection;

async function connectToDatabase() {
  try {
    // Crear y conectar la base de datos usando promesas
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'creea_app'
    });

    console.log('Conectado a la base de datos con id ' + connection.threadId);
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.stack);
    process.exit(1); // Salida del proceso si falla la conexión
  }
}

// Ejecutar la conexión al cargar el módulo
connectToDatabase();

// Exportar la conexión para su uso
module.exports = {
  getConnection: () => connection // Exportar la función para obtener la conexión
};
