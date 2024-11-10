const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Crear conexión a la base de datos MySQL
const createConnection = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE,
    });
};

// Consultar base de conocimientos
const queryKnowledgeBase = async (userQuestion) => {
    const connection = await createConnection();
    const lowerCaseQuestion = userQuestion.toLowerCase();
    const [rows] = await connection.execute(
        // Cambia la consulta para asegurarte de que busca correctamente por la pregunta o palabras clave
        `SELECT answer 
         FROM knowledge_base 
         WHERE LOWER(question) = ? 
         OR LOWER(keywords) LIKE CONCAT('%', ?, '%') 
         LIMIT 1`,
        [lowerCaseQuestion, lowerCaseQuestion]
    );
    await connection.end();
    return rows.length > 0 ? rows[0].answer : null;
};



// Manejar pregunta del usuario
const handleUserQuestion = async (userQuestion) => {
    const knowledgeBaseAnswer = await queryKnowledgeBase(userQuestion);

    if (knowledgeBaseAnswer) {
        return knowledgeBaseAnswer;
    } else {
        // Retorna un mensaje indicando que no se encontró una respuesta y da la opción de contactar al capacitador
        return {
            response: "No encontré una respuesta a tu pregunta. ¿Deseas contactar a un capacitador?",
            contactOption: true
        };
    }
};

// Ruta para recibir preguntas del usuario
const chatbotHandler = async (req, res) => {
    const { userQuestion } = req.body;

    try {
        const chatbotResponse = await handleUserQuestion(userQuestion);
        if (!chatbotResponse) {
            // Si no hay respuesta, redirige a WhatsApp
            const whatsappNumber = '+523334648999';  // Número de WhatsApp del capacitador
            const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Hola,%20tengo%20una%20pregunta:%20${encodeURIComponent(userQuestion)}`;
            res.json({ response: `No se encontró una respuesta, puedes contactar al capacitador en WhatsApp: ${whatsappUrl}`, whatsappRedirect: whatsappUrl });
        } else {
            res.json({ response: chatbotResponse });
        }
    } catch (error) {
        console.error('Error al manejar la pregunta del usuario:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

module.exports = { chatbotHandler };
