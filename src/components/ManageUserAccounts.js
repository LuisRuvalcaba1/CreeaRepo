// ManageUserAccounts.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './ManageUserAccounts.css';

const ManageUserAccounts = () => {
    const [advisors, setAdvisors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAdvisor, setExpandedAdvisor] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const response = await fetch('/api/get-advisors');
                const data = await response.json();
                setAdvisors(data);
            } catch (error) {
                console.error('Error al obtener asesores:', error);
            }
        };
        fetchAdvisors();
    }, []);

    const handleExpandAdvisor = (id) => {
        setExpandedAdvisor(expandedAdvisor === id ? null : id);
    };

    const filteredAdvisors = advisors.filter((advisor) =>
        advisor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-accounts-container">
            <Header />
            <div className="manage-accounts-content">
                <h2>Manejo de Cuentas de Usuario</h2>
                <input
                    type="text"
                    placeholder="Buscar asesor por nombre"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <ul className="advisor-list">
                    {filteredAdvisors.map((advisor) => (
                        <li key={advisor.id} className="advisor-item">
                            <div onClick={() => handleExpandAdvisor(advisor.id)}>
                                <span>{advisor.name}</span> - {advisor.agentNumber}
                            </div>
                            {expandedAdvisor === advisor.id && (
                                <ul className="client-list">
                                    {advisor.clients.map((client) => (
                                        <li key={client.id} className="client-item">
                                            <span>{client.name}</span>
                                            <button onClick={() => navigate(`/edit-client/${client.id}`)}>
                                                Editar Cliente
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button onClick={() => navigate(`/edit-advisor/${advisor.id}`)}>
                                Editar Asesor
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Footer />
        </div>
    );
};

export default ManageUserAccounts;
