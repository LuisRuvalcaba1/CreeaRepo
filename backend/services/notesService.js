const { getConnection } = require('../db');

const createAdvisorNote = async (noteData) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Primero verificamos que el cliente pertenezca al asesor
    const [clientRows] = await connection.query(
      `SELECT id_cliente 
       FROM cliente 
       WHERE id_cliente = ? AND id_asesor = ?`,
      [noteData.id_cliente, noteData.id_asesor]
    );

    if (clientRows.length === 0) {
      throw new Error("No tienes permiso para escribir notas a este cliente");
    }

    // Si el cliente pertenece al asesor, creamos la nota
    const [result] = await connection.query(
      `INSERT INTO nota (id_cliente, id_asesor, contenido, fecha_creacion) 
       VALUES (?, ?, ?, NOW())`,
      [noteData.id_cliente, noteData.id_asesor, noteData.contenido]
    );

    // Obtenemos la nota recién creada
    const [newNote] = await connection.query(
      `SELECT id_nota, id_cliente, id_asesor, contenido, fecha_creacion 
       FROM nota 
       WHERE id_nota = ?`,
      [result.insertId]
    );

    return newNote[0];
  } catch (error) {
    throw error;
  }
};

const getClientNotes = async (clientId, advisorId) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Verificamos que el cliente pertenezca al asesor
    const [clientRows] = await connection.query(
      `SELECT id_cliente 
       FROM cliente 
       WHERE id_cliente = ? AND id_asesor = ?`,
      [clientId, advisorId]
    );

    if (clientRows.length === 0) {
      throw new Error("No tienes permiso para ver las notas de este cliente");
    }

    // Obtenemos todas las notas del cliente
    // Corregida la sintaxis SQL eliminando la coma extra
    const [notes] = await connection.query(
      `SELECT n.id_nota, n.contenido, n.fecha_creacion,
              a.nombre_completo as nombre_asesor
       FROM nota n 
       JOIN asesor a ON n.id_asesor = a.id_asesor
       WHERE n.id_cliente = ?
       ORDER BY n.fecha_creacion DESC`,
      [clientId]
    );

    return notes;
  } catch (error) {
    throw error;
  }
};

const updateAdvisorNote = async (noteId, advisorId, contenido) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Verificamos que la nota pertenezca al asesor
    const [noteRows] = await connection.query(
      `SELECT id_nota 
       FROM nota 
       WHERE id_nota = ? AND id_asesor = ?`,
      [noteId, advisorId]
    );

    if (noteRows.length === 0) {
      throw new Error("No tienes permiso para modificar esta nota");
    }

    // Actualizamos la nota
    await connection.query(
      `UPDATE nota 
       SET contenido = ? 
       WHERE id_nota = ? AND id_asesor = ?`,
      [contenido, noteId, advisorId]
    );

    // Obtenemos la nota actualizada
    const [updatedNote] = await connection.query(
      `SELECT id_nota, id_cliente, id_asesor, contenido, fecha_creacion 
       FROM nota 
       WHERE id_nota = ?`,
      [noteId]
    );

    return updatedNote[0];
  } catch (error) {
    throw error;
  }
};

const deleteAdvisorNote = async (noteId, advisorId) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Verificamos que la nota pertenezca al asesor
    const [noteRows] = await connection.query(
      `SELECT id_nota 
       FROM nota 
       WHERE id_nota = ? AND id_asesor = ?`,
      [noteId, advisorId]
    );

    if (noteRows.length === 0) {
      throw new Error("No tienes permiso para eliminar esta nota");
    }

    // Eliminamos la nota
    await connection.query(
      `DELETE FROM nota 
       WHERE id_nota = ? AND id_asesor = ?`,
      [noteId, advisorId]
    );

    return { success: true, message: "Nota eliminada correctamente" };
  } catch (error) {
    throw error;
  }
};

const getClientViewableNotes = async (clientId) => {
  let connection;
  try {
    connection = await getConnection();
    
    const [notes] = await connection.query(
      `SELECT n.id_nota, n.contenido, n.fecha_creacion,
              a.nombre_completo as nombre_asesor
       FROM nota n
       JOIN asesor a ON n.id_asesor = a.id_asesor
       WHERE n.id_cliente = ?
       ORDER BY n.fecha_creacion DESC`,
      [clientId]
    );

    return notes;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAdvisorNote,
  getClientNotes,
  updateAdvisorNote,
  deleteAdvisorNote,
  getClientViewableNotes
};