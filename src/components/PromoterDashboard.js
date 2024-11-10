import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';
import './PromoterDashboard.css';
import axios from 'axios';

const PromoterDashboard = () => {
    const [advisors, setAdvisors] = useState([]);
    const [expandedAdvisor, setExpandedAdvisor] = useState(null);
    const [events, setEvents] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);

    useEffect(() => {
        axios.get('/api/advisors-with-clients')
            .then((response) => {
                setAdvisors(response.data); 
            })
            .catch((error) => {
                console.error('Error al obtener la lista de asesores:', error);
            });

        // Simulando eventos
        setEvents([
            { date: '2024-09-10', event: 'Reunión con cliente' },
            { date: '2024-09-11', event: 'Cita de presentación' }
        ]);

        // Llamada API para obtener tipo de cambio
        axios.get('https://api.exchangerate-api.com/v4/latest/USD')
            .then((response) => {
                setExchangeRates({ usd: response.data.rates.MXN, udi: 6.57 });
            });
    }, []);

    const toggleExpandAdvisor = (id) => {
        setExpandedAdvisor(expandedAdvisor === id ? null : id);
    };

    const toggleExpandProduct = (product) => {
        setExpandedProduct(expandedProduct === product ? null : product);
    };

    const closeChatbot = () => {
        setShowChatbot(false);
    };

    return (
        <div className="promoter-dashboard">
            <Header />

            <div className="main-content">
                <div className="left-section">
                    <button className="account-btn container">Mi cuenta</button>

                    <div className="products-section container">
                        <h2>Productos</h2>
                        <div className="product-options">
                            <button onClick={() => toggleExpandProduct('Imagina Ser')}>Imagina Ser</button>
                            <button onClick={() => toggleExpandProduct('Star Dotal')}>Star Dotal</button>
                            <button onClick={() => toggleExpandProduct('Orvi 99')}>Orvi 99</button>
                            <button onClick={() => toggleExpandProduct('Vida Mujer')}>Vida Mujer</button>
                            <button onClick={() => toggleExpandProduct('SeguBeca')}>SeguBeca</button>
                        </div>
                        {expandedProduct && (
                            <div className="product-info">
                                {expandedProduct === 'Imagina Ser' && <p>Información general sobre Imagina Ser...</p>}
                                {expandedProduct === 'Star Dotal' && <p>Información general sobre Star Dotal...</p>}
                                {expandedProduct === 'Orvi 99' && <p>Información general sobre Orvi 99...</p>}
                                {expandedProduct === 'Vida Mujer' && <p>Información general sobre Vida Mujer...</p>}
                                {expandedProduct === 'SeguBeca' && <p>Información general sobre SeguBeca...</p>}
                            </div>
                        )}
                    </div>

                    <div className="advisors-section container">
                        <h2>Asesores</h2>
                        {advisors.map((advisor) => (
                            <div key={advisor.id} className="advisor">
                                <div onClick={() => toggleExpandAdvisor(advisor.id)}>
                                    <span className="bold">{advisor.name}</span> - {advisor.agentNumber}
                                </div>
                                {expandedAdvisor === advisor.id && (
                                    <ul className="clients-list">
                                        {advisor.clients.map((client, index) => (
                                            <li key={index}>{client}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="renewals-section container">
                        <h2>Renovaciones del mes</h2>
                        <p>Renovación de cliente X - Septiembre 2024</p>
                        <p>Renovación de cliente Y - Septiembre 2024</p>
                    </div>

                    <button className="presentation-btn container">Presentaciones con Rendimientos Financieros</button>
                </div>

                <div className="right-section">
                    <div className="agenda-section container">
                        <h2>Calendario - {new Date().toLocaleDateString()}</h2>
                        <ul>
                            {events.map((event, index) => (
                                <li key={index}>{event.event} - {event.date}</li>
                            ))}
                        </ul>
                        <button className="schedule-event-btn">Agendar Evento</button>
                    </div>

                    <div className="exchange-rate-section container">
                        <h2>Tipo de Cambio</h2>
                        <p>Dólar: {exchangeRates.usd ? exchangeRates.usd.toFixed(2) : 'Cargando...'} MXN</p>
                        <p>UDI: {exchangeRates.udi} MXN</p>
                    </div>

                    <div className="virtual-assistant-section container">
                        <h2>Asistente Virtual</h2>
                        <button className="open-assistant-btn" onClick={() => setShowChatbot(true)}>Abrir Asistente</button>
                    </div>
                </div>
            </div>

            {showChatbot && (
                <div className="chatbot-modal">
                    <div className="chatbot-modal-content">
                        <span className="close-button" onClick={closeChatbot}>&times;</span>
                        <Chatbot userType="promotor" closeChatbot={closeChatbot} />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default PromoterDashboard;
