import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [clientOptions, setClientOptions] = useState([]); // Opciones de últimos clientes

    // Efecto para cargar dinámicamente los clientes
    useEffect(() => {
        const loadClients = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/clients'); // Ejemplo de endpoint
                setClientOptions(response.data.clients); // Actualiza las opciones de clientes
            } catch (error) {
                console.error('Error al cargar los clientes:', error);
            }
        };

        loadClients(); // Carga los clientes al montar el componente
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
    
        const userMessage = input.toLowerCase();
        setInput(''); // Limpia el input inmediatamente
    
        // Verificar si la última respuesta fue una invitación a contactar a un capacitador
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.text.includes("¿Deseas contactar a un capacitador?")) {
            if (userMessage === "si") {
                const whatsappNumber = '+523334648999'; // Número de WhatsApp del capacitador
                const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Hola,%20tengo%20una%20pregunta`;
                window.location.href = whatsappUrl;
                return;
            } else if (userMessage === "no") {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: "¿Tienes otra pregunta?" }
                ]);
                return;
            }
        }
    
        try {
            // Enviar la pregunta al backend
            const response = await axios.post('http://localhost:5000/api/chatbot', { userQuestion: userMessage });
    
            // Asegúrate de que botResponse sea un string
            const botResponse = typeof response.data.response === 'string' ? response.data.response : "No se encontró una respuesta adecuada. ¿Deseas contactar a un capacitador?";
            const contactOption = response.data.contactOption || false;
    
            // Añadir el mensaje del usuario
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'user', text: userMessage }
            ]);
    
            // Manejar la respuesta del chatbot y mostrar solo el texto deseado
            if (contactOption) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: "No encontré una respuesta a tu pregunta. ¿Deseas contactar a un capacitador?" }
                ]);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: botResponse }
                ]);
            }
        } catch (error) {
            console.error('Error al enviar la pregunta:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'user', text: userMessage },
                { sender: 'bot', text: 'Error al obtener respuesta' }
            ]);
        }
    };
    
    
    return (
        <div className="chatbot-content">
            {/* Renderizado de los mensajes */}
            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
            </div>

            <div className="chatbot-menu">
                <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                    <option value="">Selecciona una opción</option>
                    <option value="faq">Preguntas y Respuestas</option>
                    <option value="product-suggestions">Sugerencias de Productos</option>
                </select>
            </div>

            {selectedOption === 'product-suggestions' && (
                <div className="client-menu">
                    <select>
                        <option value="">Selecciona un cliente</option>
                        {clientOptions.map((client, index) => (
                            <option key={index} value={client}>{client}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                />
                <button onClick={handleSendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default Chatbot;
