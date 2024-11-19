const express = require("express");
const router = express.Router();
const {
  createAdvisorNote,
  getClientNotes,
  updateAdvisorNote,
  deleteAdvisorNote,
  getClientViewableNotes
} = require("../services/notesService");

// Crear una nueva nota
router.post("/notes/create", async (req, res) => {
    
  try {
    const { id_cliente, id_asesor, contenido } = req.body;
    
    if (!id_cliente || !id_asesor || !contenido) {
      return res.status(400).json({
        error: "Faltan datos requeridos",
        details: "Se requiere id_cliente, id_asesor y contenido"
      });
    }

    const newNote = await createAdvisorNote({
      id_cliente,
      id_asesor,
      contenido
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error en la ruta de crear nota:", error);
    
    if (error.message === "No tienes permiso para escribir notas a este cliente") {
      return res.status(403).json({
        error: "Error de permisos",
        message: error.message
      });
    }

    res.status(500).json({
      error: "Error al crear la nota",
      message: error.message
    });
  }
});

// Obtener notas de un cliente específico (vista del asesor)
router.get("/notes/client/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const { advisorId } = req.query;

    if (!clientId || !advisorId) {
      return res.status(400).json({
        error: "Faltan datos requeridos",
        details: "Se requiere clientId y advisorId"
      });
    }

    const notes = await getClientNotes(clientId, advisorId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error en la ruta de obtener notas del cliente:", error);
    
    if (error.message === "No tienes permiso para ver las notas de este cliente") {
      return res.status(403).json({
        error: "Error de permisos",
        message: error.message
      });
    }

    res.status(500).json({
      error: "Error al obtener las notas",
      message: error.message
    });
  }
});

// Obtener notas desde la perspectiva del cliente
router.get("/notes/myclient/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: "Falta el ID del cliente",
        details: "Se requiere clientId"
      });
    }

    const notes = await getClientViewableNotes(clientId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error en la ruta de obtener notas del cliente:", error);
    res.status(500).json({
      error: "Error al obtener las notas",
      message: error.message
    });
  }
});

// Actualizar una nota existente
router.put("/notes/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const { contenido, advisorId } = req.body;

    if (!noteId || !contenido || !advisorId) {
      return res.status(400).json({
        error: "Faltan datos requeridos",
        details: "Se requiere noteId, contenido y advisorId"
      });
    }

    const updatedNote = await updateAdvisorNote(noteId, advisorId, contenido);
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error en la ruta de actualizar nota:", error);
    
    if (error.message === "No tienes permiso para modificar esta nota") {
      return res.status(403).json({
        error: "Error de permisos",
        message: error.message
      });
    }

    res.status(500).json({
      error: "Error al actualizar la nota",
      message: error.message
    });
  }
});

// Eliminar una nota
router.delete("/notes/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const { advisorId } = req.query;

    if (!noteId || !advisorId) {
      return res.status(400).json({
        error: "Faltan datos requeridos",
        details: "Se requiere noteId y advisorId"
      });
    }

    await deleteAdvisorNote(noteId, advisorId);
    res.status(200).json({
      success: true,
      message: "Nota eliminada correctamente"
    });
  } catch (error) {
    console.error("Error en la ruta de eliminar nota:", error);
    
    if (error.message === "No tienes permiso para eliminar esta nota") {
      return res.status(403).json({
        error: "Error de permisos",
        message: error.message
      });
    }

    res.status(500).json({
      error: "Error al eliminar la nota",
      message: error.message
    });
  }
});

module.exports = router;